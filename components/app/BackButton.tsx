// components/app/BackButton.tsx

"use client";

import { useSafeBack } from "@/lib/navigation/use-safe-back";

type Props = {
  label?: string;
  fallbackPath?: string;
  className?: string;
};

export default function BackButton({
  label = "戻る",
  fallbackPath = "/explore",
  className = "",
}: Props) {
  const handleBack = useSafeBack(fallbackPath);



  return (
    <button
      type="button"
      onClick={handleBack}
      className={`rounded-md border px-4 py-2 ${className}`}
    >
      {label}
    </button>
  );
}