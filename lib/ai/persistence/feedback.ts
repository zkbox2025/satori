//lib/ai/persistence/feedback.ts
//フィードバック生成の結果を保存する関数

import { prisma } from "@/src/infrastructure/prisma/client";
import type { Prisma } from "@prisma/client";
import type { LLMUsage } from "@/lib/ai/callLLM";

type SaveFeedbackSuccessParams = {
  workId: string;
  userId: string;
  content: string;
  prompt: string;
  inputSnapshot: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;//「通常のJSONデータ」のすべてもしくはnullが入っていることを示す型（unknownだと範囲が広すぎてエラーになるため）
  resultJson: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;//「通常のJSONデータ」のすべてもしくはnullが入っていることを示す型（unknownだと範囲が広すぎてエラーになるため）
  modelName: string | null;
  usage: LLMUsage;
  promptVersion: number;
  providerRequestId: string | null;
};

export async function saveFeedbackSuccess({
  workId,
  userId,
  content,
  prompt,
  inputSnapshot,
  resultJson,
  modelName,
  usage,
  promptVersion,
  providerRequestId,
}: SaveFeedbackSuccessParams) {
  await prisma.feedback.upsert({
    where: { workId },
    update: {
      content,
      userId,
      prompt,
      inputSnapshot,
      resultJson,
      modelName,
      status: "SUCCESS",
      errorMessage: null,
      tokensInput: usage.inputTokens,
      tokensOutput: usage.outputTokens,
      promptVersion,
      providerRequestId,
    },
    create: {
      content,
      workId,
      userId,
      prompt,
      inputSnapshot,
      resultJson,
      modelName,
      status: "SUCCESS",
      errorMessage: null,
      tokensInput: usage.inputTokens,
      tokensOutput: usage.outputTokens,
      promptVersion,
      providerRequestId,
    },
  });
}

type SaveFeedbackErrorParams = {
  workId: string;
  userId: string;
  inputSnapshot: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;//「通常のJSONデータ」のすべてもしくはnullが入っていることを示す型（unknownだと範囲が広すぎてエラーになるため）
  errorMessage: string;
};

export async function saveFeedbackError({
  workId,
  userId,
  inputSnapshot,
  errorMessage,
}: SaveFeedbackErrorParams) {
  await prisma.feedback.upsert({
    where: { workId },
    update: {
      content: "",
      userId,
      inputSnapshot,
      status: "ERROR",
      errorMessage,
    },
    create: {
      content: "",
      workId,
      userId,
      inputSnapshot,
      status: "ERROR",
      errorMessage,
    },
  });
}