//lib/navigation/use-safe-back.ts
//ブラウザの戻るボタンの機能。ユーザーが前のページに戻れるようにするが、もし履歴がない場合は指定されたフォールバックパスに遷移する。

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useSafeBack(fallbackPath = "/explore") {//引数は、履歴がない場合に遷移するパス。デフォルトは/explore
  const router = useRouter();//ページ遷移のための道具をインポート

  return useCallback(() => {//ブラウザの戻るボタンの機能を安全に実装するための関数。ユーザーが前のページに戻れるようにするが、もし履歴がない場合は指定されたフォールバックパスに遷移する。
    if (window.history.length > 1) {//ブラウザの閲覧履歴が一つ以上あるなら、
      router.back();//直前に見ていたページに戻る処理をして
      return;//終了する。
    }

    router.push(fallbackPath);//ないならフォールバックパスに遷移させる
  }, [router, fallbackPath]);//依存関係としてrouterとfallbackPathを指定している。これにより、routerやfallbackPathが変更された場合にこの関数が再生成される。
}