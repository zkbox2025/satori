//components/app/SuccessNotice.tsx
//作品/フィードバック生成成功の一時的な表示を行うコンポーネント(表示の３秒後にクエリパラメータを削除して綺麗にするための関数)。URLのクエリパラメータ（?generated=successなど）を受け取って表示するかどうかを判断し、表示後はクエリパラメータを削除して同じページにリダイレクトすることで、成功の表示を一時的に出すためのコンポーネント。

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  show: boolean;
  message: string;
  queryKey: string;
  durationMs?: number;
};

export default function SuccessNotice({
  show,
  message,
  queryKey,
  durationMs = 3000,
}: Props) {
  const router = useRouter();//リロードせずにURLだけ書き換える機能を持つ
  const pathname = usePathname();//ドメイン以降のパス名（/users/[userId]/generated/[generatedId]など）を取得する
  const searchParams = useSearchParams();//?以降のクエリパラーメータを取得する
  const [visible, setVisible] = useState(show);//初期値を記録し、３秒後にsetVisibleにてメッセージを消すトリガーになる

  useEffect(() => {//URL（show付き）が届いた場合、以下の処理を実行する

    if (!show) return;

    const timer = window.setTimeout(() => {//３秒後に中の処理を一回だけ実行する
      setVisible(false);

      const params = new URLSearchParams(searchParams.toString());//？以降をコピーして
      params.delete(queryKey);//消す

      const nextQuery = params.toString();//編集済みデータをURLに戻す
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;//クエリ（tab=）があればURLにつけてなければそのままのURLにする

      router.replace(nextUrl);//リロードせずに新たなURLに置き換えを行う
    }, durationMs);

    return () => window.clearTimeout(timer);//処理中に画面を変える（アンマウント）瞬間にタイマーを綺麗に消去する
  }, [show, queryKey, durationMs, router, pathname, searchParams]);//この中のどれかが変わったらuseEffectを再度最初からやり直すこと

  if (!visible) return null;

  return (
    <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
      <p className="text-sm text-green-700">{message}</p>
    </div>
  );
}