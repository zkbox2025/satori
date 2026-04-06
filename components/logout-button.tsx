"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border px-4 py-2"
    >
      ログアウト
    </button>
  );
}