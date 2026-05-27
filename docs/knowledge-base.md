# satori Knowledge Base
//開発中の学習のまとめ

## 1. 認証と Supabase Auth
- Auth は「この人が誰か」を特定し、ログイン状態を管理する仕組み。
- createBrowserClient はユーザー操作用。ログイン、ログアウト、フォーム送信などで使う。
- createServerClient はサーバー側で Cookie を使ってログイン判定し、認証付きデータ取得を行う。
- middleware は未ログイン時のリダイレクト制御に使う。
- Cookie には access token と refresh token が入る。
- session はログイン状態そのものを指す。


🔑 1. 認証の4つの重要要素
・NEXT_PUBLIC_SUPABASE_ANON_KEY：ブラウザがSupabaseの窓口へアクセスするための公開用合言葉。
・SUPABASE_JWT_SECRET：Next.jsとDBだけが知っている、トークン改ざんを暴く秘密の合言葉（Vercel等の環境変数には設定不要）。
・access_token：auth.users の UUID が入った「1時間限定のデジタル会員証」。ログイン中の決定的な証明書。・refresh_token：アクセストークンが切れた時に、自動で新品の証明書を再発行してもらうための「更新券（期限：約1週間）」。

🔄 2. ログインと検証の流れ（二重チェック）
ログイン時：DBが2つのトークンを発行 ➔ createServerClient がクッキーの箱に包み、ブラウザへ渡す。
検証（1回目）：Next.js（createServerClient）が届いたクッキーを開け、JWT_SECRET を使って改ざんがないか手元で検証。
検証（2回目）：その先にあるDB（Supabase）も、アクセストークン（UUIDや有効期限）を最終チェックし、安全にデータを返す。
継続：リフレッシュトークンの期限が切れるまで、ユーザーは再ログイン不要。

💻 3. ローカル環境の構築（Docker）
supabase init：プロジェクトの初期設定ファイルを作成。
supabase start：Dockerコンテナを立ち上げ、パソコン内に仮想のSupabaseを起動。
supabase status -o envにより.env.local に貼り付けるための接続情報（URL や ANON_KEY など）をターミナルに一括出力。

👥 4. 登場人物と役割分担
ブラウザ（ユーザー側）：リクエストを送り、クッキー（トークン）を自動同封する。
アプリサーバー（Next.js）：createServerClient が動き、クッキーの開封・改ざん検証・DBへの仲介を行う。Supabase（DB / Auth）：トークンの新規発行や、データの最終チェックを行う。

🗂️ 5. Supabaseの3大機能の違い:PostgreSQL（ポスグレ）にある3つの部屋（スキーマ）
1.Supabase Auth：メールアドレス・パスワード・UUIDの管理、クッキー（会員証）の発行（開発者がこのデータを書き換えることは基本できない）
2.DB（Public）：テキストや数値などの文字データの管理（schema.prisma）。閲覧制限（RLS）は SQL Editor で直接記述する。Table Editorでスキーマ内のモデル（userなど）を開発者が自由に追加/変更できる。UUID＝userIdにより Authと紐付けされている。※RPC：SQL Editorに直接書き込む。Authの部屋のデータが追加されたらDBにも同じデータを追加するという関数。例）アカウントを作成したら、 AuthのuserテーブルにUUIDとして追加されたものがDB（Public）のuserモデルのuserIdにも同じものが追加されるというもの。
3.Storage（ストレージ）：画像、動画、PDFなど、容量の大きいデータの保管庫。ちなみにDBには保管庫のファイルパス（住所）が保存されてあり、軽くしている。


## 2. Supabase / Prisma の使い分け
- Supabase client:
  - Auth
  - Storage
  - RLS 前提のアクセス
  - 軽いユーザー依存データ取得
- Prisma client:
  - 複雑な取得
  - include / relation / 集計
  - 認可はコードで明示的に書く必要がある
- 方針:
  - 認証は Supabase
  - DB ロジックは Prisma
  - Storage は Supabase

## 3. RLS の基本
- RLS は行ごとのアクセス制限。
- USING:
  - 既存の行にアクセスしてよいか
  - SELECT / UPDATE / DELETE で使う
- WITH CHECK:
  - 保存してよい内容か
  - INSERT / UPDATE で使う
- 例:
  - `auth.uid()::text = "userId"` は「この行の userId が自分ならOK」

## 4. React / Next.js の基本メモ
- map は配列を表示用 JSX に変換するときに使う。
- key は React が差分更新のために必要。
- useActionState はフォーム送信 → action 実行 → 結果表示の流れをまとめる。
- bind は action に追加引数を渡したいときに使う。
- `??` は null / undefined のときだけ右側を使う。
- `"use server"` のあるファイルでは非同期関数を export する。

## 5. エラー処理ルール
- ページ表示不可 → `notFound()`
- フォーム入力不備 → `return { error: ... }`
- 想定外障害 → `throw`

## 6. $transaction
- 複数の処理を「全部成功」か「全部失敗」にする仕組み。
- 配列版:
  - 単純にまとめて実行する
  - 途中で条件分岐しにくい
- コールバック版:
  - 途中にロジックを挟める
  - 条件付きクエリに向いている

## 7. useActionState の実践ルール
- action の引数は基本:
  - 第一引数: state
  - 第二引数: FormData
- 追加引数が欲しいときは `bind(null, extraArg)` を使う。
- ボタン近くにエラー表示したいときに向いている。

## 8. 画像アップロード
- next.config.ts で remotePatterns と bodySizeLimit を設定する。
- env.local の URL と remotePatterns の不一致に注意。
- 画像本体は Storage、DB には公開URLや保存先を持つ。
- ローカルでは `unoptimized` が必要なことがある。

## 9. DB と Storage の違い
- DB:
  - 文章、名前、URL、ID など軽いデータ
- Storage:
  - 画像や動画など重いファイル本体

## 10. PDF 出力
- react-pdf/renderer は PDF が理解しやすい形式でレイアウトを組める。
- HTML ベースより崩れにくい。
- renderToBuffer は PDF データへ変換する中心処理。

## 11. 開発中によく使う確認
- Prisma schema 変更後:
  - `npx prisma generate`
- モデル名に赤線が出るとき:
  - TypeScript: Restart TS Server
- Supabase ローカル環境:
  - `supabase init`
  - `supabase start`
  - `supabase status -o env`

## 12. よく出る用語
- row = 横の並び
- column = 縦の並び
- select = 読む
- payload = 追加データ
- debounce = 入力連打を間引く

## 13.zodによるスキーマ（型チェック）について
- 型チェック（タイトルとテキストは必須で文字制限を行う）を作品生成結果にのみつけて、フィードバック生成にはつけてない理由は以下の通り
作品生成（callLLMJson） に schema / schemaName がある理由は、返してほしいものが「決まった形のJSON」だから。例）title,content,genre。一方で、フィードバック生成には、text:stringで文章をそのまま使っているので型がない。よってスキーマは必要ないためつけていない。

## 14. map と表示用データの考え方

- DBから取得したデータは基本的に「配列」として扱う。
- `map` は、配列の中身を1件ずつ取り出して、表示用の JSX や表示用オブジェクトに変換するときに使う。
- 一覧表示では、生データをそのまま画面に出すのではなく、必要な値だけを取り出して表示用データに加工してから使うと扱いやすい。
- たとえば `id` / `title` / `genre` / `href` / `updatedAt` など、画面表示やリンク遷移に必要な値を1件ずつまとめる。

例:

```ts
const works = await findMyDraftWorks({
  userId: user.id,
  q: currentQuery,
});

const items = works.map((work) => ({
  id: work.id,
  title: work.title,
  genre: work.genre,
  href: `/works/${work.id}/edit`,
  updatedAt: work.updatedAt.toISOString(),
}));
```

この場合、`works` はDBから取得した配列で、`items` は画面表示用に加工した配列。  
`map` によって、配列の中の1件1件を表示しやすい形に変換している。


## 15. renderItem の役割

- `renderItem` は、一覧の1件分のデザインを外側から渡せるようにする仕組み。
- 一覧表示の共通処理はそのまま使いながら、「カードの見た目」だけを親コンポーネント側で自由に決められる。
- 記事一覧・作品一覧・下書き一覧などで、一覧表示のロジックは共通にしつつ、1件分の表示だけ変えたいときに使う。
- `map` で1件ずつ表示する場合、React が各要素を識別できるように、一番外側の要素には `key` が必要。

例:

```tsx
{items.map((item) => renderItem(item))}
```

`renderItem(item)` によって、1件分のデータをどのような JSX で表示するかを外側から決められる。


## 16. URLパラメータの基本

URLパラメータは、検索条件や並び替え条件などをURLに持たせる仕組み。

例:

```txt
/works?q=a&sort=latest&visibility=all
```

それぞれの記号の意味:

- `?`
  - URLパラメータの開始位置を表す。
  - URLの中で1回だけ使う。
- `&`
  - 次の条件を追加するための接着剤。
  - 複数の条件をつなげるときに使う。
- `=`
  - 左側の名前に対して、右側の値を入れるという意味。

例:

```txt
?q=a&sort=latest&visibility=all
```

これは以下の意味になる。

```txt
q = a
sort = latest
visibility = all
```

つまり、「検索ワードは `a`」「並び順は `latest`」「表示対象は `all`」という条件をURLに持たせている。


## 17. 絞り込み処理の設計パターン

一覧の絞り込みには、大きく分けて2つの方法がある。

### 1. URLの条件を使ってDB取得時点で絞り込むパターン

`app/(app)/works/page.tsx` では、`q` / `sort` / `visibility` をURLから読み取り、それを repository に渡してDB取得の条件にしている。

流れ:

```txt
ListControls がURLを発行
↓
/works?q=a&sort=latest&visibility=all
↓
page.tsx が searchParams から q / sort / visibility を読む
↓
repository に条件を渡す
↓
DBから条件に合う記事だけを取得する
↓
画面に表示する
```

このパターンでは、検索ワード・並び順・公開状態によって、DBから取得するデータ自体が変わる。

そのため、検索条件をURLに残しやすく、リロードやURL共有にも強い。


### 2. 最初にまとめて取得して、画面側で絞り込むパターン

`app/(app)/users/[userId]/page.tsx` では、URLからは主に `tab` だけを読み取っている。

記事一覧・作品一覧は最初にまとめて取得し、その後 `UserProfilePage` 側で `keyword` / `tab` / `sort` を state として持ち、取得済みデータを画面内で絞り込み・切り替えしている。

流れ:

```txt
/users/[userId]?tab=works
↓
page.tsx が tab を読む
↓
公開記事・公開作品をまとめて取得する
↓
UserProfilePage 側で keyword / tab / sort を管理する
↓
取得済みデータを画面内で絞り込み・切り替える
```

この実装では、`latest` は repository 側ですでに最新順になっている前提。  
`genre` は `GenreGroupedList` の `getSortedGenreEntries` によって、画面側でジャンル別表示にしている。

そのため、今の実装では `sort` や `q` はURLにしていない。  
ただし、検索状態をリロード後も残したい場合や、URL共有したい場合は、`q` や `sort` もURLパラメータにした方がよい。


## 18. ListControls の役割

`ListControls` は、検索箱・並び替えプルダウン・公開状態プルダウン・戻るボタンなどをまとめた操作UI。

初期表示の時点では、`ListControls` は新しいURLを作成していない。  
`page.tsx` から渡された `initialQuery` / `initialSort` / `initialVisibility` を使って、現在の表示状態に合うUIを表示している。

ユーザーが検索やプルダウン操作をしたときに、初めて新しいURLを作成して `router.push()` で遷移する。

流れ:

```txt
初期表示
↓
page.tsx が searchParams を読む
↓
デフォルト値またはURLの値を ListControls に渡す
↓
ListControls が検索箱・プルダウンを表示する
↓
ユーザーが操作する
↓
ListControls がURLを作る
↓
router.push() で遷移する
↓
page.tsx が新しい searchParams を読む
```


## 19. WorkActionsMenu とモーダルの使い分け

`WorkActionsMenu` は、記事詳細ページなどにある「・・・」メニューから、編集・削除・PDF出力・公開設定変更などを実行するためのコンポーネント。

削除やPDF出力は、基本的に以下の2択で済む。

```txt
実行する
キャンセル
```

そのため、`ConfirmModal` を使う。

一方で、公開設定の変更は以下のように選択肢が複数ある。

```txt
公開する
非公開にする
キャンセル
```

さらに、現在の状態によってボタンの見た目を変えたり、すでに選ばれている方を押せないようにしたりする必要がある。

`ConfirmModal` は「実行する / キャンセル」の確認専用モーダルなので、公開・非公開のような自由なレイアウトには向いていない。  
そのため、公開設定の変更では `BaseModal` を直接使っている。

整理すると以下の通り。

```txt
削除
→ 実行 / キャンセルだけ
→ ConfirmModal

PDF出力
→ 実行 / キャンセルだけ
→ ConfirmModal

公開設定変更
→ 公開 / 非公開 / キャンセルが必要
→ BaseModal
```


## 20. 詳細ページの閲覧制御と buildViewableWorkWhere

`findWorkDetailViewModel` の中で `buildViewableWorkWhere` を使い、所有者かどうかで取得条件を分けている。

イメージ:

```ts
return isOwner
  ? {
      id: workId,
      userId: ownerId,
    }
  : {
      id: workId,
      userId: ownerId,
      visibility: "PUBLIC",
    };
```

自分の記事であれば、公開記事・非公開記事・下書きなども取得対象にできる。  
一方で、他人の記事を見る場合は、公開記事だけを取得対象にする。

これは、たとえ下書き詳細ページへアクセスする通常の導線がなくても必要。  
下書き一覧の記事を押すと編集ページに行く設計だったとしても、URLを直接入力される可能性がある。

そのため、他人がURLを直打ちして他人の下書きや非公開記事を見られないように、サーバー側で取得条件を分けておく。

つまり、これはUI上の導線だけに頼らず、サーバー側でも閲覧制御をするための予防策。


## 21. GeneratedActionsMenu でタイトル編集フォームを直接書いている理由

作品のタイトル編集では、`editor form` のような専用フォームコンポーネントを作らず、`GeneratedActionsMenu` の中に直接書いている。

理由は、タイトル編集が小さい処理だから。

必要なものは以下だけ。

```txt
入力欄1つ
保存ボタン1つ
エラー表示1つ
成功したらモーダルを閉じて router.refresh()
```

また、タイトル編集フォームを複数ページで使い回す予定がない場合は、わざわざ別ファイルに切り出さなくてもよい。

現在の流れ:

```txt
GeneratedActionsMenu の中でタイトル入力 state を持つ
↓
BaseModal の中に input を直接置く
↓
保存ボタンで updateGeneratedTitleAction を直接呼ぶ
↓
成功したらモーダルを閉じて router.refresh()
```

ただし、今後以下のような状況になったら、専用フォームに切り出してもよい。

```txt
入力項目が増える
同じタイトル編集フォームを複数ページで使い回す
バリデーション表示が複雑になる
GeneratedActionsMenu が長くなりすぎる
```


## 22. ブラウザ側バリデーションとサーバー側バリデーション

バリデーションには、ブラウザ側で行うものとサーバー側で行うものがある。

### サーバー側バリデーション

サーバー側バリデーションは必須。  
DBを守るための最終チェックになる。

ブラウザ側のチェックは、DevTools や直接リクエストによって回避される可能性がある。  
そのため、重要なチェックは必ず server action 側で行う。

例:

```txt
タイトルが空ではないか
文字数制限を超えていないか
ジャンルが正しい値か
公開状態が正しい値か
本人のデータか
```

### ブラウザ側バリデーション

ブラウザ側バリデーションは、ユーザー体験を良くするために行う。  
保存ボタンを押した直後に、サーバーへ送る前にミスを伝えられる。

ただし、ブラウザ側だけに頼ってはいけない。

理想は以下の形。

```txt
ブラウザ側
→ 入力ミスを早く知らせるためのチェック

サーバー側
→ DBを守るための最終チェック
```

現在の `WorkEditorForm` は、`useActionState` で server action の結果を受け取り、`state.error` を表示している。  
これはサーバー側のエラーをブラウザに表示している状態であり、送信前にブラウザ側で独自に止めるバリデーションはほぼしていない。

今後、入力フォームでは必要に応じてブラウザ側バリデーションも追加するとよい。  
ただし、サーバー側バリデーションは必ず残す。


## 23. ローカル環境で久しぶりに開くときの確認

久しぶりにローカルホストを開いたときにエラーが出る場合は、まず以下を確認する。

### 1. Prisma Client を再生成する

Prisma schema を変更した後や、型・モデルのエラーが出る場合は以下を実行する。

```bash
npx prisma generate
```

これにより、`schema.prisma` の内容に合わせて Prisma Client が再生成される。

### 2. Docker を起動する

ローカル Supabase を使っている場合、Docker が起動していないとDBやAuthに接続できない。

そのため、ローカル開発を再開するときは Docker Desktop を開き、必要に応じて以下を実行する。

```bash
supabase start
```

ローカル環境では、Docker 上で Supabase のDBやAuthが動いているため、Docker が止まっているとアプリ側から接続できない。