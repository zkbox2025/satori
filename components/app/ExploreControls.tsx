//components/app/ExploreControls.tsx
//exploreのページ(explore/page,explore/works,explore/generated)の検索欄とタブ切り替えの部分を担うコンポーネント。URLのクエリパラメータを更新して画面遷移することで、検索やタブ切り替えを実現している。

"use client";

import { useState } from "react";//useState:検索欄の文字列を覚えておくための道具。useMemo：重い計算を毎回しないようにするための仕組み
import { usePathname, useRouter, useSearchParams } from "next/navigation";//useRouter:画面遷移のための道具。usePathname：URLのパス（/exploreなど）を取る道具。useSearchParams：末尾（tab=works&q=...)をとる道具。
import { buildNextUrl } from "@/lib/navigation/query-controls";
import { useSafeBack } from "@/lib/navigation/use-safe-back";

type ExploreTab = "works" | "generated";//タブにはどちらかしか入らない

type Props = {
  currentTab: ExploreTab;
  initialQuery: string;//最初の検索欄に入れておく文字列
  showBack?: boolean;//戻るボタンは真か偽かの二つしか持たない
};

export default function ExploreControls({
//引数は以下の通り
  currentTab,
  initialQuery,
  showBack = true,//デフォルトはtrue
}: Props) {
  const router = useRouter();//画面遷移のための道具をインポート
  const pathname = usePathname();//URLのパス（/exploreなど）を取る道具をインポート
  const searchParams = useSearchParams();//末尾（tab=works&q=...)をとる道具をインポート
  const handleBack = useSafeBack("/explore");

  const [query, setQuery] = useState(initialQuery);//query:現在の検索欄の値。setQuery：その値を更新するための関数。initialQueryは検索欄の初期値


  const pushWithParams = (next: { tab?: ExploreTab; q?: string }) => {
    const nextTab = next.tab ?? currentTab;
    const nextQ = next.q ?? query;

    const nextUrl = buildNextUrl({//URLを作る関数を呼び出し、検索ワードやタブに沿った新しいURLを作成する
      pathname,
      currentSearchParams: searchParams.toString(),
      updates: {
        tab: nextTab,
        q: nextQ,
      },
    });

    router.push(nextUrl);
  };

  const handleTabChange = (nextTab: ExploreTab) => {//tabが変わったときの処理
    pushWithParams({ tab: nextTab });
  };

const handleSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {//検索フォームの送信ボタンが押されたときに、ページをリロード（再読み込み）させず、入力されたキーワードをURLに反映させて画面を切り替える」という処理
  e.preventDefault();//ブラウザのリロードをキャンセルする
  pushWithParams({ q: query });//入力されたキーワードをURLのパラメータ（?q=...）にセットしてページを遷移させる
  };

  return (
    <div className="mb-6 space-y-3">
      <form onSubmit={handleSearchSubmit} className="relative flex gap-3 items-start">
  {/* 入力欄：検索ボタンと同じ高さにする */}
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder={currentTab === "works" ? "記事を検索" : "作品を検索"}
    className="flex-1 rounded-md border px-3 py-2 outline-none"
  />

  {/* ボタン群をまとめるコンテナ */}
  <div className="flex flex-col items-stretch">
    {/* 検索ボタン：入力欄と高さを揃える */}
    <button
      type="submit"
       className="rounded-md border px-4 py-2 bg-white hover:bg-gray-50 whitespace-nowrap"
    >
      検索
    </button>

         {showBack && (//戻るがtrueの場合は以下の戻るボタンが出る
      <button
        type="button"
        onClick={handleBack}
        className="mt-2 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
      >
        戻る
      </button>
        )}
        </div>
      </form>


      <div className="flex gap-3">
        <select
          value={currentTab}
          onChange={(e) =>
            handleTabChange(e.target.value as ExploreTab)
          }
          className="rounded-md border px-3 py-2"
        >
          <option value="works">記事</option>
          <option value="generated">作品</option>
        </select>
      </div>

    </div>
  );
}