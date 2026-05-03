//components/ui/ConfirmModal.tsx
//・・・を押してプルダウンで選択した後のモーダルの共通コンポーネント（「タイトル」「クリック」「キャンセル」）
"use client";

import BaseModal from "@/components/ui/BaseModal";

type Props = {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  confirmLabel,
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
}: Props) {

  return (
     <BaseModal open={open} onClose={onCancel} maxWidthClassName="max-w-sm">
        <p className="mb-6 text-base font-medium">{title}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            {confirmLabel}
          </button>
        </div>
    </BaseModal>
  );
}