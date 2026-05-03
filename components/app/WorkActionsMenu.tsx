//components/app/WorkActionsMenu.tsx
//記事詳細ページの記事の「編集」「削除」「PDF出力」「公開/非公開切り替え」のコンポーネント(モーダルと削除処理)

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import KebabMenu from "@/components/ui/KebabMenu";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  deleteWorkAction,
  setWorkVisibilityAction,
} from "@/app/(app)/works/actions";
import BaseModal from "@/components/ui/BaseModal";

type Props = {
  workId: string;
  currentVisibility: "PUBLIC" | "PRIVATE";
  status: "DRAFT" | "PUBLISHED";
  redirectAfterDelete?: string;
};

export default function WorkActionsMenu({
  workId,
  currentVisibility,
  status,
  redirectAfterDelete = "/works",
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteWorkAction(workId, redirectAfterDelete);
    });
  };

  const handleVisibilityChange = (visibility: "PUBLIC" | "PRIVATE") => {
    startTransition(async () => {
      await setWorkVisibilityAction(workId, visibility);
    });
  };

  return (
    <>
      <KebabMenu>
        <div className="flex flex-col">
          <Link
            href={`/works/${workId}/edit`}
            className="rounded px-3 py-2 text-left hover:bg-gray-100"
          >
            編集
          </Link>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded px-3 py-2 text-left hover:bg-gray-100"
          >
            削除
          </button>

          {status === "PUBLISHED" && (
            <button
              type="button"
              onClick={() => setVisibilityOpen(true)}
              className="rounded px-3 py-2 text-left hover:bg-gray-100"
            >
              公開/非公開
            </button>
          )}

          <button
            type="button"
            onClick={() => setPdfOpen(true)}
            className="rounded px-3 py-2 text-left hover:bg-gray-100"
          >
            PDF出力
          </button>
        </div>
      </KebabMenu>

      <ConfirmModal
        open={deleteOpen}
        title="削除します。よろしいですか？"
        confirmLabel={isPending ? "削除中..." : "削除する"}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={pdfOpen}
        title="PDF出力しますか？"
        confirmLabel="出力"
        onCancel={() => setPdfOpen(false)}
        onConfirm={() => {
          window.open(`/api/works/${workId}/pdf`, "_blank", "noopener,noreferrer");
          setPdfOpen(false);
        }}
      />

      <BaseModal
  open={visibilityOpen}
  onClose={() => setVisibilityOpen(false)}
  maxWidthClassName="max-w-sm"
>
  <p className="mb-6 text-base font-medium">公開設定を変更しますか？</p>

  <div className="flex flex-col gap-3">
    <button
      type="button"
      onClick={() => handleVisibilityChange("PUBLIC")}
      className={`rounded-md border px-4 py-2 transition-all ${
        currentVisibility === "PUBLIC"
          ? "bg-black text-white shadow-lg"
          : "bg-white text-black hover:bg-gray-50"
      }`}
      disabled={currentVisibility === "PUBLIC"}
    >
      公開する
    </button>

    <button
      type="button"
      onClick={() => handleVisibilityChange("PRIVATE")}
      className={`rounded-md border px-4 py-2 transition-all ${
        currentVisibility === "PRIVATE"
          ? "bg-black text-white shadow-lg"
          : "bg-white text-black hover:bg-gray-50"
      }`}
      disabled={currentVisibility === "PRIVATE"}
    >
      非公開にする
    </button>

    <button
      type="button"
      onClick={() => setVisibilityOpen(false)}
      className="rounded-md border px-4 py-2"
    >
      キャンセル
    </button>
  </div>
</BaseModal>
    </>
  );
}