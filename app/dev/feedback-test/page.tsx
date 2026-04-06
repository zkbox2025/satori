"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";

type Work = {
  id: string;
  title: string;
};

type Feedback = {
  id: string;
  workId: string;
  userId: string;
  content: string;
};

export default function FeedbackTestPage() {
  const supabase = useMemo(() => createClient(), []);

  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState("");
  const [content, setContent] = useState("これはテスト用フィードバックです");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [message, setMessage] = useState("");

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("Feedback")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setFeedbacks((data ?? []) as Feedback[]);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const [{ data: worksData, error: worksError }, { data: feedbacksData, error: feedbacksError }] =
        await Promise.all([
          supabase
            .from("Work")
            .select("id, title")
            .order("createdAt", { ascending: false }),
          supabase
            .from("Feedback")
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

      if (feedbacksError) {
        setMessage(feedbacksError.message);
      } else {
        setFeedbacks((feedbacksData ?? []) as Feedback[]);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const saveFeedback = async () => {
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

    const { data: existing, error: existingError } = await supabase
      .from("Feedback")
      .select("id")
      .eq("workId", selectedWorkId)
      .maybeSingle();

    if (existingError) {
      setMessage(existingError.message);
      return;
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("Feedback")
        .update({ content, userId: user.id })
        .eq("id", existing.id);

      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("Feedback").insert({
  id: crypto.randomUUID(),
  content,
  workId:selectedWorkId,
  userId: user.id,
  updatedAt: new Date().toISOString(),
});

      if (error) {
        setMessage(error.message);
        return;
      }
    }

    setMessage("保存しました");
    await fetchFeedbacks();
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Feedback test</h1>

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

      <textarea
        className="w-full border px-3 py-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button className="border px-4 py-2" onClick={saveFeedback}>
        Feedback保存
      </button>

      {message && <p>{message}</p>}

      <div className="space-y-3">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="border p-3">
            <p>id: {fb.id}</p>
            <p>workId: {fb.workId}</p>
            <p>userId: {fb.userId}</p>
            <p>{fb.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}