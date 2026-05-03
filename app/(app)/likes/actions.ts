//app/(app)/likes/actions.ts
"use server";

import { notFound , redirect } from "next/navigation";
import { prisma } from "@/src/infrastructure/prisma/client";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";

//記事へのいいねトグルアクション

export async function toggleWorkLikeAction(workId: string) {
  const user = await getRequiredAuthUser();

  const work = await prisma.work.findFirst({
    where: {
      id: workId,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
  });

  if (!work) {
  notFound();
  }

  const existing = await prisma.workLike.findFirst({
    where: {
      userId: user.id,
      workId,
    },
  });

  if (existing) {
    await prisma.workLike.delete({
      where: {
        id: existing.id,
      },
    });
  } else {
    await prisma.workLike.create({
      data: {
        userId: user.id,
        workId,
      },
    });
  }

  redirect(`/users/${work.userId}/works/${workId}`);
}

//作品へのいいねトグルアクション

export async function toggleGeneratedLikeAction(generatedId: string) {
  const user = await getRequiredAuthUser();

  const generatedContent = await prisma.generatedContent.findFirst({
    where: {
      id: generatedId,
      visibility: "PUBLIC",
    },
  });

  if (!generatedContent) {
  notFound();
  }

  const existing = await prisma.generatedContentLike.findFirst({
    where: {
      userId: user.id,
      generatedContentId: generatedId,
    },
  });

  if (existing) {
    await prisma.generatedContentLike.delete({
      where: {
        id: existing.id,
      },
    });
  } else {
    await prisma.generatedContentLike.create({
      data: {
        userId: user.id,
        generatedContentId: generatedId,
      },
    });
  }

  redirect(`/users/${generatedContent.userId}/generated/${generatedId}`);
}