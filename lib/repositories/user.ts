//lib/repositories/user.ts
//DBからユーザー情報やマイページで使う記事/作品情報を取得/更新する関数

import { prisma } from "@/src/infrastructure/prisma/client";//DBからデータを取得する際の電話線
import { notFound } from "next/navigation";//404を表示するための道具

//ヘッダーで使うデータの取得関数
export async function findHeaderData(userId: string) {
  const [profile, worksCount, generatedContentsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    }),
    prisma.work.count({
      where: {
        userId,
        status: "PUBLISHED",
      },
    }),
    prisma.generatedContent.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    profile,
    worksCount,
    generatedContentsCount,
  };
}

//マイページで使うユーザー情報を取得するための関数
export async function findUserProfileById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
    },
  });
}

//設定ページで使うユーザー情報を取得するための関数（bioやavatarUrlを何も設定してないばあいはそこだけnull）
export async function findMySettingsProfile(userId: string) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      email: true,
    },
  });
    if (!profile) {
    // もし万が一なかったら404にする（これで戻り値から null が消える）
    notFound();
  }
  return profile;
}

//設定ページでユーザーの名前を書き換える関数
export async function updateUserName(userId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
  });
}

//設定ページで自己紹介を書き換える関数
export async function updateUserBio(userId: string, bio: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { bio },
  });
}

//設定ページでアイコン画像の公開用URL（supabaseストレージに保存されているファイル名がわかるURL）を上書きする関数
export async function updateUserAvatarUrl(userId: string, avatarUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });
}

//マイページで使う記事情報を取得するための関数
export async function findPublicWorksByUser(userId: string) {
  return prisma.work.findMany({
    where: {
      userId,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      genre: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });
}

//マイページで使う作品情報を取得するための関数
export async function findPublicGeneratedContentsByUser(userId: string) {
  return prisma.generatedContent.findMany({
    where: {
      userId,
      visibility: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      work: {
        select: {
          genre: true,
        },
      },
      _count: {
        select: {
          likes: true, 
        },
      },

    },
  });
}