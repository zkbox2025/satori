//components/app/WorksGroupedListClient.tsx
//自分の記事一覧ページの記事の表示部分をGenreGroupedListから切り出して、「・・・」と「いいね数、ジャンル名、生成日（ContentMetaRow）」を入れられるようにした窓口コンポーネント

"use client";

import Link from "next/link";
import GenreGroupedList, {
  type GenreGroupedListItem,
} from "@/components/app/GenreGroupedList";
import WorkListItemMenu from "@/components/app/WorkListItemMenu";
import ContentMetaRow from "@/components/app/ContentMetaRow";
import type { SortOption } from "@/components/app/ListControls";

export type WorksGroupedListItem = GenreGroupedListItem & {
  likeCount: number;
};

type Props = {
  items: WorksGroupedListItem[];
  sort: SortOption;
  emptyMessage: string;
};

export default function WorksGroupedListClient({
  items,
  sort,
  emptyMessage,
}: Props) {
  return (
    <GenreGroupedList
      items={items}
      sort={sort}
      emptyMessage={emptyMessage}
      renderItem={(workItem) => (
        <div key={workItem.id} className="rounded-md border p-4">
          <div className="flex items-start justify-between gap-4">
            <Link href={workItem.href} className="block min-w-0 flex-1">
              <p className="font-semibold">{workItem.title}</p>

              <ContentMetaRow
                likeCount={workItem.likeCount}
                genre={workItem.genre}
                date={workItem.createdAt}
              />

              {workItem.visibilityLabel && (
                <p className="mt-2 text-sm">{workItem.visibilityLabel}</p>
              )}
            </Link>

            <WorkListItemMenu
              workId={workItem.id}
              redirectAfterDelete="/works"
            />
          </div>
        </div>
      )}
    />
  );
}