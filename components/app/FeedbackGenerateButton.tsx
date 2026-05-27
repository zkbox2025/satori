//components/app/FeedbackGenerateButton.tsx
//フィードバック生成ボタンコンポーネント。AIによるフィードバック生成の処理結果をボタン近くに表示するための状態管理も行う。

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  initialAiActionState,
  type AiActionState,
} from "@/app/(app)/ai/ai-action-state";

type Props = {
  action: (state: AiActionState, formData: FormData) => Promise<AiActionState>;//formdataは形式上のもので（inputがないため）中身はない。
  label?: string;
  className?: string;
  pendingLabel?: string;
};


function SubmitButton({
  label,
  className,
  pendingLabel,
}: {
  label: string;
  className: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function FeedbackGenerateButton({
  action,
  label = "フィードバックを生成する",
  className = "rounded-md bg-black px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed",
  pendingLabel = "生成中...",
}: Props) {
  const [state, formAction] = useActionState(action, initialAiActionState);

    return (
    <div className="space-y-2">
      <form action={formAction}>
        <SubmitButton
          label={label}
          className={className}
          pendingLabel={pendingLabel}
        />
      </form>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}