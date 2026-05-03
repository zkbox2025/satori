//components/app/DraftWorksListClient.tsx
//自分の下書き一覧ページの記事の表示部分をGenreGroupedListから切り出して、「・・・」を入れられるようにした窓口コンポーネント


"use client";

import Link from "next/link";
import WorkListItemMenu from "@/components/app/WorkListItemMenu";
import ContentMetaRow from "@/components/app/ContentMetaRow";



type Item = {
  id: string;
  title: string;
  genre: string;
  href: string;
  updatedAt: string;
};

type Props = {
  items: Item[];
  emptyMessage: string;
};

export default function DraftWorksListClient({ items, emptyMessage }: Props) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border p-4">
          <div className="flex items-start justify-between gap-4">
            <Link href={item.href} className="block min-w-0 flex-1">
              <p className="font-semibold">{item.title}</p>
              <ContentMetaRow
                genre={item.genre}
                date={item.updatedAt}
              />
            </Link>

            <WorkListItemMenu
              workId={item.id}
              redirectAfterDelete="/works/drafts"
            />
          </div>
        </div>
      ))}
    </div>
  );
}