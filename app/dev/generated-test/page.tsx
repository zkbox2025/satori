"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";

type Work = {
  id: string;
  title: string;
};

type Generated = {
  id: string;
  title: string;
  visibility: "PUBLIC" | "PRIVATE";
  generatedText: string;
  workId: string;
  userId: string;
};

export default function GeneratedTestPage() {
  const supabase = useMemo(() => createClient(), []);

  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState("");
  const [title, setTitle] = useState("テスト作品");
  const [generatedText, setGeneratedText] = useState("これは作品テストです");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [items, setItems] = useState<Generated[]>([]);
  const [message, setMessage] = useState("");

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("GeneratedContent")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setItems((data ?? []) as Generated[]);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const [{ data: worksData, error: worksError }, { data: itemsData, error: itemsError }] =
        await Promise.all([
          supabase
            .from("Work")
            .select("id, title")
            .order("createdAt", { ascending: false }),
          supabase
            .from("GeneratedContent")
            .select("*")
            .order("createdAt", { ascending: false }),
        ]);

      if (cancelled) return;

      if (worksError) {
        setMessage(worksError.message);
      } else {
        const safeWorks = (worksData ?? []) as Work[];
        setWorks(safeWorks);

        if (safeWorks.length > 0) {
          setSelectedWorkId((prev) => prev || safeWorks[0].id);
        }
      }

      if (itemsError) {
        setMessage(itemsError.message);
      } else {
        setItems((itemsData ?? []) as Generated[]);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const createGenerated = async () => {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("未ログインです");
      return;
    }

    if (!selectedWorkId) {
      setMessage("作品を選択してください");
      return;
    }

    const { error } = await supabase.from("GeneratedContent").insert({
  id: crypto.randomUUID(),
  title,
  generatedText,
  visibility,
  style: "POEM",
  modelName: "test-model",
  workId:selectedWorkId,
  userId: user.id,
  updatedAt: new Date().toISOString(),
});

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("作成しました");
    await fetchItems();
  };

  const makePublic = async (id: string) => {
    const { error } = await supabase
      .from("GeneratedContent")
      .update({ visibility: "PUBLIC" })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("公開に変更しました");
    await fetchItems();
  };

  const makePrivate = async (id: string) => {
    const { error } = await supabase
      .from("GeneratedContent")
      .update({ visibility: "PRIVATE" })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("非公開に変更しました");
    await fetchItems();
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">GeneratedContent test</h1>

      <select
        className="border px-3 py-2"
        value={selectedWorkId}
        onChange={(e) => setSelectedWorkId(e.target.value)}
      >
        {works.map((work) => (
          <option key={work.id} value={work.id}>
            {work.title}
          </option>
        ))}
      </select>

      <input
        className="w-full border px-3 py-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border px-3 py-2"
        value={generatedText}
        onChange={(e) => setGeneratedText(e.target.value)}
      />

      <select
        className="border px-3 py-2"
        value={visibility}
        onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
      >
        <option value="PRIVATE">PRIVATE</option>
        <option value="PUBLIC">PUBLIC</option>
      </select>

      <button className="border px-4 py-2 ml-2" onClick={createGenerated}>
        作品作成
      </button>

      {message && <p>{message}</p>}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border p-3">
            <p>id: {item.id}</p>
            <p>title: {item.title}</p>
            <p>visibility: {item.visibility}</p>
            <p>workId: {item.workId}</p>
            <p>userId: {item.userId}</p>
            <p>{item.generatedText}</p>

            <div className="mt-2 flex gap-2">
              <button className="border px-3 py-1" onClick={() => makePublic(item.id)}>
                PUBLICにする
              </button>
              <button className="border px-3 py-1" onClick={() => makePrivate(item.id)}>
                PRIVATEにする
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}