
//components/work/work-editor-form.tsx
//記事の新規作成と編集で使える入力画面コンポーネント(入力された値をアクション関数に渡す役割まである)

"use client";

import { useActionState } from "react";//フォーム送信結果をstateとして持てる仕組み（最初と処理結果を記録しておくため）
import type { WorkActionState } from "@/app/(editor)/works/actions";//エラーは文字列、成功はnull（表示なし）になるという状態の型定義をインポート
import { WORK_GENRES } from "@/src/constants/work-genres";//ジャンルの選択肢一覧のファイルをインポート
import BackButton from "@/components/app/BackButton";

type Props = {//引数の型定義(defaultValuesとaction)
  defaultValues?: {//？：渡してもいいし渡さなくてもいい（新規はなしで編集はあり）
    title: string;
    content: string;
    genre: string;
    visibility: "PUBLIC" | "PRIVATE";
  };
  action: (//送信時に使う関数（createWorkActionもしくはupdateWorkAction（workId代入ずみ））を親から引数として受け取る
    state: WorkActionState,
    formData: FormData
  ) => Promise<WorkActionState>;
  
  showBack?: boolean;
  backFallbackPath?: string;
};

const initialWorkActionState: WorkActionState = { error: null };


export default function WorkEditorForm({
  defaultValues, 
  action, 
  showBack = false,
  backFallbackPath = "/works",
 }: Props) {//defaultValues(updateのみ)とactionを親から受け取る引数とする 
  const [state, formAction] = useActionState(action, initialWorkActionState);//action, initialWorkActionStateを始め値として記録し、結果の値をstate, formAction(create/updateWorkActionの結果)とする（ useActionState ）
  

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-4 p-6">
      <input
        name="title"
        placeholder="タイトル"
        defaultValue={defaultValues?.title ?? ""}
        className="w-full rounded-md border px-3 py-2"
      />

      <select
        name="genre"
        defaultValue={defaultValues?.genre ?? ""}
        className="w-full rounded-md border px-3 py-2"
      >
        <option value="" disabled>
          ジャンルを選択してください
        </option>
        {WORK_GENRES.map((genre) => (//キーでどの項目が変更・追加・削除されたか効率よく把握しやすくする。valueはプログラムが何を選んだかを把握するデータ（裏の顔）で、オプションに挟まれたのが表示。
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <textarea
        name="content"
        placeholder="本文"
        defaultValue={defaultValues?.content ?? ""}
        className="min-h-75 w-full rounded-md border px-3 py-2"
      />

      <select
        name="visibility"
        defaultValue={defaultValues?.visibility ?? "PRIVATE"}
        className="rounded-md border px-3 py-2"
      >
        <option value="PRIVATE">非公開</option>
        <option value="PUBLIC">公開</option>
      </select>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          name="submitType"
          value="draft"
          className="rounded-md border px-4 py-2"
        >
          下書き保存
        </button>

        <button
          type="submit"
          name="submitType"
          value="publish"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          保存する
        </button>
      </div>
      {showBack && <BackButton fallbackPath={backFallbackPath} className="mt-0.4" />}
    </form>
  );
}

//ユーザーが保存ボタン（type="submit"）を押す。
//ブラウザが name のついた項目の値をすべて集め、FormData オブジェクトを作る。
//その FormData が、<form> の action に設定した formAction に自動的に渡される。
//formAction の中身である元の action（create/updateWorkAction） が実行される。
//つまり、「name で名前をつけて、form action でアクション関数へ放り投げる」という連携によって、入力値がアクションに届くようになっています