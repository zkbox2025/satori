//app/(app)/generated/actions.ts
//作品生成アクション及び
//作品一覧ページの中の作品の削除と、作品詳細ページの作品の削除と公開/非公開変更とタイトル変更アクション

"use server";

import { prisma } from "@/src/infrastructure/prisma/client";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { notFound, redirect } from "next/navigation";
import { generateContentFromWork } from "@/lib/ai/generate-generated-content";
import { buildGeneratedContentSnapshot } from "@/lib/ai/snapshots/generated-content";
import {
  saveGeneratedContentError,
  saveGeneratedContentSuccess,
} from "@/lib/ai/persistence/generated-content";
import {
  AiRateLimitError,
  assertGeneratedContentCreationAllowed,
  recordGeneratedContentCreationAttempt,
} from "@/lib/ai/rate-limit";
import type { AiActionState } from "@/app/(app)/ai/ai-action-state";

export async function createGeneratedContentAction(
  workId: string,
  state: AiActionState,
  formData: FormData
): Promise<AiActionState> {
  void state;
  void formData;

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

  try {
    await assertGeneratedContentCreationAllowed(user.id);
    await recordGeneratedContentCreationAttempt(user.id);
  } catch (error) {
    if (error instanceof AiRateLimitError) {
      return { error: error.message };
    }
    throw error;
  }

  const inputSnapshot = buildGeneratedContentSnapshot({
    work,
    style: "POEM",
  });

  let redirectId: string;
  let showSuccess = false;

  try {
    const aiResult = await generateContentFromWork({
      title: work.title,
      content: work.content,
      genre: work.genre,
    });

    const generatedContent = await saveGeneratedContentSuccess({
      workId: work.id,
      userId: user.id,
      title: aiResult.data.title,
      generatedText: aiResult.data.generatedText,
      style: "POEM",
      visibility: "PUBLIC",
      prompt: JSON.stringify({
        systemPrompt: aiResult.systemPrompt,
        userPrompt: aiResult.userPrompt,
      }),
      inputSnapshot,
      resultJson: aiResult.data,
      modelName: aiResult.modelName,
      usage: aiResult.usage,
      promptVersion: aiResult.promptVersion,
      providerRequestId: aiResult.providerRequestId,
    });

    redirectId = generatedContent.id;
    showSuccess = true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "作品生成に失敗しました。";

    const failedRecord = await saveGeneratedContentError({
      workId: work.id,
      userId: user.id,
      style: "POEM",
      inputSnapshot,
      errorMessage: message,
    });

    redirectId = failedRecord.id;
  }

  const successQuery = showSuccess ? "?generated=success" : "";
  redirect(`/users/${user.id}/generated/${redirectId}${successQuery}`);
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
export type GeneratedTitleActionResult = {
  error: string | null;
};


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