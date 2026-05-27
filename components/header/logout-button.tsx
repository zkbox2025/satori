//components/header/logout-button.tsx
//ログアウトボタンのコンポーネント。supabaseのブラウザ用クライアントを使ってユーザー操作（ログアウト）をする。ログアウトしたらメインページ（/explore）へ遷移する。
"use client";

import { useRouter } from "next/navigation";//ページ遷移するための関数をインポート
import { createClient } from "@/src/infrastructure/supabase/client";//supabaseのブラウザ用クライアント（ユーザー操作用）をインポート

export default function LogoutButton() {
  const router = useRouter();//ページ遷移するための関数を呼び出す
  const supabase = createClient();//supabaseのブラウザ用クライアント（ユーザー操作用）を呼び出す

  const handleLogout = async () => {//ログアウトボタンを押した時の処理を行う関数
    await supabase.auth.signOut();//supabaseのブラウザ用クライアントを使ってログアウトする。これにより、supabaseAuthのセッション情報（トークン入りクッキー：ログインしている証明書）が消える
    router.push("/explore");//ログアウトしたらメインページ（/explore）へ遷移する
    router.refresh();//遷移先のページで最新のユーザー情報を取れるようにするためにページ（/explore）をリフレッシュする（画面を真っ白にせずにサーバーから最新データだけを取り直す）
  };

  return (
    <button
      onClick={handleLogout}//ログアウトボタンをクリックしたときにhandleLogout関数を呼び出す
      className="w-full rounded-md border px-4 py-3 text-left"
    >
      ログアウト
    </button>
  );
}