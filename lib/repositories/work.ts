//lib/repositories/work.ts
//DBから記事を取得する関数を集めたファイル（三項演算子による公開判定付き）

import { prisma } from "@/src/infrastructure/prisma/client";//DB書き換えの道具をインポート
import type { Prisma } from "@prisma/client";//Prismaの型をインポート（Prisma.WorkInclude（DBの情報取得の型のチェックを行う）やPrisma.WorkGetPayload（WorkDetailRecordとして返り値の型を定義化する）に使う）

//型定義してからメイン関数に入る
//❶まずはメイン関数（findWorkDetailViewModel）の結果を型定義する。
const workDetailInclude = {//DBからのInclude（追加情報）の型定義
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
 feedback: {
  select: {
    id: true,
    content: true,
    status: true,
    errorMessage: true,
    updatedAt: true,
  },
},
_count: {
  select: {
      likes: true,
    },
  },
} satisfies Prisma.WorkInclude;//DBからのInclude（追加情報）のコードの内容のチェックを行う（スキーマ定義と矛盾してないかをチェックする）

//Prisma.WorkGetPayload＝workを取得しそれに何かを合体させて型を定義する
export type WorkDetailRecord = Prisma.WorkGetPayload<{//DBからのInclude（追加情報）の取得＋work取得についてのDBからの返り値（WorkDetailRecord）の型を自動作成する
  include: typeof workDetailInclude;
}>;

export type WorkDetailViewModel = WorkDetailRecord & {//findWorkDetailViewModelの返り値の型定義（Include版DBからの返り値（WorkDetailRecord）＋加工情報）
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;
  canLike: boolean;
};

//❷どんな検索条件でDBから記事を探すかのメモ。findWorkDetailViewModel（DBから記事詳細ページの情報を取ってくる関数）で用いられる（同じファイル内で使われてるためエクスポートはなし）
function buildViewableWorkWhere(params: {
  workId: string;
  ownerId: string;//（userIdのこと）
  viewerId?: string | null;
}) {
  const { workId, ownerId, viewerId } = params;
  const isOwner = viewerId === ownerId;

  return isOwner
    ? {
        id: workId,
        userId: ownerId,
      }
    : {
        id: workId,
        userId: ownerId,
        status: "PUBLISHED" as const,
        visibility: "PUBLIC" as const,
      };
}


//❸DBから記事詳細ページの情報を取ってくるメイン関数(作成者が本人かどうか、いいね数（likeCount）、いいねを過去にしたか（isLiked）、いいねの権利はあるか(canlike)の判定付き)
export async function findWorkDetailViewModel(params: {
  workId: string;
  userId: string;
  viewerId?: string | null;
}): Promise<WorkDetailViewModel | null> {
  const { workId, userId, viewerId } = params;
  const isOwner = viewerId === userId;

  //コールバックトランザクション（全部成功か全部失敗かのどちらかにする仕組み）を使って2つのクエリ（work, likedWork）を同時に（並列に）投げて、早く結果を得る。
   const { work, likedWork } = await prisma.$transaction(async (tx) => {
    const work = await tx.work.findFirst({
      where: buildViewableWorkWhere({
        workId,
        ownerId: userId,
        viewerId,
      }),
      include: workDetailInclude,
    });

    const likedWork = viewerId
      ? await tx.workLike.findFirst({
          where: {
            userId: viewerId,
            workId,
          },
          select: {
            id: true,
          },
        })
      : null;

    return { work, likedWork };
  });

  if (!work) return null;

  return {
    ...work,
    isOwner,
    likeCount: work._count.likes,
    isLiked: !!likedWork,
    canLike:
      !!viewerId &&
      !isOwner &&
      work.visibility === "PUBLIC" &&
      work.status === "PUBLISHED",
  };
}

//型定義してからメイン関数に入る
//DBからexploreページおよびexplore記事一覧ページの情報を取得する関数（findPublishedWorksForExplore）とfindVisibleLikedWorks（いいね一覧ページの情報を取る関数）の結果を型定義する。
const exploreWorkInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
  _count: {
    select: {
      likes: true,
    },
  },
} satisfies Prisma.WorkInclude;

//Prisma.WorkGetPayload＝workを取得しそれに何かを合体させて型を定義する
export type ExploreWorkRecord = Prisma.WorkGetPayload<{//DBからのInclude（追加情報）の取得＋work取得についてのDBからの返り値（ExploreWork）の型を自動作成する
  include: typeof exploreWorkInclude;
}>;




//DBからexploreページおよびexplore記事一覧ページの情報を取得するための関数
export async function findPublishedWorksForExplore(params?: {
  limit?: number;
  q?: string;
  sort?: "latest" | "oldest" | "likes" | "updated" | "genre";
}): Promise<ExploreWorkRecord[]> {
  const limit = params?.limit;
  const q = params?.q?.trim();
  const sort = params?.sort ?? "latest";

  return prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
              { genre: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy:
  sort === "latest"
    ? { createdAt: "desc" }
    : sort === "oldest"
    ? { createdAt: "asc" }
    : sort === "updated"
    ? { updatedAt: "desc" }
    : sort === "likes"
    ? { likes: { _count: "desc" } }
    : sort === "genre"
    ? [{ genre: "asc" }, { createdAt: "desc" }]//第1優先: ジャンル名（昇順 / A→Z）第2優先: 作成日時（降順 / 新しい順）(ジャンル内で)
    : { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
    include: exploreWorkInclude,
  });
}



//works/page.tsx:自分の記事一覧ページの情報を取得するための関数のための処理
export type MyWorkSort =
  | "latest"
  | "oldest"
  | "likes"
  | "updated"
  | "genre";

export type MyWorkVisibility = "all" | "public" | "private";

const myPublishedWorkInclude = {
  _count: {
    select: {
      likes: true,
    },
  },
} satisfies Prisma.WorkInclude;

export type MyPublishedWorkRecord = Prisma.WorkGetPayload<{
  include: typeof myPublishedWorkInclude;
}>;

// 自分の記事一覧ページの情報を取得するための関数
export async function findMyPublishedWorks(params: {
  userId: string;
  q?: string;
  sort?: MyWorkSort;
  visibility?: MyWorkVisibility;
}): Promise<MyPublishedWorkRecord[]> {
  const {
    userId,
    q,
    sort = "updated",
    visibility = "all",
  } = params;

  return prisma.work.findMany({
    where: {
      userId,
      status: "PUBLISHED",
      ...(visibility === "public"
        ? { visibility: "PUBLIC" }
        : visibility === "private"
          ? { visibility: "PRIVATE" }
          : {}),
      ...(q?.trim()
        ? {
            OR: [
              { title: { contains: q.trim(), mode: "insensitive" } },
              { content: { contains: q.trim(), mode: "insensitive" } },
              { genre: { contains: q.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "latest"
        ? { createdAt: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : sort === "updated"
            ? { updatedAt: "desc" }
            : sort === "genre"
              ? [{ genre: "asc" }, { createdAt: "desc" }]
              : { likes: { _count: "desc" } },
    include: myPublishedWorkInclude,
  });
}

//下書き一覧ページの情報を取得するための関数
export async function findMyDraftWorks(params: {
  userId: string;
  q?: string;
}) {
  const { userId, q } = params;

  return prisma.work.findMany({
    where: {
      userId,
      status: "DRAFT",
      ...(q?.trim()
        ? {
            OR: [
              { title: { contains: q.trim(), mode: "insensitive" } },
              { content: { contains: q.trim(), mode: "insensitive" } },
              { genre: { contains: q.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}


//いいね記事一覧ページの情報を取得するための関数
export async function findVisibleLikedWorks(params: {
  userId: string;
  q?: string;
}) {
  const { userId, q } = params;

  return prisma.workLike.findMany({
    where: {
      userId,
      work: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
        ...(q?.trim()
          ? {
              OR: [
                { title: { contains: q.trim(), mode: "insensitive" } },
                { content: { contains: q.trim(), mode: "insensitive" } },
                { genre: { contains: q.trim(), mode: "insensitive" } },
              ],
            }
          : {}),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      work: {
        include: exploreWorkInclude,
      },
    },
  });
}