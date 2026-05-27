//lib/ai/prompts/generated-content.ts
//作品生成のためのプロンプトを作る関数

export const GENERATED_PROMPT_VERSION = 1;

type Params = {
  title: string;
  content: string;
  genre: string;
};

export function buildGeneratedContentPrompts({
  title,
  content,
  genre,
}: Params) {
  const systemPrompt = `
あなたは記事をもとに詩的な作品を生成する作家アシスタントです。
出力は必ず指定された JSON schema に従ってください。
title には作品タイトル、generatedText には作品本文を入れてください。
日本語で返してください。
`.trim();

  const userPrompt = `
以下の記事をもとに、独立した作品を1つ作ってください。

元記事タイトル: ${title}
ジャンル: ${genre}

本文:
${content}

条件:
- 元記事の感情や主題を踏まえる
- 説明ではなく作品として読める文体にする
- generatedText は 300〜1200文字程度
`.trim();

  return {
    systemPrompt,
    userPrompt,
    promptVersion: GENERATED_PROMPT_VERSION,
  };
}