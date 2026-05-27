//lib/ai/snapshots/feedback.ts
//フィードバック生成のためのスナップショット(必要なものだけを抽出したデータ)を作る関数

type FeedbackSnapshotParams = {
  work: {
    id: string;
    title: string;
    content: string;
    genre: string;
  };
};

export function buildFeedbackSnapshot({ work }: FeedbackSnapshotParams) {
  return {
    workId: work.id,
    title: work.title,
    content: work.content,
    genre: work.genre,
  };
}