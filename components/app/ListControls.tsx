//components/app/ListControls.tsx
//検索箱、戻るボタン、プルダウンのコンポーネント関数

"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildNextUrl } from "@/lib/navigation/query-controls";
import { useSafeBack } from "@/lib/navigation/use-safe-back";

export type SortOption =
  | "latest"
  | "oldest"
  | "likes"
  | "updated"
  | "genre";

export type VisibilityOption = "all" | "public" | "private";

type Props = {
  initialQuery: string;
  initialSort: SortOption;
  initialVisibility?: VisibilityOption;
  showBack?: boolean;
  showVisibilityFilter?: boolean;
  sortOptions: Array<{//裏の値をvalueとし、表示用の値をlabelとする
    value: SortOption;
    label: string;
  }>;
};

export default function ListControls({
  initialQuery,
  initialSort,
  initialVisibility = "all",
  showBack = true,
  showVisibilityFilter = true,
  sortOptions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handleBack = useSafeBack("/explore");

  const [query, setQuery] = useState(initialQuery);

  const pushWithParams = (next: {
    q?: string;
    sort?: SortOption;
    visibility?: VisibilityOption;
  }) => {
    const nextQ = next.q ?? query;
    const nextSort =
      next.sort ?? (searchParams.get("sort") as SortOption | null) ?? initialSort;
    const nextVisibility =
      next.visibility ??
      (searchParams.get("visibility") as VisibilityOption | null) ??
      initialVisibility;

    const nextUrl = buildNextUrl({//URLを作る関数を呼び出し、検索ワードやタブに沿った新しいURLを作成する
      pathname,
      currentSearchParams: searchParams.toString(),
      updates: {
        q: nextQ,
        sort: nextSort,
        visibility: showVisibilityFilter ? nextVisibility : null,
      },
    });

    router.push(nextUrl);
  };

  //検索の実行
  const handleSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>)=> {//検索フォームの送信ボタンが押されたときに、ページをリロード（再読み込み）させず、入力されたキーワードをURLに反映させて画面を切り替える」という処理
    e.preventDefault();//ブラウザのリロードをキャンセルする
    pushWithParams({ q: query });//入力されたキーワードをURLのパラメータ（?q=...）にセットしてページを遷移させる
  };

  //並べ替えの変更を実行(最新順など)
  const handleSortChange = (nextSort: SortOption) => {//nextsort(入力値)を引数としてpushWithParamsを実行する
    pushWithParams({ sort: nextSort });
  };

  //表示を変更（公開/非公開など）
  const handleVisibilityChange = (nextVisibility: VisibilityOption) => {//nextVisibilityを引数としてpushWithParamsを実行する
    pushWithParams({ visibility: nextVisibility });
  };


  return (
    <div className="mb-6 space-y-3">
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-start gap-3"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="検索"
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
              className="mt-2 rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
            >
              戻る
            </button>
          )}
        </div>
      </form>

      <div className="flex gap-3">
        <select
          value={(searchParams.get("sort") as SortOption | null) ?? initialSort}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="rounded-md border px-3 py-2"
        >
          {sortOptions.map((option) => (//一つのデータずつ値(value)をつけ、labelの通りに表示する
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {showVisibilityFilter && (
          <select
            value={
              (searchParams.get("visibility") as VisibilityOption | null) ??
              initialVisibility
            }
            onChange={(e) =>
              handleVisibilityChange(e.target.value as VisibilityOption)
            }
            className="rounded-md border px-3 py-2"
          >
            <option value="all">すべて</option>
            <option value="public">公開のみ</option>
            <option value="private">非公開のみ</option>
          </select>
        )}
      </div>
    </div>
  );
}