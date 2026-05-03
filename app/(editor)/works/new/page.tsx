//app/(editor)/works/new/page.tsx

//記事の新規作成ページ

import WorkEditorForm from "@/components/work/work-editor-form";//記事編集フォームをインポート
import { createWorkAction } from "../actions";//記事作成のアクション関数をインポート

export default function NewWorkPage() {//記事の新規作成ページのメイン関数
  return (
    <main>
      <div className="p-6">
        <h1 className="text-2xl font-bold">新しい記事</h1>
      </div>

      <WorkEditorForm 
       action={createWorkAction}
       showBack
       backFallbackPath="/works" 
       />
    </main>
  );
}

//WorkEditorFormを使って入力された値をcreateWorkActionによって実行する.
