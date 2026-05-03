//app/(app)/settings/page.tsx

import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";//ユーザー情報を取得する関数
import { findMySettingsProfile } from "@/lib/repositories/user";//設定ページで使うプロフィール情報を取得するための関数
import SettingsForm from "@/components/settings/settings-form";//プロフィールを引数とする設定画面のユーザークラインアント関数

export default async function SettingsPage() {
  const user = await getRequiredAuthUser();//ユーザー情報取得(ログインしていなければログインページへとばす)
  const profile = await findMySettingsProfile(user.id);////設定ページで使うプロフィール情報を取得する

  return <SettingsForm profile={profile} />;//プロフィールを引数とする設定画面のユーザークラインアント関数を実行
}