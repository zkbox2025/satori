"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/explore");
    router.refresh();
  };

  const handleSignup = async () => {
    setErrorMessage("");

    if (password !== passwordConfirm) {
      setErrorMessage("パスワード確認が一致しません。");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // メール確認なし設定ならこのままログイン状態になることが多い
    // メール確認あり設定だと session が null のこともある
    if (data.session) {
      router.push("/explore");
      router.refresh();
      return;
    }

    setErrorMessage(
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

            <button
              type="button"
              className="w-full rounded-md border px-4 py-2"
            >
              パスワードを忘れた方はこちら
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