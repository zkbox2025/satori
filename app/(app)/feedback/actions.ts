//app/(app)/feedback/actions.ts
//このファイルでは、フィードバック生成と削除のアクションを定義している。これらのアクションは、ユーザーが自分の作品に対してフィードバックを生成したり削除したりするためのサーバーサイドの処理を担当する。
"use server";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/src/infrastructure/prisma/client";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { generateFeedbackFromWork } from "@/lib/ai/generate-feedback";
import { buildFeedbackSnapshot } from "@/lib/ai/snapshots/feedback";
import {
  saveFeedbackError,
  saveFeedbackSuccess,
} from "@/lib/ai/persistence/feedback";
import {
  AiRateLimitError,
  assertFeedbackGenerationAllowed,
  recordFeedbackGenerationAttempt,
} from "@/lib/ai/rate-limit";
import type { AiActionState } from "@/app/(app)/ai/ai-action-state";

export async function generateFeedbackAction(
  workId: string,
  state: AiActionState,
  formData: FormData
): Promise<AiActionState> {
  //stateとformDataはuseActionStateから渡されるが、今回はAIアクションの処理結果を表示するための引数としてのみ使うので、ここでは直接は使用せず、型定義上引数として受け取るだけにしている。initialStateは前回の結果を表示する際に使うし、formdataは入力値がある場合に使うので今回はどちらもないためvoidする
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
    await assertFeedbackGenerationAllowed(user.id);
    await recordFeedbackGenerationAttempt(user.id);
  } catch (error) {
    if (error instanceof AiRateLimitError) {
      return { error: error.message };
    }
    throw error;
  }

  const inputSnapshot = buildFeedbackSnapshot({ work });
  let showSuccess = false;//フィードバック生成が成功したかどうかのフラグ。これをもとにリダイレクト先のURLにクエリパラメータをつけるかどうかを決める

  try {
    const aiResult = await generateFeedbackFromWork({
      title: work.title,
      content: work.content,
      genre: work.genre,
    });

    await saveFeedbackSuccess({
      workId: work.id,
      userId: user.id,
      content: aiResult.text,
      prompt: JSON.stringify({
        systemPrompt: aiResult.systemPrompt,
        userPrompt: aiResult.userPrompt,
      }),
      inputSnapshot,
      resultJson: { text: aiResult.text },
      modelName: aiResult.modelName,
      usage: aiResult.usage,
      promptVersion: aiResult.promptVersion,
      providerRequestId: aiResult.providerRequestId,
    });

    showSuccess = true;//フィードバック生成が成功したのでフラグをtrueにする
    
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "フィードバック生成に失敗しました。";

    await saveFeedbackError({
      workId: work.id,
      userId: user.id,
      inputSnapshot,
      errorMessage: message,
    });
  }

  const successQuery = showSuccess ? "?feedback=success" : "";
  redirect(`/users/${user.id}/works/${work.id}${successQuery}`);
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