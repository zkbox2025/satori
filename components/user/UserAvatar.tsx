//components/user/UserAvatar.tsx
//アイコン画像のみのファイル（未設定表示やサイズ変更など）

import Image from "next/image";

type Props = {
  avatarUrl: string | null;
  size?: number;
  alt?: string;
  fallbackText?: string;
};

export default function UserAvatar({
  avatarUrl,
  size = 64,
  alt = "アイコン画像",
  fallbackText = "未設定",
}: Props) {
  if (!avatarUrl) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border text-sm text-gray-500"
        style={{ width: size, height: size }}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarUrl}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}