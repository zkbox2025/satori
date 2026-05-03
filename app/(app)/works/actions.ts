//app/(app)/works/actions.ts
//記事一覧ページの中の記事の削除と、記事詳細ページの記事の削除と公開/非公開変更アクション
"use server";

import { redirect, notFound } from "next/navigation";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { prisma } from "@/src/infrastructure/prisma/client";

//記事削除アクション
export async function deleteWorkAction(
  workId: string,
  redirectTo = "/works"
) {
  const user = await getRequiredAuthUser();

  const work = await prisma.work.findFirst({
    where: {
      id: workId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!work) {
      notFound();
    }

  await prisma.work.delete({
    where: {
      id: work.id,
    },
  });

  redirect(redirectTo);
}

//記事公開/非公開変更アクション
export async function setWorkVisibilityAction(
  workId: string,
  visibility: "PUBLIC" | "PRIVATE"
) {
  const user = await getRequiredAuthUser();

  const work = await prisma.work.findFirst({
    where: {
      id: workId,
      userId: user.id,
      status: "PUBLISHED",
    },
    select: {
      id: true,
    },
  });

  if (!work) {
      notFound();
    }

  await prisma.work.update({
    where: {
      id: work.id,
    },
    data: {
      visibility,
    },
  });

  redirect(`/users/${user.id}/works/${work.id}`);
}