//メインページ(/explore)（公開ページ）

import { createClient } from "@/infrastructure/supabase/server";
import LogoutButton from "@/components/logout-button";

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">explore</h1>
      <p className="mt-4">
        {user ? `ログイン中: ${user.email}` : "未ログイン"}
      </p>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </main>
  );
}