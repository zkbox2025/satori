//app/(app)/likes/generated/page.tsx

import Link from "next/link";
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";
import { findVisibleLikedGeneratedContents } from "@/lib/repositories/generated-content";
import SearchBackControls from "@/components/app/SearchBackControls";
import ContentMetaRow from "@/components/app/ContentMetaRow";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function LikedGeneratedPage({ searchParams }: Props) {
  const user = await getRequiredAuthUser();
  const { q } = await searchParams;

  const currentQuery = q?.trim() ?? "";
  const likes = await findVisibleLikedGeneratedContents({
    userId: user.id,
    q: currentQuery,
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">いいね作品一覧</h1>

      <SearchBackControls
        initialQuery={currentQuery}
        placeholder="いいね作品を検索"
        fallbackPath="/explore"
      />

      <div className="space-y-4">
        {likes.length === 0 ? (
          <p>
            {currentQuery
              ? "検索結果がありません"
              : "まだいいねした作品がありません"}
          </p>
        ) : (
          likes.map((generatedContentLike) => (
            <Link
              key={generatedContentLike.id}
              href={`/users/${generatedContentLike.generatedContent.userId}/generated/${generatedContentLike.generatedContent.id}`}
              className="block rounded-md border p-4"
            >
              <p className="font-semibold">
                {generatedContentLike.generatedContent.title}
              </p>
              <ContentMetaRow
                likeCount={generatedContentLike.generatedContent._count.likes}
                authorName={
                  generatedContentLike.generatedContent.user.name ?? "ユーザー"
                }
                authorAvatarUrl={
                  generatedContentLike.generatedContent.user.avatarUrl ?? null
                }
                genre={generatedContentLike.generatedContent.work.genre}
                date={generatedContentLike.generatedContent.createdAt}
              />
            </Link>
          ))
        )}
      </div>
    </main>
  );
}