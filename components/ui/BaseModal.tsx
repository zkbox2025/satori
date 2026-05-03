//components/ui/BaseModal.tsx
//モーダルの外枠の共通化ファイル。BaseModalをConfirmModalが呼び出す形になっている。

"use client";

import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
};

export default function BaseModal({
  open,
  onClose,
  children,
  maxWidthClassName = "max-w-sm",
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full rounded-md bg-white p-6 ${maxWidthClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}