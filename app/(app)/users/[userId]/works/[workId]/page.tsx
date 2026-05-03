//app/(app)/users/[userId]/works/[workId]/page.tsx
//記事詳細ページ（公開ページ）
//本人：公開記事と非公開記事を両方閲覧可能
//他人：公開記事のみ閲覧可能

import { notFound } from "next/navigation";//存在しない記事IDや、非公開記事に対する不正アクセスがあった場合に404ページを表示するため
import { getOptionalAuthUser } from "@/lib/auth/get-auth-user";//ログイン中のユーザー情報(user)を取得するための関数。ログインしてない場合はnullを返す
import { findWorkDetailViewModel } from "@/lib/repositories/work";
import { createGeneratedContentAction } from "@/app/(app)/generated/actions";
import UserHeaderCard from "@/components/user/UserHeaderCard";
import BackButton from "@/components/app/BackButton";
import WorkActionsMenu from "@/components/app/WorkActionsMenu";

import {
  generateFeedbackAction,
  deleteFeedbackAction,
} from "@/app/(app)/feedback/actions";

import { toggleWorkLikeAction } from "@/app/(app)/likes/actions";

type Props = {//URLからuserIdとworkIdを受け取り引数とするための定義
  params: Promise<{
    userId: string;
    workId: string;
  }>;
};

export default async function UserWorkDetailPage({ params }: Props) {//記事詳細ページの関数
  const { userId, workId } = await params;//URLからuserIdとworkIdを取得すれば次に進む
  const authUser = await getOptionalAuthUser();//ログイン中であればユーザー情報を取得する。未ログインならnull。

  const work = await findWorkDetailViewModel({
  workId,
  userId,
  viewerId: authUser?.id ?? null,
});

  if (!work) {//もしworkが見つからなかった場合（存在しない記事IDや、非公開記事に対する不正アクセスがあった場合）は404ページを表示する
    notFound();
  }


  return (
    <main className="mx-auto max-w-3xl p-6">
<UserHeaderCard
  name={work.user.name}
  avatarUrl={work.user.avatarUrl ?? null}
  dateText={work.createdAt.toLocaleString()}
  rightAction={
    work.isOwner ? (
      <WorkActionsMenu
        workId={work.id}
        currentVisibility={work.visibility}
        status={work.status}
        redirectAfterDelete="/works"
      />
    ) : null
  }
/>
      <h1 className="mt-5 mb-3 text-2xl font-bold">{work.title}</h1>


      <div className="mb-4 flex gap-3 text-sm text-gray-600">
  <span>{work.genre}</span>
  {work.isOwner && (
    <span>{work.visibility === "PRIVATE" ? "非公開" : "公開"}</span>
  )}
</div>

      <article className="whitespace-pre-wrap rounded-md border p-4">
        {work.content}
      </article>

      <div className="mt-6 flex items-center gap-4">
  <p className="text-sm text-gray-500">♡{work.likeCount}</p>

{work.canLike && (
  <form action={toggleWorkLikeAction.bind(null, work.id)}>
    <button className="rounded-md border px-4 py-2">
      {work.isLiked ? "♥ いいね解除" : "♡ いいね"}
    </button>
  </form>
)}
</div>


      {work.isOwner && (
  <section className="mt-8 space-y-4">
    <h2 className="text-xl font-bold">仙人からのフィードバック</h2>

    {work.feedback ? (
      <div className="rounded-md border p-4">
        <p className="whitespace-pre-wrap">{work.feedback.content}</p>

        <div className="mt-4 flex gap-3">
          <form action={generateFeedbackAction.bind(null, work.id)}>
            <button className="rounded-md border px-4 py-2">
              再生成する
            </button>
          </form>

          <form action={deleteFeedbackAction.bind(null, work.id)}>
            <button className="rounded-md border px-4 py-2">
              削除する
            </button>
          </form>
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          まだフィードバックはありません。
        </p>

        <form action={generateFeedbackAction.bind(null, work.id)}>
          <button className="rounded-md bg-black px-4 py-2 text-white">
            フィードバックを生成する
          </button>
        </form>
      </div>
    )}
  </section>
)}

{work.isOwner && work.status === "PUBLISHED" && (
  <form action={createGeneratedContentAction.bind(null, work.id)}>
    <button className="mt-6 rounded bg-black px-4 py-2 text-white">
      作品にする
    </button>
  </form>
)}
<BackButton fallbackPath={`/users/${userId}`} className="mt-8" />
    </main>
  );
}