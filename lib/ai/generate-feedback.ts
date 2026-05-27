//lib/ai/generate-feedback.ts
//フィードバック生成のためのスナップショットを含めたプロンプトをAIに送り結果をもらう関数

import { callLLMText } from "@/lib/ai/callLLM";
import { buildFeedbackPrompts } from "@/lib/ai/prompts/feedback";

type Params = {
  title: string;
  content: string;
  genre: string;
};

export async function generateFeedbackFromWork({ title, content, genre }: Params) {
  const { systemPrompt, userPrompt, promptVersion } =
    buildFeedbackPrompts({ title, content, genre });

  const result = await callLLMText({
    systemPrompt,
    userPrompt,
    
  });

  return {
    ...result,
    promptVersion,
    systemPrompt,
    userPrompt,
  };
}