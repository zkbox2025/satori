//app/(app)/ai/ai-action-state.ts
//AIによる作品/フィードバック生成の処理結果をボタン近くに表示するための型定義と初期値

export type AiActionState = {
  error: string | null;
};

export const initialAiActionState: AiActionState = {
  error: null,
};