//app/(app)/generated/GeneratedListItemMenu.tsx
//作品一覧ページの作品の「削除」のコンポーネント(モーダルと削除処理)

"use client";

import { useState, useTransition } from "react";
import KebabMenu from "@/components/ui/KebabMenu";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { deleteGeneratedAction } from "@/app/(app)/generated/actions";

type Props = {
  generatedId: string;
  redirectAfterDelete?: string;
};

export default function GeneratedListItemMenu({
  generatedId,
  redirectAfterDelete = "/generated",
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);//削除確認のモーダルが開いているかのstate
  const [isPending, startTransition] = useTransition();//削除の処理が終わるまでの間、削除ボタンを「削除中...」にするためのstateと関数

  const handleDelete = () => {//削除処理の関数
    startTransition(async () => {
      await deleteGeneratedAction(generatedId, redirectAfterDelete);
    });
  };

  return (
    <>
      <KebabMenu>
        <div className="flex flex-col">
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