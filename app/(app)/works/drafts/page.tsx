//app/(app)/works/drafts/page.tsx
//下書き一覧ページ

import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { findMyDraftWorks } from "@/lib/repositories/work";
import SearchBackControls from "@/components/app/SearchBackControls";
import DraftWorksListClient from "@/components/app/DraftWorksListClient";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function DraftWorksPage({ searchParams }: Props) {
  const user = await getRequiredAuthUser();
  const { q } = await searchParams;

  const currentQuery = q?.trim() ?? "";
  const works = await findMyDraftWorks({
    userId: user.id,
    q: currentQuery,
  });

  const items = works.map((work) => ({
    id: work.id,
    title: work.title,
    genre: work.genre,
    href: `/works/${work.id}/edit`,
    updatedAt: work.updatedAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">下書き</h1>

      <SearchBackControls
        initialQuery={currentQuery}
        placeholder="下書きを検索"
        fallbackPath="/works"
      />

      <DraftWorksListClient
        items={items}
        emptyMessage={
          currentQuery ? "検索結果がありません" : "下書きがありません"
        }
      />
    </main>
  );
}