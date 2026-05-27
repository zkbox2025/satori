//app/(app)/users/[userId]/generated/[generatedId]/page.tsx
//ユーザー作品詳細ページ

import Link from "next/link";
import { notFound } from "next/navigation";
import { getOptionalAuthUser } from "@/lib/auth/get-auth-user";
import { findGeneratedDetailViewModel } from "@/lib/repositories/generated-content";
import { toggleGeneratedLikeAction } from "@/app/(app)/likes/actions";
import UserHeaderCard from "@/components/user/UserHeaderCard";
import BackButton from "@/components/app/BackButton";
import GeneratedActionsMenu from "@/components/app/GeneratedActionsMenu";
import SuccessNotice from "@/components/app/SuccessNotice";

type Props = {
  params: Promise<{
    userId: string;
    generatedId: string;
  }>;
  searchParams: Promise<{//URLのクエリパラメータを受け取って（?generated=success）作品生成成功時（リダイレクト時）に一時的に成功の表示を出すため
    generated?: string;
  }>;
};

export default async function GeneratedDetailPage({
  params,
  searchParams
}: Props) {
  const { userId, generatedId } = await params;
  const { generated } = await searchParams;
  const authUser = await getOptionalAuthUser();

  const generatedContent = await findGeneratedDetailViewModel({
    generatedId,
    userId,
    viewerId: authUser?.id ?? null,
  });

  if (!generatedContent) {
    notFound();
  }

  const showGeneratedSuccess =
    generatedContent.isOwner && generated === "success";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <UserHeaderCard
        name={generatedContent.user.name}
        avatarUrl={generatedContent.user.avatarUrl ?? null}
        dateText={generatedContent.createdAt.toLocaleString()}
        rightAction={
          generatedContent.isOwner ? (
            <GeneratedActionsMenu
              generatedId={generatedContent.id}
              currentTitle={generatedContent.title}
              currentVisibility={generatedContent.visibility}
              redirectAfterDelete="/generated"
            />
          ) : null
        }
      />

      <h1 className="mt-5 mb-3 text-2xl font-bold">
        {generatedContent.title}
      </h1>

      <div className="mb-4 flex gap-3 text-sm text-gray-600">
        <span>{generatedContent.work.genre}</span>
        <span>元記事: {generatedContent.work.title}</span>

        {generatedContent.isOwner && (
          <span>
            {generatedContent.visibility === "PRIVATE" ? "非公開" : "公開"}
          </span>
        )}
      </div>

      {generatedContent.isOwner && generatedContent.status === "PENDING" && (
        <div className="mb-4 rounded-md border p-3">
          <p className="text-sm text-gray-600">作品を生成中です...</p>
        </div>
      )}

      {generatedContent.isOwner && generatedContent.status === "ERROR" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">作品生成に失敗しました。</p>
          {generatedContent.errorMessage && (
            <p className="mt-1 text-sm text-gray-600">
              {generatedContent.errorMessage}
            </p>
          )}
        </div>
      )}

      <SuccessNotice
  show={showGeneratedSuccess}
  message="作品生成に成功しました。"
  queryKey="generated"
/>

      <article className="whitespace-pre-wrap rounded border p-4">
        {generatedContent.generatedText}
      </article>

      <div className="mt-6 flex items-center gap-4">
        <p className="text-sm text-gray-500">♡{generatedContent.likeCount}</p>

        {generatedContent.canLike && (
          <form action={toggleGeneratedLikeAction.bind(null, generatedContent.id)}>
            <button className="rounded-md border px-4 py-2">
              {generatedContent.isLiked ? "♥ いいね解除" : "♡ いいね"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <BackButton fallbackPath={`/users/${userId}`} />

        <Link
          href={`/users/${userId}/works/${generatedContent.work.id}/generated`}
          className="rounded-md border px-4 py-2"
        >
          作品集
        </Link>
      </div>
    </main>
  );
}