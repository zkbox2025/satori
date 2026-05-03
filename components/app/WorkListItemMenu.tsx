//components/app/WorkListItemMenu.tsx
//記事一覧ページと下書き一覧ページの「編集」と「削除（モーダルと削除処理）」のコンポーネント
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import KebabMenu from "@/components/ui/KebabMenu";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { deleteWorkAction } from "@/app/(app)/works/actions";

type Props = {
  workId: string;
  redirectAfterDelete?: string;
};

export default function WorkListItemMenu({
  workId,
  redirectAfterDelete = "/works",
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);//削除確認のモーダルが開いているかのstate
  const [isPending, startTransition] = useTransition();//削除の処理が終わるまでの間、削除ボタンを「削除中...」にするためのstateと関数

  const handleDelete = () => {//削除ボタンが押された時の処理
    startTransition(async () => {
      await deleteWorkAction(workId, redirectAfterDelete);
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
        </div>
      </KebabMenu>

      <ConfirmModal
        open={deleteOpen}
        title="削除します。よろしいですか。"
        confirmLabel={isPending ? "削除中..." : "削除する"}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}