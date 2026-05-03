//app/(app)/explore/generated/page.tsx
//explore作品一覧ページ

import ListControls, { type SortOption } from "@/components/app/ListControls";
import ExploreGeneratedListClient from "@/components/app/ExploreGeneratedListClient";
import { findPublishedGeneratedForExplore } from "@/lib/repositories/generated-content";
import { toExploreGeneratedCardItem } from "@/lib/mappers/card-item";

const GENERATED_SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "latest", label: "最新順" },
  { value: "oldest", label: "古い順" },
  { value: "likes", label: "いいね順" },
  { value: "genre", label: "ジャンル別" },
];

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
};

export default async function ExploreGeneratedPage({ searchParams }: Props) {
  const { q, sort } = await searchParams;

  const currentQuery = q?.trim() ?? "";
  const currentSort: SortOption =
    sort === "latest" ||
    sort === "oldest" ||
    sort === "likes" ||
    sort === "genre"
      ? sort
      : "latest";

  const generatedContents = await findPublishedGeneratedForExplore({
    q: currentQuery,
    sort: currentSort,
  });

  const normalizedItems = generatedContents.map((generatedContent) =>
  toExploreGeneratedCardItem({ generatedContent })
);



  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">公開作品</h1>

      <ListControls
        initialQuery={currentQuery}
        initialSort={currentSort}
        sortOptions={GENERATED_SORT_OPTIONS}
        showBack
        showVisibilityFilter={false}
      />

      <ExploreGeneratedListClient
        items={normalizedItems}
        sort={currentSort}
        emptyMessage={
          currentQuery ? "検索結果がありません" : "まだ作品がありません"
        }
      />
    </main>
  );
}