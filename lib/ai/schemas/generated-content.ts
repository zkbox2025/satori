//lib/ai/schemas/generated-content.ts
//AIが生成した作品結果を検品するためのスキーマ

import { z } from "zod";

export const generatedContentSchema = z.object({
  title: z.string().trim().min(1).max(80),
  generatedText: z.string().trim().min(1).max(4000),
});

export type GeneratedContentAIResult = z.infer<typeof generatedContentSchema>;