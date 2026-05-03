//components/app/GeneratedActionsMenu.tsx
//作品のタイトル編集、削除、公開/非公開設定、PDF出力を行うメニューコンポーネント。生成物の詳細ページで使われている。
"use client";


import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import KebabMenu from "@/components/ui/KebabMenu";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  deleteGeneratedAction,
  setGeneratedVisibilityAction,
  updateGeneratedTitleAction,
} from "@/app/(app)/generated/actions";
import BaseModal from "@/components/ui/BaseModal";

type Props = {
  generatedId: string;
  currentTitle: string;
  currentVisibility: "PUBLIC" | "PRIVATE";
  redirectAfterDelete?: string;
};

export default function GeneratedActionsMenu({
  generatedId,
  currentTitle,
  currentVisibility,
  redirectAfterDelete = "/generated",
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [titleOpen, setTitleOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteGeneratedAction(generatedId, redirectAfterDelete);
    });
  };

  const handleVisibilityChange = (visibility: "PUBLIC" | "PRIVATE") => {
    startTransition(async () => {
      await setGeneratedVisibilityAction(generatedId, visibility);
    });
  };

  const handleTitleSave = () => {
    const formData = new FormData();
    formData.set("title", title);

    startTransition(async () => {//サーバーアクションの返り値を受け取るために、サーバーアクションの引数に初期状態とformDataを渡す形にしている
      const result = await updateGeneratedTitleAction(generatedId, formData);

      if (result.error) {
        setTitleError(result.error);
        return;
      }

      setTitleError(null);
      setTitleOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <KebabMenu>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setTitleOpen(true)}
            className="rounded px-3 py-2 text-left hover:bg-gray-100"
          >
            タイトル編集
          </button>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded px-3 py-2 text-left hover:bg-gray-100"
          >
            削除
          </button>

          <button
            type="button"
            onClick={() => setVisibilityOpen(true)}
            className="rounded px-3 py-2 text-left hover:bg-gray-100"
          >
            公開/非公開
          </button>

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
          window.open(
            `/api/generated/${generatedId}/pdf`,
            "_blank",
            "noopener,noreferrer"
          );
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
          

      <BaseModal
  open={titleOpen}
  onClose={() => {
    setTitle(currentTitle);
    setTitleError(null);
    setTitleOpen(false);
  }}
  maxWidthClassName="max-w-md"
>
  <h2 className="mb-4 text-xl font-bold">タイトル編集</h2>

  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full rounded-md border px-3 py-2"
  />

  {titleError && (
    <p className="mt-3 text-sm text-red-600">{titleError}</p>
  )}

  <div className="mt-4 flex justify-end gap-3">
    <button
      type="button"
      onClick={() => {
        setTitle(currentTitle);
        setTitleError(null);
        setTitleOpen(false);
      }}
      className="rounded-md border px-4 py-2"
    >
      キャンセル
    </button>

    <button
      type="button"
      onClick={handleTitleSave}
      className="rounded-md bg-black px-4 py-2 text-white"
    >
      保存
    </button>
  </div>
</BaseModal>
      </BaseModal>
    </>
  );
}