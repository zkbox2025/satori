//lib/ai/snapshots/generated-content.ts
//作品生成のためのスナップショット(必要なものだけを抽出したデータ)を作る関数

type GeneratedSnapshotParams = {
  work: {
    id: string;
    title: string;
    content: string;
    genre: string;
  };
  style: "POEM";
};

export function buildGeneratedContentSnapshot({
  work,
  style,
}: GeneratedSnapshotParams) {
  return {
    workId: work.id,
    title: work.title,
    content: work.content,
    genre: work.genre,
    style,
  };
}