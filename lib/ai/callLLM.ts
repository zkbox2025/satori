//lib/ai/callLLM.ts
//OPENAIとの窓口関数

import OpenAI from "openai";
import { z, toJSONSchema } from "zod";

const openai = new OpenAI({//
  apiKey: process.env.OPENAI_API_KEY,//環境変数からAPIキーを取得しOPENAIを呼び出す
});

const TEXT_MODEL = process.env.OPENAI_MODEL_TEXT ?? "gpt-4.1-mini";
const JSON_MODEL = process.env.OPENAI_MODEL_JSON ?? "gpt-4.1-mini";

function assertApiKey() {//APIキーが設定されているか確認する関数
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY が設定されていません。");
  }
}

export type LLMUsage = {//LLMの使用量を表す型
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

function getUsage(response: OpenAI.Responses.Response): LLMUsage {//LLMの使用量をレスポンスから取得する関数
  return {
    inputTokens: response.usage?.input_tokens ?? null,
    outputTokens: response.usage?.output_tokens ?? null,
    totalTokens: response.usage?.total_tokens ?? null,
  };
}

type CallLLMTextParams = {//テキストを生成するLLMへの引数の型
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
};

//フィードバック生成のためにAIを呼び出す関数
export async function callLLMText({
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxOutputTokens = 1200,
}: CallLLMTextParams) {
  assertApiKey();

  const response = await openai.responses.create({
    model: TEXT_MODEL,
    temperature,
    max_output_tokens: maxOutputTokens,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ],
  });

  const text = response.output_text?.trim();

  if (!text) {
    throw new Error("LLM のテキスト応答が空でした。");
  }

  return {
    text,
    modelName: TEXT_MODEL,
    providerRequestId: response.id ?? null,
    usage: getUsage(response),//トークン消費量をレスポンスから取得
    rawResponse: response,
  };
}

type CallLLMJsonParams<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  schemaName: string;
  temperature?: number;
  maxOutputTokens?: number;
};

//作品生成のためにAIを呼び出す関数
export async function callLLMJson<T>({
  systemPrompt,
  userPrompt,
  schema,
  schemaName,
  temperature = 0.8,
  maxOutputTokens = 1400,
}: CallLLMJsonParams<T>) {
  assertApiKey();

  const response = await openai.responses.create({
    model: JSON_MODEL,
    temperature,
    max_output_tokens: maxOutputTokens,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema: toJSONSchema(schema),
      },
    },
  });

  const rawText = response.output_text?.trim();

  if (!rawText) {
    throw new Error("LLM の JSON 応答が空でした。");
  }

  let json: unknown;

  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error("LLM の JSON 応答をパースできませんでした。");
  }

  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    throw new Error("LLM の JSON 応答が schema に一致しませんでした。");
  }

  return {
    data: parsed.data,
    modelName: JSON_MODEL,
    providerRequestId: response.id ?? null,
    usage: getUsage(response),
    rawResponse: response,
  };
}