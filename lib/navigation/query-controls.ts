//lib/navigation/query-controls.ts
//URLのクエリパラメータを更新して画面遷移するための関数をまとめるところ
///works?q=猫&sort=latestがある場合、「q を別の文字に変えたい」「sort を消したい」などの操作をしたいときに、URLSearchParamsを直接いじるのは面倒なので、これらの関数を使って簡単にする

type QueryValue = string | null | undefined;//クエリパラメータ（q=猫&sort=latestなど）の値は文字列か、nullか、undefinedのどれか。

//クエリ文字列（q=猫&sort=latestなど）を作る関数
export function buildNextQueryString(
  currentSearchParams: string,//現在のクエリ文字列
  updates: Record<string, QueryValue>//キーが文字列(プロパティ名：qやsort)で値がQueryValueのオブジェクト。クエリパラメータの更新内容（例：{ q: "犬", sort: null }など）。この例ではqを「犬」に変えて、sortをクエリから削除することになる
) {
  const params = new URLSearchParams(currentSearchParams);//現在のクエリ文字列をコピーしてURLSearchParamsオブジェクト（クエリを編集しやすい形）を作る

  for (const [key, value] of Object.entries(updates)) {//updatesの中身を一つずつ取り出す
    const normalizedValue = typeof value === "string" ? value.trim() : value;//値が文字列なら前後の空白を削除してnormalizedValueに入れる。そうでないならそのままnormalizedValueに入れる

    if (!normalizedValue) {//normalizedValueが空文字列、null、undefinedのいずれかの場合は、そのキーをクエリから削除する
      params.delete(key);
      continue;
    }

    params.set(key, normalizedValue);//そうでない場合は、そのキーをクエリにセットする（すでに同じキーがあれば上書きされる）
  }

  return params.toString();//編集したクエリを文字列にして返す（例：q=猫&sort=latest）もしクエリが空なら空文字列を返す
}

//pathnameを含めて最終的なURL(works?q=猫&sort=latestなど)を作る関数
export function buildNextUrl(params: {
  pathname: string;//URLのパス（例：/exploreなど）
  currentSearchParams: string;//現在のクエリパラメータ（q=猫&sort=latestなど）
  updates: Record<string, QueryValue>;//クエリパラメータの更新内容（例：{ q: "犬", sort: null }など）。この例ではqを「犬」に変えて、sortをクエリから削除することになる
}) {
  const queryString = buildNextQueryString(//クエリ文字列を作る関数を呼び出しクエリパラメータ（q=猫&sort=latestなど）を作成する
    params.currentSearchParams,
    params.updates
  );

  return queryString ? `${params.pathname}?${queryString}` : params.pathname;//クエリ文字列が空でないならpathnameとクエリ文字列を組み合わせたURLを返す（例：/explore?q=猫&sort=latest）。クエリ文字列が空ならpathnameだけのURLを返す（例：/explore）
}