//app/(app)/generated/page.tsx

import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { findMyGeneratedContents } from "@/lib/repositories/generated-content";
import ListControls, {
  type SortOption,
  type VisibilityOption,
} from "@/components/app/ListControls";
import GeneratedGroupedListClient from "@/components/app/GeneratedGroupedListClient";
import { toMyGeneratedCardItem } from "@/lib/mappers/card-item";

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
    visibility?: string;
  }>;
};

export default async function GeneratedListPage({ searchParams }: Props) {
  const user = await getRequiredAuthUser();
  const { q, sort, visibility } = await searchParams;

  const currentQuery = q?.trim() ?? "";
  const currentSort: SortOption =
    sort === "latest" ||
    sort === "oldest" ||
    sort === "likes" ||
    sort === "genre"
      ? sort
      : "latest";

  const currentVisibility: VisibilityOption =
    visibility === "all" || visibility === "public" || visibility === "private"
      ? visibility
      : "all";

  const generatedContents = await findMyGeneratedContents({
    userId: user.id,
    q: currentQuery,
    sort: currentSort,
    visibility: currentVisibility,
  });

  const normalizedItems = generatedContents.map((generatedContent) =>
  toMyGeneratedCardItem({
    generatedContent,
    userId: user.id,
  })
);



  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">自分の作品</h1>

      <ListControls
        initialQuery={currentQuery}
        initialSort={currentSort}
        initialVisibility={currentVisibility}
        sortOptions={GENERATED_SORT_OPTIONS}
        showBack
        showVisibilityFilter
      />

     <GeneratedGroupedListClient
  items={normalizedItems}
  sort={currentSort}
  emptyMessage={
    currentQuery ? "検索結果がありません" : "まだ作品がありません"
  }
/>
    </main>
  );
}