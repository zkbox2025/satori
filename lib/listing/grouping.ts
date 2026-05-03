//lib/listing/grouping.ts
//ジャンルの一覧表示のための整形ファイル（ジャンルごとに見出しがあり五十音順に並べ替えられており、ジャンル内の記事作品は生成順に並んでいる状態を作る）

export type GenreGroupedEntry<T> = [string, T[]];//（string:ジャンル名、T[]:ジャンルのデータリスト）をGenreGroupedEntryとして定数化する

//データをジャンルごとにグループ分けをする関数
export function groupByGenre<T extends { genre: string }>(items: T[]) {//ジャンルの項目があるならどんな種類でもOK
  return items.reduce<Record<string, T[]>>((acc, item) => {//リストを一つずつ取り出して一つの大きなオブジェクト（acc:ジャンルの箱）にまとめる
    if (!acc[item.genre]) acc[item.genre] = [];//もしacc:ジャンルの箱がなかったら新しくからの配列を作る
    acc[item.genre].push(item);//acc:ジャンルの箱にデータをいれる
    return acc;//acc:ジャンルの箱を返す
  }, {});//初期値は何もない
}

//グループ化したあと、ジャンル見出しを五十音順に並べる関数
export function getSortedGenreEntries<T extends { genre: string }>(
  items: T[]
): GenreGroupedEntry<T>[] {
  const grouped = groupByGenre(items);//ジャンルごとに並び替える関数にデータを入れる

  return Object.entries(grouped).sort((a, b) =>//グループをセットしやすい形に変換する
    a[0].localeCompare(b[0], "ja")//ジャンルごとに日本語のあいうえお順に並べ替える
  );
}

//各ジャンルの表示件数を取る小関数
export function getGenreLimit(
  genreLimits: Record<string, number>,
  genre: string,
  initial = 5
) {
  return genreLimits[genre] ?? initial;//genreLimits[genre]がnullかundefinedなら初期値（5）になる
}

//もっと見るを押したジャンルだけ増やす処理関数
export function expandGenreLimit(
  prev: Record<string, number>,
  genre: string,
  step = 5,
  initial = 5
) {
  return {
    ...prev,
    [genre]: (prev[genre] ?? initial) + step,
  };
}
