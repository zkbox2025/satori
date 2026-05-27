//app/(editor)/works/actions.ts
//記事の新規作成と更新のアクションを定義するファイル
"use server";

import { redirect, notFound } from "next/navigation";//別のページに遷移させる関数
import { prisma } from "@/src/infrastructure/prisma/client";//DBを操作するための関数
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";//ログインしているユーザ情報を取得する関数
import { WORK_GENRES } from "@/src/constants/work-genres";//ジャンルの選択肢一覧のファイルをインポート

export type WorkActionState = {//エラーは文字列かnull（表示なし）になるという状態の型定義（新規作成関数と更新関数の返り値はこれ）
  error: string | null;
};



type ParsedWorkInput =//成功と失敗を分けた型定義（これをすることでのちに安全にエラー結果をリターンできる）
  | {
      success: true;
      data: {
        title: string;
        content: string;
        genre: string;
        visibility: "PUBLIC" | "PRIVATE";
        submitType: string;
      };
    }
  | {
      success: false;
      error: string;
    };

function parseInput(formData: FormData): ParsedWorkInput {//フォームの入力値を取り出してチェックして結果（ParsedWorkInput）を返すバリテーション関数
  const title = String(formData.get("title") ?? "").trim();//フォームに入力されたデータのタイトルが送信され取得する。
  const content = String(formData.get("content") ?? "").trim();
  const genre = String(formData.get("genre") ?? "").trim();
  const submitType = String(formData.get("submitType") ?? "draft");
  const rawVisibility = String(formData.get("visibility") ?? "PRIVATE");


  if (!title) {
    return { success: false, error: "タイトルは必須です。" };
  }

  if (!genre) {//そもそも選択されているかを判断する
    return { success: false, error: "ジャンルは必須です。" };
  }

  if (!WORK_GENRES.includes(genre as (typeof WORK_GENRES)[number])) {//送られてきたデータがリスト（WORK_GENRES）の中にあるかをチェック
    return { success: false, error: "ジャンルの選択が不正です。" };
  }

  if (rawVisibility !== "PUBLIC" && rawVisibility !== "PRIVATE") {
    return { success: false, error: "公開設定が不正です。" };
  }

  return {
    success: true,
    data: {
      title,
      content,
      genre,
      visibility: rawVisibility,
      submitType,
    },
  };
}

export async function createWorkAction(//記事新規作成をする関数
  _: WorkActionState,//一つ目の引数（＿：受け取るけど使わない）
  formData: FormData//二つ目の引数（入力値）
): Promise<WorkActionState> {//最終的にはエラーメッセージか成功時はnull(何も表示しない)を返す
  const user = await getRequiredAuthUser();//ログイン情報を取得

  const parsed = parseInput(formData);//入力値チェック&結果バリデーション関数に入力値を入れる

  if (!parsed.success) {//結果がサクセスではないならエラーを表示して終了
    return { error: parsed.error };
  }

  const { title, content, genre, visibility, submitType } = parsed.data;//バリデーション後（サクセス後）に必要な値をまとめて取り出す
  const isDraft = submitType === "draft";//以下、isDraft="draft"として扱う

  const work = await prisma.work.create({//DBのworkテーブルに保存する
    data: {
      title,
      content,
      genre,
      status: isDraft ? "DRAFT" : "PUBLISHED",
      visibility: isDraft ? "PRIVATE" : visibility,
      userId: user.id,
    },
  });

  if (isDraft) {//下書きで保存するなら下書き一覧ページに飛ぶ
    redirect("/works/drafts");
  }

  redirect(`/users/${user.id}/works/${work.id}`);//それ以外は記事詳細ページに飛ぶ
}


export async function updateWorkAction(
  workId: string,//一つ目の引数
  _: WorkActionState,//二つ目の引数（＿：受け取るけど使わない）
  formData: FormData//三つ目の引数（入力値）
): Promise<WorkActionState> {//最終的にはエラーメッセージか成功時はnull(何も表示しない)を返す
  const user = await getRequiredAuthUser();//ログイン情報を取得

  const parsed = parseInput(formData);//入力値チェック&結果バリデーション関数に入力値を入れる

  if (!parsed.success) {//結果がサクセスではないならエラーを表示して終了
    return { error: parsed.error };
  }

  const { title, content, genre, visibility, submitType } = parsed.data;//バリデーション後（サクセス後）に必要な値をまとめて取り出す
  const isDraft = submitType === "draft";//以下、isDraft="draft"として扱う

  const existingWork = await prisma.work.findFirst({
    where: {
      id: workId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingWork) {//記事が見つからない場合は404を表示
      notFound();
    }

  await prisma.work.update({//DBのworkテーブルの記事データを更新する
    where: {
      id: workId,
    },
    data: {
      title,
      content,
      genre,
      status: isDraft ? "DRAFT" : "PUBLISHED",
      visibility: isDraft ? "PRIVATE" : visibility,
    },
  });

  if (isDraft) {//下書き保存をしたら下書き一覧ページに飛ぶ
    redirect("/works/drafts");
  }

  redirect(`/users/${user.id}/works/${workId}`);//それ以外は記事詳細ページに飛ぶ
}
