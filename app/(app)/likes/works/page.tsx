//app/(app)/likes/works/page.tsx

import Link from "next/link";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { findVisibleLikedWorks } from "@/lib/repositories/work";
import SearchBackControls from "@/components/app/SearchBackControls";
import ContentMetaRow from "@/components/app/ContentMetaRow";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function LikedWorksPage({ searchParams }: Props) {
  const user = await getRequiredAuthUser();
  const { q } = await searchParams;

  const currentQuery = q?.trim() ?? "";
  const likes = await findVisibleLikedWorks({
    userId: user.id,
    q: currentQuery,
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">いいね記事一覧</h1>

      <SearchBackControls
        initialQuery={currentQuery}
        placeholder="いいね記事を検索"
        fallbackPath="/explore"
      />

      <div className="space-y-4">
        {likes.length === 0 ? (
          <p>
            {currentQuery
              ? "検索結果がありません"
              : "まだいいねした記事がありません"}
          </p>
        ) : (
          likes.map((workLike) => (
            <Link
              key={workLike.id}
              href={`/users/${workLike.work.userId}/works/${workLike.work.id}`}
              className="block rounded-md border p-4"
            >
              <p className="font-semibold">{workLike.work.title}</p>
              <ContentMetaRow
                likeCount={workLike.work._count.likes}
                authorName={workLike.work.user.name ?? "ユーザー"}
                authorAvatarUrl={workLike.work.user.avatarUrl ?? null}
                genre={workLike.work.genre}
                date={workLike.work.createdAt}
              />
            </Link>
          ))
        )}
      </div>
    </main>
  );
}