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
import FeedbackGenerateButton from "@/components/app/FeedbackGenerateButton";
import GeneratedCreateButton from "@/components/app/GeneratedCreateButton";
import SuccessNotice from "@/components/app/SuccessNotice";

type Props = {//URLからuserIdとworkIdを受け取り引数とするための定義
  params: Promise<{
    userId: string;
    workId: string;
  }>;
  searchParams: Promise<{
    feedback?: string;
  }>;
};

export default async function UserWorkDetailPage({ params , searchParams }: Props) {//記事詳細ページの関数
  const { userId, workId } = await params;//URLからuserIdとworkIdを取得すれば次に進む
  const { feedback } = await searchParams;//URLのクエリパラメータを受け取って（?feedback=success）フィードバック生成成功時（リダイレクト時）に一時的に成功の表示を出すため
  const authUser = await getOptionalAuthUser();//ログイン中であればユーザー情報を取得する。未ログインならnull。

  const work = await findWorkDetailViewModel({
  workId,
  userId,
  viewerId: authUser?.id ?? null,
});

  if (!work) {//もしworkが見つからなかった場合（存在しない記事IDや、非公開記事に対する不正アクセスがあった場合）は404ページを表示する
    notFound();
  }

  const showFeedbackSuccess = feedback === "success";

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

   <SuccessNotice
  show={showFeedbackSuccess}
  message="フィードバック生成に成功しました。"
  queryKey="feedback"
/>

    {!work.feedback ? (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          まだフィードバックはありません。
        </p>

        <FeedbackGenerateButton
  action={generateFeedbackAction.bind(null, work.id)}
  label="フィードバックを生成する"
/>
      </div>
    ) : work.feedback.status === "PENDING" ? (
      <div className="rounded-md border p-4">
        <p className="text-sm text-gray-600">
          フィードバックを生成中です...
        </p>
      </div>
    ) : work.feedback.status === "ERROR" ? (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 space-y-3">
        <p className="text-sm text-red-600">
          フィードバック生成に失敗しました。
        </p>


        {work.feedback.errorMessage && (
          <p className="text-sm text-gray-600">{work.feedback.errorMessage}</p>
        )}


        <FeedbackGenerateButton
  action={generateFeedbackAction.bind(null, work.id)}
  label="再生成する"
  className="rounded-md border px-4 py-2"
/>
      </div>
    ) : (
      <div className="rounded-md border p-4">
        <p className="whitespace-pre-wrap">{work.feedback.content}</p>

        <div className="mt-4 flex items-start gap-3">
  <form action={deleteFeedbackAction.bind(null, work.id)}>
    <button className="shrink-0 rounded-md border px-4 py-2">
      削除する
    </button>
  </form>

  <FeedbackGenerateButton
    action={generateFeedbackAction.bind(null, work.id)}
    label="再生成する"
    className="shrink-0 rounded-md border px-4 py-2"
  />
</div>
      </div>
    )}
  </section>
)}


{work.isOwner && work.status === "PUBLISHED" && (
  <div className="mt-6">
    <GeneratedCreateButton
      action={createGeneratedContentAction.bind(null, work.id)}
      label="作品にする"
    />
  </div>
)}
<BackButton fallbackPath={`/users/${userId}`} className="mt-8" />
    </main>
  );
}