//components/app/ExploreWorksListClient.tsx
//exploreの記事一覧ページで記事の表示部分をGenreGroupedListから切り出して、ContentMetaRow（いいね数、作者名、ジャンル、投稿日）を入れた窓口コンポーネント
"use client";

import Link from "next/link";
import GenreGroupedList, {
  type GenreGroupedListItem,
} from "@/components/app/GenreGroupedList";
import ContentMetaRow from "@/components/app/ContentMetaRow";

type ExploreWorksListItem = GenreGroupedListItem & {
  likeCount: number;
  userName: string;
  userAvatarUrl: string | null;
};

type Props = {
  items: ExploreWorksListItem[];
  sort: "latest" | "oldest" | "genre" | "likes" | "updated";
  emptyMessage: string;
};

export default function ExploreWorksListClient({
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