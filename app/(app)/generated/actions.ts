//app/(app)/generated/actions.ts
//作品生成アクションのテスト用ダミーアクション及び
//作品一覧ページの中の作品の削除と、作品詳細ページの作品の削除と公開/非公開変更とタイトル変更アクション

"use server";

import { prisma } from "@/src/infrastructure/prisma/client";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { notFound , redirect } from "next/navigation";

export type GeneratedTitleActionResult = {
  error: string | null;
};


export async function createGeneratedContentAction(workId: string) {
  const user = await getRequiredAuthUser();

  //他人の記事をもとに作品を作らないためのサーバーアクション側の予防線（合わせて本人のみ作品にするボタンを表示するというUI表示規制もユーザー記事詳細ページで行なっている）
  const work = await prisma.work.findFirst({
  where: {
    id: workId,
    userId: user.id,
  },
});

if (!work) {
notFound();
}

  // ダミー生成
  const generatedText = `これはダミーの作品です。
元の記事ID: ${workId}
この文章は後でAIに置き換わります。`;

  const title = "生成された作品（仮）";

  const generatedContent = await prisma.generatedContent.create({
    data: {
      title,
      generatedText,
      workId,
      userId: user.id,
      visibility: "PUBLIC",
      modelName: "dummy",
      style: "POEM",
    },
  });

  redirect(`/users/${user.id}/generated/${generatedContent.id}`);
}


//作品一覧にある作品および作品詳細ページにある作品を削除するアクション関数
export async function deleteGeneratedAction(
  generatedId: string,
  redirectTo = "/generated"
) {
  const user = await getRequiredAuthUser();

  const generated = await prisma.generatedContent.findFirst({
    where: {
      id: generatedId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!generated) {
    notFound();
  }


  await prisma.generatedContent.delete({
    where: {
      id: generated.id,
    },
  });

  redirect(redirectTo);
}

//作品詳細ページの作品の公開/非公開を変更するアクション関数
export async function setGeneratedVisibilityAction(
  generatedId: string,
  visibility: "PUBLIC" | "PRIVATE"
) {
  const user = await getRequiredAuthUser();

  const generated = await prisma.generatedContent.findFirst({
    where: {
      id: generatedId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

    if (!generated) {
    notFound();
  }

  await prisma.generatedContent.update({
    where: {
      id: generated.id,
    },
    data: {
      visibility,
    },
  });

  redirect(`/users/${user.id}/generated/${generated.id}`);
}

//作品詳細ページの作品のタイトルを変更するアクション関数
export async function updateGeneratedTitleAction(
  generatedId: string,
  formData: FormData
): Promise<GeneratedTitleActionResult> {
  const user = await getRequiredAuthUser();
  const title = String(formData.get("title") ?? "").trim();

    if (!title) {
    return { error: "タイトルは必須です。" };
  }

  const generated = await prisma.generatedContent.findFirst({
    where: {
      id: generatedId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!generated) {
    notFound();
  }

  await prisma.generatedContent.update({
    where: {
      id: generated.id,
    },
    data: {
      title,
    },
  });

  return { error: null };
}