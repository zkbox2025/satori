//app/(app)/works/page.tsx
//自分の記事一覧ページ（投稿済みのみ（公開/非公開どちらも含む））

import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { findMyPublishedWorks } from "@/lib/repositories/work";
import ListControls, {
  type SortOption,
  type VisibilityOption,
} from "@/components/app/ListControls";
import WorksGroupedListClient from "@/components/app/WorksGroupedListClient";
import { toMyWorkCardItem } from "@/lib/mappers/card-item";


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
    visibility?: string;
  }>;
};

export default async function WorksPage({ searchParams }: Props) {
  const user = await getRequiredAuthUser();
  const { q, sort, visibility } = await searchParams;

  const currentQuery = q?.trim() ?? "";
  const currentSort: SortOption =
    sort === "latest" ||
    sort === "oldest" ||
    sort === "likes" ||
    sort === "updated" ||
    sort === "genre"
      ? sort
      : "latest";

  const currentVisibility: VisibilityOption =
    visibility === "public" || visibility === "private" || visibility === "all"
      ? visibility
      : "all";

  const works = await findMyPublishedWorks({
    userId: user.id,
    q: currentQuery,
    sort: currentSort,
    visibility: currentVisibility,
  });

const normalizedItems = works.map((work) =>
  toMyWorkCardItem({
    work,
    userId: user.id,
    useUpdatedAt: currentSort === "updated",
  })
);


  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">自分の記事</h1>

      <ListControls
        initialQuery={currentQuery}
        initialSort={currentSort}
        initialVisibility={currentVisibility}
        sortOptions={WORK_SORT_OPTIONS}
        showBack
        showVisibilityFilter
      />

<WorksGroupedListClient
  items={normalizedItems}
  sort={currentSort}
  emptyMessage={
    currentQuery ? "検索結果がありません" : "まだ記事がありません"
  }
/>
    </main>
  );
}