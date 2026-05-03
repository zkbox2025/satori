//app/(app)/explore/works/page.tsx
//explore記事一覧ページ

import ListControls, { type SortOption } from "@/components/app/ListControls";
import ExploreWorksListClient from "@/components/app/ExploreWorksListClient";
import { findPublishedWorksForExplore } from "@/lib/repositories/work";
import { toExploreWorkCardItem } from "@/lib/mappers/card-item";

const WORK_SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "latest", label: "最新順" },
  { value: "oldest", label: "古い順" },
  { value: "likes", label: "人気順" },
  { value: "updated", label: "更新順" },
  { value: "genre", label: "ジャンル別" },
];

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
};

export default async function ExploreWorksPage({ searchParams }: Props) {
  const { q, sort } = await searchParams;

  const currentQuery = q?.trim() ?? "";
  const currentSort: SortOption =
    sort === "latest" ||
    sort === "oldest" ||
    sort === "likes" ||
    sort === "updated" ||
    sort === "genre"
      ? sort
      : "latest";

  const works = await findPublishedWorksForExplore({
    q: currentQuery,
    sort: currentSort,
  });

  const normalizedItems = works.map((work) =>
  toExploreWorkCardItem({ work })
);



  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">公開記事</h1>

      <ListControls
        initialQuery={currentQuery}
        initialSort={currentSort}
        sortOptions={WORK_SORT_OPTIONS}
        showBack
        showVisibilityFilter={false}
      />

      <ExploreWorksListClient
        items={normalizedItems}
        sort={currentSort}
        emptyMessage={
          currentQuery ? "検索結果がありません" : "まだ記事がありません"
        }
      />
    </main>
  );
}