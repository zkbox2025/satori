//components/app/GeneratedGroupedListClient.tsx
//自分の作品一覧ページの作品の表示部分をGenreGroupedListから切り出して、「・・・」を入れられるようにした窓口コンポーネント


"use client";

import Link from "next/link";
import GenreGroupedList, {
  type GenreGroupedListItem,
} from "@/components/app/GenreGroupedList";
import GeneratedListItemMenu from "@/components/app/GeneratedListItemMenu";
import type { SortOption } from "@/components/app/ListControls";
import ContentMetaRow from "@/components/app/ContentMetaRow";

export type GeneratedGroupedListItem = GenreGroupedListItem & {
  likeCount: number;
};


type Props = {
  items: GeneratedGroupedListItem[];
  sort: SortOption;
  emptyMessage: string;
};

export default function GeneratedGroupedListClient({
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
        <div key={item.id} className="rounded-md border p-4">
          <div className="flex items-start justify-between gap-4">
            <Link href={item.href} className="block min-w-0 flex-1">
              <p className="font-semibold">{item.title}</p>
              <ContentMetaRow
              likeCount={item.likeCount}
              genre={item.genre}
              date={item.createdAt}
                           />
              {item.visibilityLabel && (
                <p className="mt-2 text-sm">{item.visibilityLabel}</p>
              )}
            </Link>

            <GeneratedListItemMenu
              generatedId={item.id}
              redirectAfterDelete="/generated"
            />
          </div>
        </div>
      )}
    />
  );
}