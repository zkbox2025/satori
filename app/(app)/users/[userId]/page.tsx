//app/(app)/users/[userId]/page.tsx
//マイページ

import { notFound } from "next/navigation";//404を表示するための道具
import {
  findPublicGeneratedContentsByUser,
  findPublicWorksByUser,
  findUserProfileById,
} from "@/lib/repositories/user";//DBからマイページで使う記事/作品、プロフィール情報をとってくる関数をインポート
import UserProfilePage from "@/components/user/user-profile-page";//マイページで使うユーザー操作用コンポーネントをインポート

type Props = {//引数は以下の通り
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string }>;
};


export default async function UserPage({ params, searchParams }: Props) {//URLから取得したuserIdとtabを引数としたこのページのメイン関数
  const { userId } = await params;
  const { tab } = await searchParams;

  const [user, works, generatedContents] = await Promise.all([//DBから記事/作品、プロフィール情報をとってくる
    findUserProfileById(userId),
    findPublicWorksByUser(userId),
    findPublicGeneratedContentsByUser(userId),
  ]);

  if (!user) {//userがなければ404
    notFound();
  }

  return (
    <UserProfilePage//マイページで使うユーザー操作用コンポーネントに引数を代入
      user={user}
      initialTab={tab === "generated" ? "generated" : "works"}
      works={works.map((item) => ({//記事は元々の関数で抽出されてるのでそのまま引数として渡す
        ...item,
        createdAt: item.createdAt.toISOString(),//作成日は文字列に変換
        likeCount: item._count.likes,
      }))}
      generatedContents={generatedContents.map((item) => ({//必要な項目を抽出し引数として渡す
        id: item.id,
        title: item.title,
        genre: item.work.genre,
        createdAt: item.createdAt.toISOString(),//作成日は文字列に変換
        likeCount: item._count.likes,
      }))}
    />
  );
}