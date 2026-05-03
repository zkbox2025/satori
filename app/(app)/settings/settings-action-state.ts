//app/(app)/settings/settings-action-state.ts

//設定時のエラー表示に使うタイプ関数（メインと初期）

export type SettingsActionState = {//エラーは文字列かnull（表示なし）になるという状態の型定義
  error: string | null;
};

export const initialSettingsActionState: SettingsActionState = {
  error: null,
};