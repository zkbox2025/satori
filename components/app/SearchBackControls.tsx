//components/app/SearchBackControls.tsx
//戻るボタンと検索ボタンをまとめたファイル

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

  const currentParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const pushWithQuery = (nextQuery: string) => {
    const params = new URLSearchParams(currentParams);

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
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