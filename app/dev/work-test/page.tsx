"use client";

import { useMemo, useState, useEffect } from "react";
import { createClient } from "@/infrastructure/supabase/client";

type Work = {
  id: string;
  title: string;
  content: string;
  genre: string;
  visibility: "PUBLIC" | "PRIVATE";
  status: "DRAFT" | "PUBLISHED";
  userId: string;
};

export default function WorkTestPage() {
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState("Aの非公開記事");
  const [content, setContent] = useState("これはAだけが見える想定の記事です");
  const [genre, setGenre] = useState("mental-health");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [works, setWorks] = useState<Work[]>([]);
  const [message, setMessage] = useState("");

  const fetchWorks = async () => {
    const { data, error } = await supabase
      .from("Work")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setWorks((data ?? []) as Work[]);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data, error } = await supabase
        .from("Work")
        .select("*")
        .order("createdAt", { ascending: false });

      if (cancelled) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      setWorks((data ?? []) as Work[]);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const createWork = async () => {
  setMessage("");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setMessage("未ログインです");
    return;
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("Work").insert({
    id: crypto.randomUUID(),
    title,
    content,
    genre,
    visibility,
    status,
    userId: user.id,
    updatedAt: now,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("作成しました");
  fetchWorks();
};
  const makePublic = async (id: string) => {
    const { error } = await supabase
      .from("Work")
      .update({ visibility: "PUBLIC", status: "PUBLISHED" })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("公開に変更しました");
    await fetchWorks();
  };

  const makePrivate = async (id: string) => {
    const { error } = await supabase
      .from("Work")
      .update({ visibility: "PRIVATE", status: "PUBLISHED" })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("非公開に変更しました");
    await fetchWorks();
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Work test</h1>

      <div className="space-y-2">
        <input
          className="w-full border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
        />
        <textarea
          className="w-full border px-3 py-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="content"
        />
        <input
          className="w-full border px-3 py-2"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="genre"
        />
        <select
          className="border px-3 py-2"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
        >
          <option value="PRIVATE">PRIVATE</option>
          <option value="PUBLIC">PUBLIC</option>
        </select>
        <select
          className="border px-3 py-2 ml-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
        >
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>

        <button className="border px-4 py-2" onClick={createWork}>
          Workを作る
        </button>
      </div>

      {message && <p>{message}</p>}

      <div className="space-y-3">
        {works.map((work) => (
          <div key={work.id} className="border p-3">
            <p>id: {work.id}</p>
            <p>title: {work.title}</p>
            <p>visibility: {work.visibility}</p>
            <p>status: {work.status}</p>
            <p>userId: {work.userId}</p>

            <div className="mt-2 flex gap-2">
              <button className="border px-3 py-1" onClick={() => makePublic(work.id)}>
                PUBLICにする
              </button>
              <button className="border px-3 py-1" onClick={() => makePrivate(work.id)}>
                PRIVATEにする
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}