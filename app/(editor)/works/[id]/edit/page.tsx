//app/(editor)/works/[id]/edit/page.tsx

//記事編集ページ

import { notFound } from "next/navigation";//404ページを表示するための関数
import WorkEditorForm from "@/components/work/work-editor-form";//記事編集フォームをインポート
import { prisma } from "@/src/infrastructure/prisma/client";//prismaを使ってデータ保存や記事探しをするクライアントをインポート
import { getRequiredAuthUser } from "@/lib/auth/get-auth-user";//ログイン中のユーザー情報を獲得する関数。未ログインならログインページ（/login）へリダイレクトを投げる
import { updateWorkAction } from "../../actions";//記事更新のアクション関数をインポート


type Props = {//URlからworkIdを受け取るための型定義
  params: Promise<{ id: string }>;
};

export default async function EditWorkPage({ params }: Props) {//記事編集ページのメイン関数（引数：params(workId)）
  const { id } = await params;//URLからworkIdを取得したら次へ行く
  const user = await getRequiredAuthUser();//ログイン中のユーザー情報をDBから取ってくる。未ログインならログインページ（/login）へリダイレクトを投げる

  const work = await prisma.work.findFirst({//prismaを使って条件に合う最初の１記事をDBのworkテーブルから取ってくる
    where: {//idがURLのworkIdと同じで、userIdがログイン中のユーザーIdと同じである記事を取ってくる。これにより、記事の所有者だけが編集ページにアクセスできるようになる。
      id,
      userId: user.id,
    },
  });

  if (!work) {//もし記事が見つからない場合は404
    notFound();
  }

  const action = updateWorkAction.bind(null, id);//更新ページアクションの引数はworkIdがいるので加える

  return (
    <main>
      <div className="p-6">
        <h1 className="text-2xl font-bold">記事を編集</h1>
      </div>

<WorkEditorForm
  action={action}
  defaultValues={{
    title: work.title,
    content: work.content,
    genre: work.genre,
    visibility: work.visibility,
  }}
  showBack
  backFallbackPath="/works/drafts"
/>
    </main>
  );
}

//Idをあらかじめセットする。formData(ユーザーが書き加えた新しい内容の記事データ)だけアクション関数（updateWorkAction）で受け取れるようにする
