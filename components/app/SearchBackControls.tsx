//components/app/SearchBackControls.tsx
//いいね記事/作品一覧、下書き一覧の検索箱のユーザー操作によってクエリ付きURLを作成するファイル
//ユーザー操作なしの場合は、戻るボタンと検索ボタンをまとめたUIファイルとなる

"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSafeBack } from "@/lib/navigation/use-safe-back";

type Props = {
  initialQuery: string;
  placeholder?: string;
  fallbackPath?: string;
  showBack?: boolean;
};

export default function SearchBackControls({
  initialQuery,
  placeholder = "検索",
  fallbackPath = "/explore",
  showBack = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handleBack = useSafeBack(fallbackPath);
  

  const [query, setQuery] = useState(initialQuery);

  const currentParams = useMemo(//サーチパラムス（?以降）を取得する
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const pushWithQuery = (nextQuery: string) => {
    const params = new URLSearchParams(currentParams);//取得したサーチパラムスをコピーする

    if (nextQuery.trim()) {//qの前後を削除して
      params.set("q", nextQuery.trim());//もしqがあれば?q=をセットする
    } else {
      params.delete("q");//空白なら消す
    }

    const queryString = params.toString();//取り出したqをURL用の文字列に変換する
    router.push(queryString ? `${pathname}?${queryString}` : pathname);//クエリがあればクエリ付きのURLに遷移する。なければパスネームのみのURLに遷移する
  };

  const handleSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {//結果の表示のための処理
    e.preventDefault();//スムーズに検索結果を表示するためにページ遷移を防止する
    pushWithQuery(query);
  };


  return (
    <div className="mb-6">
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-start gap-3"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border px-3 py-2 outline-none"
        />

        <div className="flex flex-col items-stretch">
          <button
            type="submit"
            className="whitespace-nowrap rounded-md border bg-white px-4 py-2 hover:bg-gray-50"
          >
            検索
          </button>

          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-2 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              戻る
            </button>
          )}
        </div>
      </form>
    </div>
  );
}