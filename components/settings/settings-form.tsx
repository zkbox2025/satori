//components/settings/settings-form.tsx
//設定ページで使える入力画面コンポーネント(入力された値をアクション関数に渡す役割まである)

"use client";

import Image from 'next/image'//画像表示パーツをインポート
import { useRef, useState , useActionState } from "react";//useState:画面に表示されるデータを保存する箱。useRef:隠し選択ボタンを表示するためのもの
import {
  updateAvatarAction,
  updateBioAction,
  updateNameAction,
} from "@/app/(app)/settings/actions";//DB書き換えのサーバーアクション関数（フロントとバックの窓口関数）をインポート
import { initialSettingsActionState } from "@/app/(app)/settings/settings-action-state";
import BackButton from "@/components/app/BackButton";
import BaseModal from "@/components/ui/BaseModal";

type Props = {//引数を定義
  profile: {
    id: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
    email: string;
     }; 
};

export default function SettingsForm({ profile }: Props) {//プロフィールを引数とする設定画面のユーザークラインアント関数

  const [nameOpen, setNameOpen] = useState(false);//名前の変更ボタンを押すとtrueになりモーダルが出る（初期値：false）
  const [bioOpen, setBioOpen] = useState(false);//自己紹介の変更ボタンを押すとtrueになりモーダルが出る（初期値：faise）
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);//アイコン画像の変更ボタンを押すとtrueになりプルダウンが出る（初期値：false)

  const libraryInputRef = useRef<HTMLInputElement>(null);//プルダウン表示の選択ボタンの一つ目を表示（写真ライブラリ）
  const cameraInputRef = useRef<HTMLInputElement>(null);//プルダウン表示の選択ボタンの一つ目を表示（写真を撮る）

  const [nameState, nameFormAction] = useActionState(//画面切り替えなしで表示するためにuseActionstateを使う。
    updateNameAction,
    initialSettingsActionState
  );
  const [bioState, bioFormAction] = useActionState(
    updateBioAction,
    initialSettingsActionState
  );
  const [avatarState, avatarFormAction] = useActionState(
    updateAvatarAction,
    initialSettingsActionState
  );

  const displayName = profile.name ?? "未設定";//トップの画面上に出ている名前（未設定表示あり）
  const displayBio = profile.bio?.trim() ? profile.bio : "未設定";//トップの画面上に出ている自己紹介（未設定表示あり）
  const nameValue = profile.name ?? "";//モーダルに出ている名前（未設定なら空白）
  const bioValue = profile.bio ?? "";//モーダルに出ている自己紹介（未設定なら空白）

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-8 text-2xl font-bold">設定</h1>

      <div className="space-y-8">
        <section className="rounded-md border p-4">
          <p className="mb-2 font-semibold">アイコン画像</p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt="アイコン画像"
                  width={64}
                  height={64}
                  className="rounded-full object-cover aspect-square shrink-0"
                  unoptimized
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border text-sm text-gray-500">
                  未設定
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setAvatarMenuOpen((prev) => !prev)}
                className="rounded-md border px-4 py-2"
              >
                変更
              </button>

              {avatarMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAvatarMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-12 z-20 w-48 rounded-md border bg-white p-2 shadow">
                    <button
                      type="button"
                      onClick={() => {
                        libraryInputRef.current?.click();
                        setAvatarMenuOpen(false);
                      }}
                      className="block w-full rounded px-3 py-2 text-left hover:bg-gray-100"
                    >
                      写真ライブラリ
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        cameraInputRef.current?.click();
                        setAvatarMenuOpen(false);
                      }}
                      className="block w-full rounded px-3 py-2 text-left hover:bg-gray-100"
                    >
                      写真を撮る
                    </button>
                  </div>
                </>
              )}

              <form action={avatarFormAction}>
                <input
                  ref={libraryInputRef}
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                />
              </form>

              <form action={avatarFormAction}>
                <input
                  ref={cameraInputRef}
                  type="file"
                  name="avatar"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                />
              </form>

              {avatarState.error && (
                <p className="mt-2 text-sm text-red-600">{avatarState.error}</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-md border p-4">
          <p className="mb-2 font-semibold">名前</p>

          <div className="flex items-center justify-between gap-4">
            <p>{displayName}</p>

            <button
              type="button"
              onClick={() => setNameOpen(true)}
              className="rounded-md border px-4 py-2"
            >
              変更
            </button>
          </div>
        </section>

        <section className="rounded-md border p-4">
          <p className="mb-2 font-semibold">自己紹介</p>

          <div className="flex items-start justify-between gap-4">
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {displayBio}
            </p>

            <button
              type="button"
              onClick={() => setBioOpen(true)}
              className="rounded-md border px-4 py-2"
            >
              変更
            </button>
          </div>
        </section>
      </div>

      <BaseModal
  open={nameOpen}
  onClose={() => setNameOpen(false)}
  maxWidthClassName="max-w-md"
>
  <h2 className="mb-4 text-xl font-bold">名前</h2>

  <form action={nameFormAction} className="space-y-4">
    <input
      name="name"
      defaultValue={nameValue}
      className="w-full rounded-md border px-3 py-2"
    />

    {nameState.error && (
      <p className="text-sm text-red-600">{nameState.error}</p>
    )}

    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setNameOpen(false)}
        className="rounded-md border px-4 py-2"
      >
        キャンセル
      </button>
      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        保存
      </button>
    </div>
  </form>
</BaseModal>

      <BaseModal
  open={bioOpen}
  onClose={() => setBioOpen(false)}
  maxWidthClassName="max-w-md"
>
  <h2 className="mb-4 text-xl font-bold">自己紹介</h2>

  <form action={bioFormAction} className="space-y-4">
    <textarea
      name="bio"
      defaultValue={bioValue}
      className="min-h-40 w-full rounded-md border px-3 py-2"
    />

    {bioState.error && (
      <p className="text-sm text-red-600">{bioState.error}</p>
    )}

    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setBioOpen(false)}
        className="rounded-md border px-4 py-2"
      >
        キャンセル
      </button>
      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        保存
      </button>
    </div>
  </form>
</BaseModal>

      <div className="mt-10">
        <BackButton fallbackPath="/explore" />
      </div>
    </main>
  );
}

//ユーザーが保存ボタン（type="submit"）を押す。
//ブラウザが 項目の値をすべて集め、FormData オブジェクトを作る。
//その FormData が、<form> の action に設定した formAction に自動的に渡される。
//formAction の中身である元の action（updateAvatarAction,updateBioAction,updateNameAction） が実行される。
//つまり、「入力値をform action でアクション関数へ放り投げる」という連携によって、入力値がアクションに届くようになっています
//そのアクションの戻り値をエラーで表示させる
  