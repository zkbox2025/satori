//lib/ai/persistence/generated-content.ts
//記事生成の結果を保存する関数

import { prisma } from "@/src/infrastructure/prisma/client";
import type { LLMUsage } from "@/lib/ai/callLLM";
import type { Prisma } from "@prisma/client";

type SaveGeneratedSuccessParams = {
  workId: string;
  userId: string;
  title: string;
  generatedText: string;
  style: "POEM";
  visibility: "PUBLIC" | "PRIVATE";
  prompt: string;
  inputSnapshot: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;//「通常のJSONデータ」のすべてもしくはnullが入っていることを示す型（unknownだと範囲が広すぎてエラーになるため）
  resultJson: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;//「通常のJSONデータ」のすべてもしくはnullが入っていることを示す型（unknownだと範囲が広すぎてエラーになるため）
  modelName: string | null;
  usage: LLMUsage;
  promptVersion: number;
  providerRequestId: string | null;
};

export async function saveGeneratedContentSuccess({
  workId,
  userId,
  title,
  generatedText,
  style,
  visibility,
  prompt,
  inputSnapshot,
  resultJson,
  modelName,
  usage,
  promptVersion,
  providerRequestId,
}: SaveGeneratedSuccessParams) {
  return prisma.generatedContent.create({
    data: {
      title,
      generatedText,
      workId,
      userId,
      visibility,
      style,
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

type SaveGeneratedErrorParams = {
  workId: string;
  userId: string;
  style: "POEM";
  inputSnapshot: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;//「通常のJSONデータ」のすべてもしくはnullが入っていることを示す型（unknownだと範囲が広すぎてエラーになるため）
  errorMessage: string;
};

export async function saveGeneratedContentError({
  workId,
  userId,
  style,
  inputSnapshot,
  errorMessage,
}: SaveGeneratedErrorParams) {
  return prisma.generatedContent.create({
    data: {
      title: "生成失敗",
      generatedText: "",
      workId,
      userId,
      visibility: "PRIVATE",
      style,
      inputSnapshot,
      status: "ERROR",
      errorMessage,
    },
  });
}