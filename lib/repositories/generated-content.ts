//lib/repositories/generated-content.ts
//DBから作品を取得する関数を集めたファイル（三項演算子による公開判定付き）

import { prisma } from "@/src/infrastructure/prisma/client";//DB書き換えの道具をインポート
import type { Prisma } from "@prisma/client";//Prismaの型をインポート

//結果から型定義する
const generatedDetailInclude = {
    user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
  work: true,
  _count: {
    select: {
      likes: true,
    },
  },
} satisfies Prisma.GeneratedContentInclude;

export type GeneratedDetailRecord = Prisma.GeneratedContentGetPayload<{
  include: typeof generatedDetailInclude;
}>;

export type GeneratedDetailViewModel = GeneratedDetailRecord & {
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;
  canLike: boolean;
};

function buildViewableGeneratedWhere(params: {
  generatedId: string;
  ownerId: string;
  viewerId?: string | null;
}) {
  const { generatedId, ownerId, viewerId } = params;
  const isOwner = viewerId === ownerId;

  return isOwner
    ? {
        id: generatedId,
        userId: ownerId,
      }
    : {
        id: generatedId,
        userId: ownerId,
        visibility: "PUBLIC" as const,
      };
}

export async function findGeneratedDetailViewModel(params: {
  generatedId: string;
  userId: string;
  viewerId?: string | null;
}): Promise<GeneratedDetailViewModel | null> {
  const { generatedId, userId, viewerId } = params;
  const isOwner = viewerId === userId;

  //コールバックトランザクション（全部成功か全部失敗かのどちらかにする仕組み）を使って2つのクエリ（generatedContentとlikedGenerated）を同時に（並列に）投げて、早く結果を得る。
   const { generatedContent, likedGenerated } = await prisma.$transaction(
    async (tx) => {
      const generatedContent = await tx.generatedContent.findFirst({
        where: buildViewableGeneratedWhere({
          generatedId,
          ownerId: userId,
          viewerId,
        }),
        include: generatedDetailInclude,
      });

      const likedGenerated = viewerId
        ? await tx.generatedContentLike.findFirst({
            where: {
              userId: viewerId,
              generatedContentId: generatedId,
            },
            select: {
              id: true,
            },
          })
        : null;

      return { generatedContent, likedGenerated };
    }
  );

  if (!generatedContent) return null;

  return {
    ...generatedContent,
    isOwner,
    likeCount: generatedContent._count.likes,
    isLiked: !!likedGenerated,
    canLike:
      !!viewerId &&
      !isOwner &&
      generatedContent.visibility === "PUBLIC",
  };
}

//結果から型定義する
const exploreGeneratedInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
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
} satisfies Prisma.GeneratedContentInclude;

export type ExploreGeneratedContentRecord = Prisma.GeneratedContentGetPayload<{
  include: typeof exploreGeneratedInclude;
}>;



//DBからexploreページおよびexplore作品一覧ページの情報を取得するための関数
export async function findPublishedGeneratedForExplore(params?: {
  limit?: number;
  q?: string;
  sort?: "latest" | "oldest" | "likes" | "genre";
}): Promise<ExploreGeneratedContentRecord[]> {
  const limit = params?.limit;
  const q = params?.q?.trim();
  const sort = params?.sort ?? "latest";

  return prisma.generatedContent.findMany({
    where: {
      visibility: "PUBLIC",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { generatedText: { contains: q, mode: "insensitive" } },
              {
                work: {
                  is: {
                    genre: { contains: q, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "latest"
        ? { createdAt: "desc" }
        : sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "likes"
        ? { likes: { _count: "desc" } }
        : sort === "genre"
        ? [{ work: { genre: "asc" } }, { createdAt: "desc" }]
        : { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
    include: exploreGeneratedInclude,
  });
}

//generated/page.tsx:自分の作品一覧ページ（公開/非公開どちらも含む）の情報を取得するための関数の処理
export type MyGeneratedSort = "latest" | "oldest" | "likes" | "genre";
export type MyGeneratedVisibility = "all" | "public" | "private";

const myGeneratedContentInclude = {
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
} satisfies Prisma.GeneratedContentInclude;

export type MyGeneratedContentRecord = Prisma.GeneratedContentGetPayload<{
  include: typeof myGeneratedContentInclude;
}>;

// 自分の作品一覧ページ（公開/非公開どちらも含む）の情報を取得するための関数
export async function findMyGeneratedContents(params: {
  userId: string;
  q?: string;
  sort?: MyGeneratedSort;
  visibility?: MyGeneratedVisibility;
}): Promise<MyGeneratedContentRecord[]> {
  const {
    userId,
    q,
    sort = "latest",
    visibility = "all",
  } = params;

  return prisma.generatedContent.findMany({
    where: {
      userId,
      ...(visibility === "public"
        ? { visibility: "PUBLIC" }
        : visibility === "private"
          ? { visibility: "PRIVATE" }
          : {}),
      ...(q?.trim()
        ? {
            OR: [
              { title: { contains: q.trim(), mode: "insensitive" } },
              {
                generatedText: {
                  contains: q.trim(),
                  mode: "insensitive",
                },
              },
              {
                work: {
                  is: {
                    genre: { contains: q.trim(), mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "latest"
        ? { createdAt: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : sort === "genre"
            ? [{ work: { genre: "asc" } }, { createdAt: "desc" }]
            : { likes: { _count: "desc" } },
    include: myGeneratedContentInclude,
  });
}

//記事からの作品集で使う情報を取得するための関数
export async function findGeneratedByWork(params: {
  workId: string;
  userId: string;
  viewerId?: string | null;
}) {
  const { workId, userId, viewerId } = params;
  const isOwner = viewerId === userId;

  return prisma.generatedContent.findMany({
    where: isOwner
      ? { workId, userId }
      : { workId, userId, visibility: "PUBLIC" },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      work: {
        select: {
          id: true,
          title: true,
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

//いいね作品一覧ページの情報を取得するための関数
export async function findVisibleLikedGeneratedContents(params: {
  userId: string;
  q?: string;
}) {
  const { userId, q } = params;

  return prisma.generatedContentLike.findMany({
    where: {
      userId,
      generatedContent: {
        visibility: "PUBLIC",
        ...(q?.trim()
          ? {
              OR: [
                { title: { contains: q.trim(), mode: "insensitive" } },
                {
                  generatedText: {
                    contains: q.trim(),
                    mode: "insensitive",
                  },
                },
                {
                  work: {
                    is: {
                      genre: { contains: q.trim(), mode: "insensitive" },
                    },
                  },
                },
              ],
            }
          : {}),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      generatedContent: {
        include: exploreGeneratedInclude
      },
    },
  });
}