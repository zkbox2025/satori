//lib/ai/rate-limit.ts
//AIによる作品生成及びフィードバックのレート制限（１分間に生成3回まで）をかけるための関数群

import { prisma } from "@/src/infrastructure/prisma/client";

const WINDOW_MS = 60 * 1000;//1分をミリ秒に換算
const MAX_ATTEMPTS = 3;//1分間に3回まで


export class AiRateLimitError extends Error {//レート制限に引っかかったときのエラークラス
  constructor(message: string) {
    super(message);
    this.name = "AiRateLimitError";
  }
}

async function assertRateLimitAllowed(params: {//レート制限をチェックする関数。ユーザーIDとアクションの種類と、制限に引っかかったときのエラーメッセージを引数に取る。
  userId: string;
  action: "feedback_generation" | "generated_content_creation";
  message: string;
}) {
  const since = new Date(Date.now() - WINDOW_MS);//現在の時刻から1分を引いて1分前の時刻を計算する

  //ユーザーが１分以内に同じ生成を何回行ったかをカウントする。
  const count = await prisma.aiRateLimitEvent.count({
    where: {
      userId: params.userId,
      action: params.action,
      createdAt: {
        gte: since,//createdAtがsince（1分前以降の時刻）のものをカウントする。つまり、過去1分間の生成数を数える。
      },
    },
  });

  if (count >= MAX_ATTEMPTS) {//3回以上生成を行うとレート制限に引っかかりエラーを投げる
    throw new AiRateLimitError(params.message);
  }
}

async function recordRateLimitEvent(params: {//生成イベントをDBに記録する関数。ユーザーIDとアクションの種類を引数に取る。
  userId: string;
  action: "feedback_generation" | "generated_content_creation";
}) {
  await prisma.aiRateLimitEvent.create({
    data: {
      userId: params.userId,
      action: params.action,
    },
  });
}

//レート制限チェック関数を用いてフィードバック生成時のレート制限処理を行う
export async function assertFeedbackGenerationAllowed(userId: string) {
  await assertRateLimitAllowed({
    userId,
    action: "feedback_generation",
    message: "フィードバック生成は1分間に3回までです。少し待ってから試してください。",
  });
}

//フィードバック生成イベントを記録する関数
export async function recordFeedbackGenerationAttempt(userId: string) {
  await recordRateLimitEvent({
    userId,
    action: "feedback_generation",
  });
}

//レート制限チェック関数を用いて作品生成時のレート制限処理を行う
export async function assertGeneratedContentCreationAllowed(userId: string) {
  await assertRateLimitAllowed({
    userId,
    action: "generated_content_creation",
    message: "作品生成は1分間に3回までです。少し待ってから試してください。",
  });
}

//作品生成イベントを記録する関数
export async function recordGeneratedContentCreationAttempt(userId: string) {
  await recordRateLimitEvent({
    userId,
    action: "generated_content_creation",
  });
}