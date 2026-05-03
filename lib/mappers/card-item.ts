//lib/mappers/card-item.ts
//DBから取得した記事や作品の情報を、カードコンポーネントで表示するための情報に変換する関数を集めたファイル

// DBから取得した記事や作品の情報を、カードコンポーネントで表示するための情報に変換する関数を集めたファイル

import type { MyPublishedWorkRecord, ExploreWorkRecord } from "@/lib/repositories/work";
import type { MyGeneratedContentRecord, ExploreGeneratedContentRecord  } from "@/lib/repositories/generated-content";


export type MyCardItem = {
  id: string;
  title: string;
  genre: string;
  href: string;
  createdAt: string;
  visibilityLabel: string;
  likeCount: number;
};

export type ExploreCardItem = {
  id: string;
  title: string;
  genre: string;
  href: string;
  createdAt: string;
  likeCount: number;
  userName: string;
  userAvatarUrl: string | null;
};

// 記事一覧ページで表示する記事について、DBから取得した情報から表示するための情報へ変換する関数
export function toMyWorkCardItem(params: {
  work: MyPublishedWorkRecord;
  userId: string;
  useUpdatedAt?: boolean;
}): MyCardItem {
  const { work, userId, useUpdatedAt = false } = params;

  return {
    id: work.id,
    title: work.title,
    genre: work.genre,
    href: `/users/${userId}/works/${work.id}`,
    createdAt: useUpdatedAt
      ? work.updatedAt.toISOString()
      : work.createdAt.toISOString(),
    visibilityLabel: work.visibility === "PRIVATE" ? "非公開" : "公開",
    likeCount: work._count.likes,
  };
}

// 作品一覧ページで表示する作品について、DBから取得した情報から表示するための情報へ変換する関数
export function toMyGeneratedCardItem(params: {
  generatedContent: MyGeneratedContentRecord;
  userId: string;
}): MyCardItem {
  const { generatedContent, userId } = params;

  return {
    id: generatedContent.id,
    title: generatedContent.title,
    genre: generatedContent.work.genre,
    href: `/users/${userId}/generated/${generatedContent.id}`,
    createdAt: generatedContent.createdAt.toISOString(),
    visibilityLabel:
      generatedContent.visibility === "PRIVATE" ? "非公開" : "公開",
    likeCount: generatedContent._count.likes,
  };
}

// explore記事一覧ページで表示する記事について、DBから取得した情報から表示するための情報へ変換するための関数
export function toExploreWorkCardItem(params: {
  work: ExploreWorkRecord
}): ExploreCardItem {
  const { work } = params;

  return {
    id: work.id,
    title: work.title,
    genre: work.genre,
    href: `/users/${work.userId}/works/${work.id}`,
    createdAt: work.createdAt.toISOString(),
    likeCount: work._count.likes,
    userName: work.user.name ?? "ユーザー",
    userAvatarUrl: work.user.avatarUrl ?? null,
  };
}

// explore作品一覧ページで表示する作品について、DBから取得した情報から表示するための情報へ変換するための関数
export function toExploreGeneratedCardItem(params: {
  generatedContent: ExploreGeneratedContentRecord;
}): ExploreCardItem {
  const { generatedContent } = params;

  return {
    id: generatedContent.id,
    title: generatedContent.title,
    genre: generatedContent.work.genre,
    href: `/users/${generatedContent.userId}/generated/${generatedContent.id}`,
    createdAt: generatedContent.createdAt.toISOString(),
    likeCount: generatedContent._count.likes,
    userName: generatedContent.user.name ?? "ユーザー",
    userAvatarUrl: generatedContent.user.avatarUrl ?? null,
  };
}