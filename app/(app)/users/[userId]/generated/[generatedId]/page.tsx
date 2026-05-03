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

type Props = {
  params: Promise<{
    userId: string;
    generatedId: string;
  }>;
};

export default async function GeneratedDetailPage({ params }: Props) {
  const { userId, generatedId } = await params;
  const authUser = await getOptionalAuthUser();

const generatedContent = await findGeneratedDetailViewModel({
  generatedId,
  userId,
  viewerId: authUser?.id ?? null,
});

  if (!generatedContent) {
    notFound();
  }


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
      <h1 className="mt-5 mb-3 text-2xl font-bold">{generatedContent.title}</h1>

      <div className="mb-4 flex gap-3 text-sm text-gray-600">
  <span>{generatedContent.work.genre}</span>
  
  <span>元記事: {generatedContent.work.title}</span>

  {generatedContent.isOwner && (
    <span>{generatedContent.visibility === "PRIVATE" ? "非公開" : "公開"}</span>
  )}
</div>

      <article className="whitespace-pre-wrap border p-4 rounded">
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

