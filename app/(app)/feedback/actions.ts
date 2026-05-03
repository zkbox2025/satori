//app/(app)/feedback/actions.ts
"use server";

import { notFound , redirect } from "next/navigation";//ページがないのを表示したりページを遷移させたりするための関数をインポート
import { prisma } from "@/src/infrastructure/prisma/client";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";

export async function generateFeedbackAction(workId: string) {
  const user = await getRequiredAuthUser();

  const work = await prisma.work.findFirst({
    where: {
      id: workId,
      userId: user.id,
    },
  });

  if (!work) {
  notFound();
}

  const dummyFeedback = `これはダミーのフィードバックです。

タイトル: ${work.title}
ジャンル: ${work.genre}

この文章は、あとで本物のAIフィードバックに置き換えます。
今は Work ごとに1件だけ保存される導線確認が目的です。`;

  await prisma.feedback.upsert({//upsertは、whereの条件に合うレコードがあればupdate、なければcreateするという操作。ここでは、同じWorkに対してユーザーがフィードバックを複数保存できないようにするために使っている。
    where: {
      workId: work.id,
    },
    update: {
      content: dummyFeedback,
      userId: user.id,
    },
    create: {
      content: dummyFeedback,
      workId: work.id,
      userId: user.id,
    },
  });

  redirect(`/users/${user.id}/works/${work.id}`);
}

export async function deleteFeedbackAction(workId: string) {
  const user = await getRequiredAuthUser();

  const work = await prisma.work.findFirst({
    where: {
      id: workId,
      userId: user.id,
    },
  });

  if (!work) {
  notFound();
}

  await prisma.feedback.deleteMany({
    where: {
      workId: work.id,
      userId: user.id,
    },
  });

  redirect(`/users/${user.id}/works/${work.id}`);
}