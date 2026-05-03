//app/(app)/users/[userId]/works/[workId]/generated/page.tsx

import Link from "next/link";
import { getOptionalAuthUser } from "@/lib/auth/get-auth-user";
import { findGeneratedByWork } from "@/lib/repositories/generated-content";
import UserHeaderCard from "@/components/user/UserHeaderCard";
import BackButton from "@/components/app/BackButton";
import ContentMetaRow from "@/components/app/ContentMetaRow";

type Props = {
  params: Promise<{
    userId: string;
    workId: string;
  }>;
};

export default async function WorkGeneratedListPage({ params }: Props) {
  const { userId, workId } = await params;
  const authUser = await getOptionalAuthUser();

  const generatedContents = await findGeneratedByWork({
    workId,
    userId,
    viewerId: authUser?.id ?? null,
  });

if (generatedContents.length === 0) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-xl font-bold">この記事から生まれた作品</h1>
      <p>この記事から生まれた作品はありません。</p>
      <BackButton
        fallbackPath={`/users/${userId}/works/${workId}`}
        className="mt-8"
      />
    </main>
  );
}


  const user = generatedContents[0].user;
  const latestCreatedAt = generatedContents[0].createdAt.toLocaleString();


  return (
    <main className="mx-auto max-w-3xl p-6">
      <UserHeaderCard
  name={user.name}
  avatarUrl={user.avatarUrl}
  dateText={latestCreatedAt}
/>
      <h1 className="mt-5 mb-3 text-2xl font-bold">この記事から生まれた作品</h1>

      <div className="space-y-4">
        {generatedContents.map((generatedContent) => (
          <Link
            key={generatedContent.id}
            href={`/users/${userId}/generated/${generatedContent.id}`}
            className="block border p-4 rounded"
          >
            <p className="font-semibold">{generatedContent.title}</p>
            <ContentMetaRow
              likeCount={generatedContent._count.likes}
              genre={generatedContent.work.genre}
              date={generatedContent.createdAt}
            />
          </Link>
        ))}
      </div>
      <BackButton fallbackPath={`/users/${userId}/works/${workId}`} className="mt-8" />
    </main>
  );
}