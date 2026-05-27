//lib/ai/generate-generated-content.ts
//作品生成のためのスナップショットを含むプロンプトをAIに送り結果をもらう関数

import { callLLMJson } from "@/lib/ai/callLLM";
import { buildGeneratedContentPrompts } from "@/lib/ai/prompts/generated-content";
import { generatedContentSchema } from "@/lib/ai/schemas/generated-content";

type Params = {
  title: string;
  content: string;
  genre: string;
};

export async function generateContentFromWork({
  title,
  content,
  genre,
}: Params) {
  const { systemPrompt, userPrompt, promptVersion } =
    buildGeneratedContentPrompts( { title, content, genre } );

  const result = await callLLMJson({
    systemPrompt,
    userPrompt,
    schema: generatedContentSchema,//AIから返ってくるデータを定義して実際に検品する
    schemaName: "generated_content_result",
  });

  return {
    ...result,
    promptVersion,
    systemPrompt,
    userPrompt,
  };
}