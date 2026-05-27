//components/user/user-profile-page.tsx
//マイページで使うユーザー操作用コンポーネント

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";//useMemo：材料が変わったときだけ再計算するパーツをインポート。useState：データを覚えておくようにする関数をインポート
import { useRouter } from "next/navigation";//画面を遷移させる道具（ブラウザ用）（リダイレクトはサーバー用）
import GenreGroupedList from "@/components/app/GenreGroupedList";
import UserHeaderCard from "@/components/user/UserHeaderCard";
import ContentMetaRow from "@/components/app/ContentMetaRow";


//引数で使うタイプを定義
type WorkItem = {
  id: string;
  title: string;
  genre: string;
  createdAt: string;
  likeCount: number;
};

type GeneratedContentItem = {
  id: string;
  title: string;
  genre: string;
  createdAt: string;
  likeCount: number;
};

//引数を以下に定義する
type Props = {
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
  initialTab: "works" | "generated";
  works: WorkItem[];
  generatedContents: GeneratedContentItem[];
};


export default function UserProfilePage({//マイページで使うメインコンポーネント関数
  //引数は以下の通り
  user,
  initialTab,
  works,
  generatedContents,
}: Props) {
  const router = useRouter();//画面を遷移させる道具をrouterとして定数化する

  //以下、ユーザーの操作によりどのように表示が変わるかを把握しやすくしている
  const [keyword, setKeyword] = useState("");//検索窓に入力したテキストにより表示が切り替わる
  const [tab, setTab] = useState<"works" | "generated">(initialTab);//タブにより表示が切り替わる
  const [sort, setSort] = useState<"latest" | "genre">("latest");//最新順かジャンル別かで並べ替えられる

  const normalizedKeyword = keyword.trim().toLowerCase();//検索する文字について前後の空白や改行をなくして、小文字に統一する

  //以下、検索により並べ替えられた記事/作品（詳細ページへのリンク付き）をtargetItemsとして定数化する（usememoにより検索された時のみ計算しそれ以外は元の計算結果を使う）
  const targetItems = useMemo(() => {
    const base =
      tab === "works"//記事タブの時に記事カードにつけるリンクを作成
        ? works.map((item) => ({
            ...item,
            href: `/users/${user.id}/works/${item.id}`,
          }))
        : generatedContents.map((item) => ({//作品タブの時に作品カードにつけるリンクを作成
            ...item,
            href: `/users/${user.id}/generated/${item.id}`,
          }));

    if (!normalizedKeyword) return base;//検索キーワードがなければそのまま表示

    return base.filter((item) =>//すでに取得済みの記事作品の中のタイトルとジャンルを合体させた文字列の中に検索ワードが含まれているかをチェックし、どちらかのキーワードに入っていれば表示
      `${item.title} ${item.genre}`.toLowerCase().includes(normalizedKeyword)
    );
  }, [tab, works, generatedContents, normalizedKeyword, user.id]);//useMemoを発動してこの中のどれか一つでも変わったときだけリストを作り直すこと



  const handleTabChange = (nextTab: "works" | "generated") => {//プルダウンメニューから記事か作品かを選択でき、以下、一度に表示される数と遷移先になる
    setTab(nextTab);
    router.push(`/users/${user.id}?tab=${nextTab}`);//遷移先
  };


  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
  <UserHeaderCard
    name={user.name}
    avatarUrl={user.avatarUrl}
    bio={user.bio?.trim() ? user.bio : "自己紹介はまだありません"}
  />
</div>


      <div className="mb-4 flex gap-3">
        <input
          value={keyword}
          onChange={(e) => 
            setKeyword(e.target.value)}
          placeholder="記事 / 作品を検索"
          className="flex-1 rounded-md border px-3 py-2"
        />

        <button
          type="button"
          onClick={() => history.back()}
          className="rounded-md border px-4 py-2"
        >
          戻る
        </button>
      </div>

      <div className="mb-6 flex gap-3">
        <select
          value={tab}
          onChange={(e) => handleTabChange(e.target.value as "works" | "generated")}
          className="rounded-md border px-3 py-2"
        >
          <option value="works">記事</option>
          <option value="generated">作品</option>
        </select>

        <select
          value={sort}
          onChange={(e) => 
            setSort(e.target.value as "latest" | "genre")
          }
          className="rounded-md border px-3 py-2"
        >
          <option value="latest">最新順</option>
          <option value="genre">ジャンル別</option>
        </select>
      </div>

<GenreGroupedList
  items={targetItems}
  sort={sort}
  emptyMessage={
    keyword
      ? "検索結果がありません"
      : `まだ${tab === "works" ? "記事" : "作品"}がありません`
  }
  renderItem={(item) => (
    <Link
      key={item.id}
      href={item.href}
      className="block rounded-md border p-4"
    >
      <p className="font-semibold">{item.title}</p>
      <ContentMetaRow
        likeCount={item.likeCount}
        genre={item.genre}
        date={item.createdAt}
      />
    </Link>
  )}
/>
    </main>
  );
}