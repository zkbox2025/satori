//components/app/ExploreGeneratedListClient.tsx
//exploreの作品一覧ページで作品の表示部分をGenreGroupedListから切り出して、ContentMetaRow（いいね数、作者名、ジャンル、投稿日）を入れた窓口コンポーネント

"use client";

import Link from "next/link";
import GenreGroupedList, {
  type GenreGroupedListItem,
} from "@/components/app/GenreGroupedList";
import ContentMetaRow from "@/components/app/ContentMetaRow";

type ExploreGeneratedListItem = GenreGroupedListItem & {
  likeCount: number;
  userName: string;
  userAvatarUrl: string | null;
};

type Props = {
  items: ExploreGeneratedListItem[];
  sort: "latest" | "oldest" | "genre" | "likes";
  emptyMessage: string;
};

export default function ExploreGeneratedListClient({
  items,
  sort,
  emptyMessage,
}: Props) {
  return (
    <GenreGroupedList
      items={items}
      sort={sort}
      emptyMessage={emptyMessage}
      renderItem={(item) => (
        <Link
          key={item.id}
          href={item.href}
          className="block rounded-md border p-4"
        >
          <p className="font-semibold">{item.title}</p>

          <ContentMetaRow
            likeCount={item.likeCount}
            authorName={item.userName}
            authorAvatarUrl={item.userAvatarUrl}
            genre={item.genre}
            date={item.createdAt}
          />
        </Link>
      )}
    />
  );
}