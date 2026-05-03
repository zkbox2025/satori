//app/(app)/explore/page.tsx
//メインページ(/explore)（公開ページ）

import ExploreControls from "@/components/app/ExploreControls";
import ExploreHomeSections from "@/components/app/ExploreHomeSections";
import {
  findExploreGeneratedSections,
  findExploreWorkSections,
} from "@/lib/repositories/explore";

type Props = {
  searchParams: Promise<{
    tab?: string;
    q?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const { tab, q } = await searchParams;

  const currentTab = tab === "generated" ? "generated" : "works";
  const currentQuery = q?.trim() ?? "";

  const sections =
    currentTab === "works"
      ? await findExploreWorkSections(currentQuery)
      : await findExploreGeneratedSections(currentQuery);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">explore</h1>

      <ExploreControls
        currentTab={currentTab}
        initialQuery={currentQuery}
        showBack
      />

      <ExploreHomeSections
        tab={currentTab}
        latestItems={sections.latestItems}
        popularItems={sections.popularItems}
        emptyMessage={
          currentQuery
            ? "検索結果がありません"
            : currentTab === "works"
            ? "まだ記事がありません"
            : "まだ作品がありません"
        }
      />
    </main>
  );
}