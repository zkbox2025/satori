//lib/auth/get-auth-user.ts
//ログイン中ユーザーを毎回取る関数をまとめたファイル

import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";

//自分専用ページなど、ログイン必須のページで使用する関数
// ログインしている場合はユーザー情報を返し、していない場合は/loginへ遷移させる
export async function getRequiredAuthUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

//公開詳細ページなど、ログインしているかどうかで閲覧ページが変わるところで使用する関数
// ログインしている場合はユーザー情報を返し、していない場合はnullを返す
export async function getOptionalAuthUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}