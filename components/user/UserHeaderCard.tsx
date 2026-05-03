//components/user/UserHeaderCard.tsx
//アイコン・名前などのヘッダーのファイル

import Link from "next/link";
import UserAvatar from "@/components/user/UserAvatar";

type Props = {
  name: string | null;
  avatarUrl: string | null;

  bio?: string | null;
  dateText?: string | null;

  nameHref?: string;
  onNameClick?: () => void;

  rightAction?: React.ReactNode;

};

export default function UserHeaderCard({
  name,
  avatarUrl,
  bio,
  dateText,
  nameHref,
  onNameClick,
  rightAction,
}: Props) {
  const displayName = name ?? "ユーザー";

  const nameNode = nameHref ? (
    <Link
      href={nameHref}
      onClick={onNameClick}
      className="text-lg font-semibold"
    >
      {displayName}
    </Link>
  ) : (
    <p className="text-lg font-semibold">{displayName}</p>
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar avatarUrl={avatarUrl}/>

        <div className="min-w-0">
          {nameNode}

          {dateText && (
            <p className="mt-1 text-sm text-gray-500">{dateText}</p>
          )}

          {bio && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {bio}
            </p>
          )}
        </div>
      </div>

      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
}