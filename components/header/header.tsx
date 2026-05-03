//components/header/header.tsx
//ヘッダーのコンポーネント。ユーザーのログイン状態によってどのページに遷移するかを切り替える

import Link from "next/link";//リンク先を作るコンポーネントをインポート
import { Pencil } from "lucide-react";//鉛筆マークをインポート
import { createClient } from "@/src/infrastructure/supabase/server";//supabaseのサーバー用クライアントをインポート
import { findHeaderData } from "@/lib/repositories/user";//DBにヘッダーで使う情報をとりに行く関数
import HeaderDrawer from "./header-drawer";//ヘッダードロワーをインポート

export default async function Header() {//ヘッダーのメイン関数
  const supabase = await createClient();//supabaseのサーバー用クライアントを呼び出す

  const {
    data: { user },
  } = await supabase.auth.getUser();//supabaseのサーバー用クライアントを使ってユーザー情報を取る。これにより、ログインしているかどうかがわかる

  if (!user) {//ユーザーが取得できない場合は（ログインしてない場合は）、ログインページへのリンクボタンを表示する
    return (
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/explore" className="text-xl font-bold">
          satori
        </Link>

        <Link
          href="/login"
          className="rounded-md border px-3 py-2 text-sm"
        >
          ログイン
        </Link>
      </header>
    );
  }

  const { profile, worksCount, generatedContentsCount } =
  await findHeaderData(user.id);


 return (
  <header className="flex w-full items-center justify-between border-b px-4 py-3">
    <Link href="/explore" className="text-xl font-bold">
      satori
    </Link>

    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 text-sm">
        <p>記事 {worksCount}件</p>
        <p>作品 {generatedContentsCount}件</p>
      </div>

      <Link
        href="/works/new"
        className="rounded-md border p-2"
        aria-label="新規作成"//目には見えないけど読み上げソフトには伝わる説明。これによりアクセシビリティが向上する
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <HeaderDrawer
        userId={user.id}
        name={profile?.name ?? user.email ?? "ユーザー"}//名前があればそれを使いなければメアドを使いどちらもなければユーザーという固定文字を使う
        avatarUrl={profile?.avatarUrl ?? null}//プロフィール画像があればそれを使いなければnullを渡す
      />
    </div>
  </header>
);
}