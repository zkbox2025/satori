// components/app/ContentMetaRow.tsx
//記事/作品の表示に使うメタ情報（いいね数、作者名、ジャンル、投稿日など）を表示するコンポーネント

import Image from "next/image";
import { formatRelativeDate } from "@/lib/formatters/date";


type Props = {
  likeCount?: number;
  authorName?: string;
  authorAvatarUrl?: string | null;
  genre?: string;
  date?: string | Date;
};

export default function ContentMetaRow({
  likeCount,
  authorName,
  authorAvatarUrl,
  genre,
  date,
}: Props) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
      {typeof likeCount === "number" && <span>♡{likeCount}</span>}

      {authorName && (
        <div className="flex items-center gap-2">
          {authorAvatarUrl && (
  <div className="relative h-5 w-5 overflow-hidden rounded-full shrink-0">
    <Image
      src={authorAvatarUrl}
      alt="作者アイコン"
      fill
      className="object-cover"
      unoptimized
    />
  </div>
)}
          <span>{authorName}</span>
        </div>
      )}

      {genre && <span>{genre}</span>}

      {date && <span>{formatRelativeDate(date)}</span>}
    </div>
  );
}