//components/header/header-drawer.tsx
//ヘッダードロワーのコンポーネント
"use client";

import { useState } from "react";//データを覚えておくようにする関数をインポート
import Link from "next/link";//リンク先を作るコンポーネントをインポート
import { X, Menu } from "lucide-react";//三と×アイコンをインポート
import LogoutButton from "./logout-button";//ログアウトボタンをインポート
import UserHeaderCard from "@/components/user/UserHeaderCard";

type Props = {//引数の型定義
  userId: string;
  name: string;
  avatarUrl: string | null;//ユーザーの画像URL。nullの場合もある。
};

export default function HeaderDrawer({ userId, name, avatarUrl }: Props) {//ヘッダードロワーのメイン関数
  const [open, setOpen] = useState(false);//ドロワーが開いているかどうかを覚えておくためのstate。初期値はfalse（閉じている）

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}//このボタンをクリックしたときにopenの値を反転させる。openがfalseならtrueに、trueならfalseになる。これにより、ドロワーの開閉ができるようになる
        className="rounded-md border p-2"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}//ドロワーの背景部分をクリックしたらfalseになりドロワーが閉じるようになる
        >
          <div
            className="ml-auto flex h-full w-80 flex-col bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}//ドロワーの中の部分をクリックしたときにクリックイベントが背景部分に伝わるのを止める。これにより、ドロワーの中をクリックしてもドロワーが閉じないようになる
          >
            <div className="mb-6">
  <UserHeaderCard
    name={name}
    avatarUrl={avatarUrl}
    nameHref={`/users/${userId}`}
    onNameClick={() => setOpen(false)}
    rightAction={
      <button
        onClick={() => setOpen(false)}
        className="rounded-md border p-2"
        aria-label="閉じる"
      >
        <X className="h-4 w-4" />
      </button>
    }
  />
</div>

            <div className="mb-6 grid grid-cols-2 gap-2">
              <Link
                href={`/users/${userId}`}
                className="rounded-md border px-4 py-3 text-center"
                onClick={() => setOpen(false)}
              >
                マイページ
              </Link>
              <Link
                href="/settings"
                className="rounded-md border px-4 py-3 text-center"
                onClick={() => setOpen(false)}
              >
                設定
              </Link>
            </div>

            <div className="mb-2 text-sm font-semibold">記事 / 作品</div>
            <div className="mb-6 flex flex-col">
              <Link href="/works" className="py-2" onClick={() => setOpen(false)}>
                自分の記事
              </Link>
              <Link
                href="/works/drafts"
                className="py-2"
                onClick={() => setOpen(false)}
              >
                下書き
              </Link>
              <Link
                href="/generated"
                className="py-2"
                onClick={() => setOpen(false)}
              >
                自分の作品
              </Link>
            </div>

            <div className="mb-2 text-sm font-semibold">いいね</div>
            <div className="mb-6 flex flex-col">
              <Link
                href="/likes/works"
                className="py-2"
                onClick={() => setOpen(false)}
              >
                記事
              </Link>
              <Link
                href="/likes/generated"
                className="py-2"
                onClick={() => setOpen(false)}
              >
                作品
              </Link>
            </div>

            <div className="mt-auto">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}