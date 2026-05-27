//app/(auth)/login/page.tsx
//ログインとアカウント作成のページ。supabaseのブラウザ用クライアントを使ってユーザー操作（ログインとアカウント作成）をする。ログインとアカウント作成のモードを切り替えることができる。エラーメッセージや処理中の状態も表示する。
"use client";

import { useState } from "react";//データを覚えておく機能を使えるようにする関数をインポート
import { useRouter } from "next/navigation";//ページ遷移するための関数をインポート
import { createClient } from "@/src/infrastructure/supabase/client";//supabaseのブラウザ用クライアント（ユーザー操作用）をインポートする

type Mode = "login" | "signup";//ログインとアカウント作成のモードを切り替えるための型定義

export default function LoginPage() {
  const router = useRouter();//ページ遷移するための関数を呼び出す
  const supabase = createClient();//supabaseのブラウザ用クライアントを呼び出す

  const [mode, setMode] = useState<Mode>("login");//ログインとアカウント作成のモードを切り替えるためのstate。初期値は"login"（ログインモード）
  const [name, setName] = useState("");//アカウント作成のときにユーザーの名前を覚えておくためのstate。初期値は空文字
  const [email, setEmail] = useState(""); //メールアドレスを覚えておくためのstate。初期値は空文字
  const [password, setPassword] = useState("");//パスワードを覚えておくためのstate。初期値は空文字
  const [passwordConfirm, setPasswordConfirm] = useState("");//パスワード確認を覚えておくためのstate。初期値は空文字
  const [errorMessage, setErrorMessage] = useState("");//エラーメッセージを覚えておくためのstate。初期値は空文字
  const [loading, setLoading] = useState(false);//ログインやアカウント作成の処理中かどうかを覚えておくためのstate。初期値はfalse（処理中ではない）

  const handleLogin = async () => {//ログインボタンを押した時の処理をする関数
    setErrorMessage("");//エラーメッセージを空にして前回のメッセージを消す
    setLoading(true);//処理中であることを示すためにloadingをtrueにする

    const { error } = await supabase.auth.signInWithPassword({//supabaseのブラウザ用クライアントを使ってメアドとPWを使ってログインする。エラーはerrorに入る
      email,
      password,
    });

    setLoading(false);//処理が終わったのでloadingをfalseにする

    if (error) {//もしエラーならエラーメッセージをセットして処理が終わる
      setErrorMessage(error.message);
      return;
    }

    router.push("/explore");//ログイン成功したら作品一覧ページ（/explore）に遷移する
    router.refresh();//遷移先のページで最新のユーザー情報を取れるようにするためにページ（/explore）をリフレッシュする（画面を真っ白にせずにサーバーから最新データだけを取り直す）
  };

  const handleSignup = async () => {//アカウント作成ボタンを押した時の処理に関する関数
    setErrorMessage("");//エラーメッセージを空にして前回のメッセージを消す

    if (password !== passwordConfirm) {//もしPWとPW確認が違うなら以下のメッセージをセットして処理が終わる
      setErrorMessage("パスワード確認が一致しません。");
      return;
    }

    setLoading(true);//処理中であることを示すためにloadingをtrueにする

    const { data, error } = await supabase.auth.signUp({//supabaseのブラウザ用クライアントを使ってメールアドレスとPWでアカウント作成する。エラーはerrorに入る。dataにはセッション情報（ログイン情報）などが入る。options.data.nameにユーザーの名前も一緒に送る。これにより、ユーザーの名前もDBに保存されるようになる。
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    setLoading(false);//処理が終わったのでloadingをfalseにする

    if (error) {//もしエラーならエラーメッセージをセットして処理が終わる
      setErrorMessage(error.message);
      return;
    }

    // メール確認なし設定ならこのままログイン状態になることが多い
    // メール確認あり設定だと session が null のこともある
    if (data.session) {//supabaseAuthからセッション情報（トークン入りクッキー：ログインしている証明書）が発行され届いたらログイン成功と判断し、"/explore"にログイン状態で遷移させる
      router.push("/explore");
      router.refresh();//遷移先のページで最新のユーザー情報を取れるようにするためにページ（/explore）をリフレッシュする（画面を真っ白にせずにサーバーから最新データだけを取り直す）
      return;
    }

    setErrorMessage(//アカウント作成成功したら表示する
      "アカウントを作成しました。メール確認が必要な設定の場合は、確認後にログインしてください。"
    );
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold">satori</h1>

      <div className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-center text-xl font-semibold">
          ログイン / アカウント作成
        </h2>

        <label className="mb-2 block text-sm font-medium">モード</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="mb-4 w-full rounded-md border px-3 py-2"
        >
          <option value="login">ログイン</option>
          <option value="signup">アカウント作成</option>
        </select>

        {mode === "signup" && (
          <>
            <label className="mb-2 block text-sm font-medium">名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 w-full rounded-md border px-3 py-2"
            />
          </>
        )}

        <label className="mb-2 block text-sm font-medium">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border px-3 py-2"
        />

        <label className="mb-2 block text-sm font-medium">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-md border px-3 py-2"
        />

        {mode === "signup" && (
          <>
            <label className="mb-2 block text-sm font-medium">
              パスワード確認
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="mb-4 w-full rounded-md border px-3 py-2"
            />
          </>
        )}

        {errorMessage && (
          <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
        )}

        {mode === "login" ? (
          <>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="mb-3 w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>

          </>
        ) : (
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "作成中..." : "アカウント作成"}
          </button>
        )}
      </div>
    </main>
  );
}