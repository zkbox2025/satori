//app/(app)/settings/actions.ts
//設定画面のユーザー情報変更についてバックエンドとフロントエンドを繋ぐ窓口

"use server";

import { redirect } from "next/navigation";//ページ遷移する際に使う関数
import { createClient } from "@/src/infrastructure/supabase/server";//サーバー用クライアントを作成する関数
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";//ログインを確認しユーザー情報を取得する関数
import {
  updateUserAvatarUrl,
  updateUserBio,
  updateUserName,
} from "@/lib/repositories/user";//アイコン画像、自己紹介、名前を設定ページで変更する関数
import type { SettingsActionState } from "./settings-action-state";


export async function updateNameAction(
  _: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {//入力値とState（初期値はnull）を引数とする名前変更のサーバーアクション関数
  const user = await getRequiredAuthUser();//ユーザー情報取得
  const rawName = String(formData.get("name") ?? "").trim();//formdataからnameを取り出して（文字列）、もしなければ空白、スペースが押されてたら除去して、rawnameという名前の定数とする

  if (!rawName) {//入力されたデータに名前がなければ以下エラーを出す
    return { error: "名前は必須です。" };
  }

  await updateUserName(user.id, rawName);//DB上の名前を上書きする関数を呼び出して書き換える
  redirect("/settings");//設定ページへ遷移する
}

export async function updateBioAction(
  _: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {//自己紹介変更のサーバーアクション関数
  const user = await getRequiredAuthUser();
  const rawBio = String(formData.get("bio") ?? "").trim();

  await updateUserBio(user.id, rawBio);//DB上の自己紹介を上書きする関数を呼び出して書き換える
  redirect("/settings");
}

export async function updateAvatarAction(
  _: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {//アイコン画像変更のサーバーアクション関数
  const user = await getRequiredAuthUser();
  const supabase = await createClient();//ログイン中の本人権限でしか変更できないように、本人がログイン中かを調べる関数を呼ぶ

  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {//画像データの中身がない場合はエラーを出す
    return { error: "画像を選択してください。" };
  }

  //他の人のファイルと名前が被らないように以下の処理をする
  const fileExt = file.name.split(".").pop() ?? "jpg";//拡張子（jpgなど）を抜き出す（split(".")でファイル名をバラバラにし、.pop()で一番最後を抜き出す。?? "jpg"で拡張子が取れなかったらとりあえずjpgにする）
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;//画像の保存場所を作成する（DBに全て保存するとパンクするのでDBが取りに行く場所（ファイルパス）を作成し、ファイルパスのみDBに保存する。実際の画像はファイル置き場（supabaseのストレージのバケット）にある）

  const { error: uploadError } = await supabase.storage//supabaseのストレージの"avatars"というバケットに作成するfilePathで画像本体を保存する（もし同じファイルがすでにあったらipsert(上書き)する）
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {//もしストレージに画像を預けるのに失敗したら以下のエラーが表示される
     return { error: "画像のアップロードに失敗しました。" };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);//預けた画像の「公開用URL（httpから始まり末尾にfilepathがあるもの）」を教えてもらう

  await updateUserAvatarUrl(user.id, data.publicUrl);//生成されたdata(公開用URL)をDBに保存する関数を呼び出して保存する

  redirect("/settings");//設定に戻る
}