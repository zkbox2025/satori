//components/app/ExploreHomeSections.tsx
//exploreのホームセクション（最新、人気、ジャンル別）を担うコンポーネント。explore/page.tsxで使われている。

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getSortedGenreEntries,
  getGenreLimit,
  expandGenreLimit,
} from "@/lib/listing/grouping";
import ContentMetaRow from "@/components/app/ContentMetaRow";

type ExploreTab = "works" | "generated";

type BaseItem = {
  id: string;
  title: string;
  genre: string;
  href: string;
  createdAt: string;
  userName: string;
  userAvatarUrl: string | null;
  likeCount: number;
};

type Props = {
  tab: ExploreTab;
  latestItems: BaseItem[];
  popularItems: BaseItem[];
  emptyMessage: string;
};



function ExploreCard({ item }: { item: BaseItem }) {
  return (
    <Link href={item.href} className="block rounded-md border p-4">
      <p className="font-semibold">{item.title}</p>
      <ContentMetaRow
        likeCount={item.likeCount}
        authorName={item.userName}
        authorAvatarUrl={item.userAvatarUrl}
        genre={item.genre}
        date={item.createdAt}
      />
    </Link>
  );
}

export default function ExploreHomeSections({
  tab,
  latestItems,
  popularItems,
  emptyMessage,
}: Props) {
  const [latestLimit, setLatestLimit] = useState(5);
  const [popularLimit, setPopularLimit] = useState(5);
  const [genreLimits, setGenreLimits] = useState<Record<string, number>>({});

  const genreEntries = useMemo(
    () => getSortedGenreEntries(latestItems),
    [latestItems]
  );

  const latestLabel = tab === "works" ? "最新記事" : "最新作品";
  const popularLabel = tab === "works" ? "人気記事" : "人気作品";
  const genreLabel = tab === "works" ? "ジャンル別記事" : "ジャンル別作品";
  const latestMoreHref = tab === "works" ? "/explore/works" : "/explore/generated";

  if (latestItems.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href={latestMoreHref} className="text-xl font-semibold underline">
            {latestLabel}
          </Link>
        </div>

        <div className="space-y-4">
          {latestItems.slice(0, latestLimit).map((item) => (
            <ExploreCard key={item.id} item={item} />
          ))}
        </div>

        {latestItems.length > latestLimit && (
          <button
            type="button"
            onClick={() => setLatestLimit((prev) => prev + 5)}
            className="rounded-md border px-4 py-2"
          >
            もっと見る
          </button>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{popularLabel}</h2>

        <div className="space-y-4">
          {popularItems.slice(0, popularLimit).map((item) => (
            <ExploreCard key={item.id} item={item} />
          ))}
        </div>

        {popularItems.length > popularLimit && (
          <button
            type="button"
            onClick={() => setPopularLimit((prev) => prev + 5)}
            className="rounded-md border px-4 py-2"
          >
            もっと見る
          </button>
        )}
      </section>

      <section className="space-y-8">
        <h2 className="text-xl font-semibold">{genreLabel}</h2>

        {genreEntries.map(([genre, items]) => {//HTMLに変換するためのマッピング
          const limit = getGenreLimit(genreLimits, genre, 5);

          //ジャンル別表示件数を計算するために{}で囲む必要があり、{}を使うとリターンを挟む必要がある。

          return (
            <section key={genre}>
              <h3 className="mb-3 text-lg font-bold">{genre}</h3>

              <div className="space-y-4">
                {items.slice(0, limit).map((item) => (
                  <ExploreCard key={item.id} item={item} />
                ))}
              </div>

              {items.length > limit && (
                <button
                  type="button"
                  onClick={() =>
                    setGenreLimits((prev) => expandGenreLimit(prev, genre, 5, 5))
                  }
                  className="mt-4 rounded-md border px-4 py-2"
                >
                  もっと見る
                </button>
              )}
            </section>
          );
        })}
      </section>
    </div>
  );
}