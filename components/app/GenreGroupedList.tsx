//components/app/GenreGroupedList.tsx
//ジャンル別一覧表示の際に「もっと見るボタン」を各ジャンル5件ごとに表示する＋それ以外は15件ごとに表示するための関数。必要に応じてレンダー関数も渡せるようにしている。

"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  expandGenreLimit,
  getGenreLimit,
  getSortedGenreEntries,
} from "@/lib/listing/grouping";

export type GenreGroupedListItem = {
  id: string;
  title: string;
  genre: string;
  href: string;
  createdAt: string;
  visibilityLabel?: string;
};

type Props<T extends GenreGroupedListItem> = {//ジェネリクス：Tを使って引数を定義（親側が引数を追加しても柔軟に対応できるようにする）
  items: T[];
  sort: "latest" | "oldest" | "genre" | "likes" | "updated";
  emptyMessage: string;
  renderItem?: (item: T) => ReactNode;
};

function defaultRenderItem<T extends GenreGroupedListItem>(item: T){
  return (
    <Link
      key={item.id}
      href={item.href}
      className="block rounded-md border p-4"
    >
      <p className="font-semibold">{item.title}</p>
      <p className="text-sm text-gray-500">{item.genre}</p>
      {item.visibilityLabel && (
        <p className="mt-2 text-sm">{item.visibilityLabel}</p>
      )}
    </Link>
  );
}

export default function GenreGroupedList<T extends GenreGroupedListItem>({
  items,
  sort,
  emptyMessage,
  renderItem,
}: Props<T>) {
  const [latestLimit, setLatestLimit] = useState(15);
  const [genreLimits, setGenreLimits] = useState<Record<string, number>>({});

  const genreEntries = useMemo(
    () => (sort === "genre" ? getSortedGenreEntries(items) : []),
    [items, sort]
  );

const render: (item: T) => ReactNode =
  renderItem ?? ((item) => defaultRenderItem(item));

  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  if (sort === "genre") {
    return (
      <div className="space-y-8">
        {genreEntries.map(([genre, genreItems]) => {
          const limit = getGenreLimit(genreLimits, genre, 5);

          return (
            <section key={genre}>
              <h2 className="mb-3 text-xl font-bold">{genre}</h2>

              <div className="space-y-4">
                {genreItems.slice(0, limit).map((item) => render(item))}
              </div>

              {genreItems.length > limit && (
                <button
                  type="button"
                  onClick={() =>
                    setGenreLimits((prev) => expandGenreLimit(prev, genre))
                  }
                  className="mt-4 rounded-md border px-4 py-2"
                >
                  もっと見る
                </button>
              )}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.slice(0, latestLimit).map((item) => render(item))}

      {items.length > latestLimit && (
        <button
          type="button"
          onClick={() => setLatestLimit((prev) => prev + 15)}
          className="rounded-md border px-4 py-2"
        >
          もっと見る
        </button>
      )}
    </div>
  );
}