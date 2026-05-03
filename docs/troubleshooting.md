//docs/troubleshooting.md
失敗ログ

[2026-04-03] [Prisma Clientをインポートすることができない]
【影響範囲】
発生環境：ローカル開発環境（Next.js / TypeScript）
緊急度：高（データベース操作の実装がストップするため）

【症状】
何が起きたか：import { PrismaClient } from "@prisma/client"; の箇所に赤線が引かれ、「モジュール '@prisma/client' にエクスポートされたメンバー 'PrismaClient' がありません」というエラーが出る。
期待していた動作：PrismaClient が正しくインポートされ、型補完が効く状態でインスタンス化できること。

【再現手順】
①npm install prisma @prisma/client を実行する（prismaとprisma.clientをインストールする）。
②npx prisma init で初期設定ファイル（スキーマやenv、prismaのフォルダ）を作成する。
③prisma.ts などのファイルで PrismaClient をインポートしようとする。

【エラーメッセージ / ログ】
・Module '"@prisma/client"' has no exported member 'PrismaClient'.

【切り分けメモ（どこが怪しいか）】
・tsconfig.json の moduleResolution 設定（bundler 等）との相性。
・VSCode の TypeScript サーバーのキャッシュ。
・node_modules 内に実体があるかどうか。

【原因（Root Cause）】
・@prisma/client パッケージをインストールした直後の状態では、個々の schema.prisma に応じた型定義の実体が node_modules 内に生成（Generate）されていなかったため。
・元々、スキーマを読んでその内容に合わせた専用のprisma.clientが生成し、その結果、prisma.work.findManyなどのコードが使えるのだが、スキーマを書いただけではprisma.clientは最新かされないため、npx prisma generate（スキーマを読んで、アプリ側で使う Prisma Client のコードを作り直す処理）が必要だった。

【結論】
・インストールしただけでは不十分で、スキーマを読み込んでクライアントコードを生成するステップが必要だった。

【解決策（Fix）】
・ターミナルで以下のコマンドを実行し、型定義を明示的に生成した。
npx prisma generate

【確認（動作検証）】
・コマンド実行後、VSCode上のエラー（赤線）が消え、PrismaClient のメソッドやモデルに対する型補完が正常に動作することを確認。

【よくある落とし穴】
・npx prisma migrate dev を実行すると内部的に generate も走るが、初期設定時やスキーマ変更なしに型だけが消えている場合は generate 単体が必要になる。
・エディタが古い情報を掴んでいる場合、コマンド実行後に Restart TS Server をしないとエラー表示が残ることがある。

【再発防止（Prevention）】
・プロジェクトの環境構築手順書に「パッケージインストール後は必ず npx prisma generate を行うこと」を明記する。
・package.json の postinstall スクリプトに prisma generate を入れておき、npm install 時に自動で生成されるようにする。


[2026-04-03] [ローカルでDBに繋がらない（Next → Prisma → Supabase Postgres）]
【影響範囲】
発生環境：ローカル開発環境 (Next.js / Prisma 7 / PostgreSQL)
緊急度：高（DB接続ができないため、アプリケーションが起動しない）

【症状】
何が起きたか：PrismaClient を初期化しようとすると、コンストラクタでエラーが発生し、ページが表示されない（500エラー）。
期待していた動作：new PrismaClient() を呼び出した際に、正常にデータベースと接続が確立されること。

【再現手順】
①Prisma 7 をインストールし、prisma.config.ts で設定を管理する。
②schema.prisma または設定により engineType: "client" モードでクライアントを生成する。
③new PrismaClient() を引数なし（アダプターなし）で実行する。

【エラーメッセージ / ログ】
・Error [PrismaClientConstructorValidationError]: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.

【切り分けメモ（どこが怪しいか）】
・.env の DATABASE_URL が読み込めているか。
・Prisma 7 から導入された prisma.config.ts の設定内容。
・new PrismaClient() の呼び出し方に不足がないか。

【原因（Root Cause）】
・Prisma 7 の最新構成（特に engineType: "client" モード）では、Prisma 自体が直接 DB に繋ぐのではなく、外部のアダプター（Driver Adapter）を介して通信することが前提となっているため。アダプターを渡さずに初期化したことで、接続手段がないと判定された。

【結論】
・最新の Prisma 7 環境では、明示的に pg などのドライバーと PrismaPg アダプターを組み合わせて PrismaClient に渡す必要がある。

【解決策（Fix）】
・pg および @prisma/adapter-pg のパッケージをインストールして、以下のように PrismaClient を初期化するコードへ修正した。

import { PrismaClient } from "@prisma/client";//PrismaClientは、Prismaが提供するデータベースクライアントのクラスで、これを使ってデータベースに接続し、クエリ（命令）を実行します。
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"
// 1. 実際のデータベース（PostgreSQL）に繋ぐためのプール（DBへの電話回線を束ねる装置）を作る
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// 2. Prismaが理解できる形（アダプター：PrismaPg）に変換する
const adapter = new PrismaPg(pool);
export const prisma =//prismaClient（電話回線）がすでにあればそれを使い、なければ新しく作る関数を公開
  globalForPrisma.prisma ??
  new PrismaClient({
  adapter, // ★ ここでアダプターを渡すのが新ルール！
    log: ["error", "warn"],//エラーと警告だけターミナルにメッセージを表示する
  });

  ※インストールは以下の通り
  (インストールしないとimport { PrismaPg } from "@prisma/adapter-pg";import { Pool } from "pg"に赤線が引かれる)
  npm install @prisma/adapter-pg pg
  npm install -D @types/pg



【確認（動作検証）】
・修正後、npm run dev を実行し、ブラウザで / にアクセスした際にエラーが出ず、DBクエリが正常に実行されることを確認。

【よくある落とし穴】
・ネット上の古い記事（Prisma 5以前）の「引数なしの new PrismaClient()」という書き方をそのままコピーすると、Prisma 7 の最新モードではエラーになる。

【再発防止（Prevention）】
・Prisma 7 を利用する場合は、最初から adapter を利用する構成を標準とする。
・prisma.config.ts を導入する際は、engineType の指定とクライアントの初期化コードが一致しているか必ず確認する。


###[2026-04-06] [Vercelデプロイ失敗 / Prisma Client生成まわり]

【影響範囲】
発生環境：Vercel 本番デプロイ時
緊急度：高

【症状】
何が起きたか：
Vercel で npm run build 実行時に Prisma 関連のエラーが発生し、デプロイできなかった。

期待していた動作：
Vercel 上で Next.js アプリが正常にビルドされ、そのままデプロイ完了すること。

【再現手順】

①prisma-client-js を使った構成で Vercel にデプロイする
②Vercel 側で通常の build を走らせる
③@prisma/client まわりの生成/参照不整合でビルド失敗する

【エラーメッセージ / ログ】
・Type error: Module '"@prisma/client"' has no exported member 'PrismaClient'.
・Error: Command "npm run build" exited with 1

【切り分けメモ（どこが怪しいか）】
・schema.prisma は generator client { provider = "prisma-client-js" } だった
・コード側の import { PrismaClient } from "@prisma/client"; 自体は構成としては不自然ではない
・ローカルと Vercel で Prisma Client の生成タイミングがずれている可能性が高かった
・Vercel 側で prisma generate が確実に build 直前に走っていない疑いがあった

【原因（Root Cause）】
・Prisma Client の生成物が、Vercel のビルド時点で正しく解決されていなかった
・postinstall だけでは生成タイミングや参照状態が安定せず、Vercel 側の build で @prisma/client の PrismaClient を見つけられなかった

【結論】
・コードの import 自体が根本原因ではなく、Prisma Client の生成と build の実行順が問題だった
・ローカル環境の再生成と、Vercel の build 時に明示的に prisma generate を実行することで解消した

【解決策（Fix）】
・ローカルで依存関係と Prisma Client を再生成した

rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run build

・Vercel の Build Command を以下に変更した

npx prisma generate --schema=./prisma/schema.prisma && next build

【確認（動作検証）】
・ローカルで npm run build が通ることを確認
・GitHub に push 後、Vercel で再デプロイ
・Vercel 上で build 成功を確認
・デプロイが正常完了したことを確認

【よくある落とし穴】
・postinstall: prisma generate を入れていても、Vercel 側で期待通りのタイミングで効かないことがある
・ローカルでは生成済みキャッシュで動いても、Vercel のクリーン環境で落ちることがある
・schema.prisma の場所が標準以外だと、--schema 指定が必要になることがある

【再発防止（Prevention）】
・Vercel の Build Command に prisma generate --schema=./prisma/schema.prisma && next build を明示する
・ Prisma 関連で不整合が出たら、まず以下を実行してローカル状態を揃える

rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run build

・「ローカルで通るか」と「Vercel の build コマンドで確実に generate が走るか」をセットで確認する


###[2026-04-08] [下書き保存したのに保存が増殖するバグ]

【影響範囲】
発生環境：ローカル開発環境（Next.js App Router / Work CRUD 実装中）
緊急度：高

【症状】
何が起きたか：
下書きを保存したあと、同じ記事を編集して再度下書き保存すると、既存記事が更新されず、下書きが複数に増えたような挙動になった。さらに、別の記事を押したのに編集画面には前の記事の内容が表示されることがあり、公開保存時に /users/user_id/works/undefined に飛んで 404 になることもあった。

期待していた動作：
同じ下書きを再保存したときは、既存の1件だけが更新されること。編集画面では押した記事の内容が正しく表示され、公開保存後は /users/{userId}/works/{workId} に遷移すること。

【再現手順】
①/works/new で記事を作成し、下書き保存する
②/works/drafts から保存済み下書きを開く
③内容を編集して再度下書き保存、または公開保存する

【エラーメッセージ / ログ】
・/users/user_id/works/undefined へ遷移して 404 になることがあった
・明確な実行時エラーが出ないケースでも、編集対象と違う記事内容が表示された
・ローカルでは別記事が混ざる、下書きが増殖するなど整合性崩れとして現れた

【切り分けメモ（どこが怪しいか）】
・createWorkAction / updateWorkAction の役割分担自体は分かれていた
・updateWorkAction も updateMany を使っており、一見 create 誤呼び出しではなかった
・編集ページのルートは app/(editor)/works/[work_id]/edit/page.tsx だったのに、コード側では params.id を読んでいた
・その結果、編集対象の id が undefined になっている可能性が高かった

【原因（Root Cause）】
・動的セグメント名（ファイル名）と params の参照名が一致していなかった

フォルダ名：[work_id]
コード：params.id
・そのため編集対象の workId が正しく取得できず、別の記事を拾ったり、更新対象が不安定になったり、公開保存時に undefined を含むURLへ飛ぶ原因になっていた

【結論】
・根本原因は、Work CRUD の保存処理そのものではなく、編集ページの動的ルート名（ファイル名）と params 参照の不一致だった
・この不一致により、記事IDの受け渡しが壊れ、増殖・誤表示・undefined 遷移が連鎖的に起きていた

【解決策（Fix）】
・編集ページのフォルダ名を [id] に統一した
・編集ページ側で params.id を正しく受け取る形に揃えた
・updateWorkAction.bind(null, id) に渡す値が正しい記事IDになるよう修正した
・関連するルート・リンク・params 名も id / userId / workId の命名に整理した

【確認（動作検証）】
・同じ記事を再編集して下書き保存しても、新規レコードが増えず1件だけ更新されることを確認
・別の記事を開いたときに、その記事自身の内容が編集画面に表示されることを確認
・公開保存後、/users/{userId}/works/{workId} に正しく遷移することを確認
・本人の非公開記事詳細が 404 にならず表示されることを確認

【よくある落とし穴】
・App Router の動的セグメント名 ([id], [workId], [userId] など) と params のキー名は完全一致が必要
・[work_id] のような名前を使っているのに params.id を読むと、値が undefined になる
・単独IDのページと複数IDを持つネストページで命名ルールが混ざると、同種の不具合が起きやすい


【再発防止（Prevention）】
・単独リソースの編集ページは [id] に統一する
・複数IDがあるページは [userId], [workId], [generatedId] のように意味付きで統一する
（IDが一つしかつかないかつ分岐がないファイルは[id]：例）/works/[id]/editにして、そのほかは[userId][workId][generatedId]に統一する）
・フォルダ名変更後は、params の型、href、bind 引数をセットで見直す
・ルート変更後は .next を削除して再起動し、古い型生成物を残さない


## [2026-04-11] PDF生成時に日本語フォントが読めず ENOENT になった

【影響範囲】  
発生環境：ローカル開発環境（Next.js / react-pdf / Route Handler）  
緊急度：中

【症状】  
何が起きたか：  
記事PDF出力 API にアクセスすると 500 エラーになり、PDF が生成できなかった。

期待していた動作：  
`/api/works/[id]/pdf` にアクセスしたとき、記事内容のPDFが正常に表示または出力される。

【再現手順】  
1. 日本語フォント登録で `src: "/fonts/NotoSansJP-Bold.ttf"` のように指定する  
2. 記事詳細ページから PDF 出力を実行する  
3. `/api/works/[id]/pdf` が 500 になり、PDF生成に失敗する

【エラーメッセージ / ログ】  
・`Error: ENOENT: no such file or directory, open '/fonts/NotoSansJP-Bold.ttf'`  
・`GET /api/works/2af53cec-cc27-41d1-a2fe-cdc864199d49/pdf 500`

【切り分けメモ（どこが怪しいか）】  
・`@react-pdf/renderer` の `Font.register()` で指定したフォントパスが怪しい  
・`public/fonts/...` にファイルは置いてあるのに、ログ上は `/fonts/...` を直接読みに行っていた  
・ブラウザ用のURLパスと、サーバー実行時の実ファイルパスの違いが原因候補だった

【原因（Root Cause）】  
・`Font.register()` の `src` に `"/fonts/NotoSansJP-Bold.ttf"` を指定していた  
・これはブラウザから見る静的ファイルURLの感覚では正しそうに見えるが、PDF生成はサーバー側で動いており、実際にはサーバーが読める実ファイルパスが必要だった  
・そのため Node.js が `/fonts/NotoSansJP-Bold.ttf` を開こうとして失敗し、ENOENT になった

【結論】  
・react-pdf のフォント登録では、今回のサーバー実行環境では URL 風パスではなく、`public/fonts` 配下の実ファイル絶対パスを指定する必要があった

【解決策（Fix）】  
・以下のように修正した

修正前：
"/fonts/NotoSansJP-Bold.ttf"

修正後：
process.cwd() + "/public/fonts/NotoSansJP-Bold.ttf"

【確認（動作検証）】
・npm run dev を再起動して変更を反映した
・記事PDF出力 API に再アクセスして 500 が解消された
・PDF が正常に生成され、日本語も正しく表示されることを確認した

【よくある落とし穴】
・public/... に置いたファイルはブラウザでは /fonts/... で見えるので、そのままサーバー処理でも使えると勘違いしやすい
・フォント関連の修正後に npm run dev を再起動していないと、古いコードのまま動いているように見えることがある
・空の .ttf ファイルや、拡張子違いでも似た症状になる

【再発防止（Prevention）】
・react-pdf でフォント登録するときは、サーバー実行かブラウザ実行かを先に意識する
・サーバー側で使うファイルは path.join(process.cwd(), "public/...") のように実ファイルパスで指定する
・フォント追加時は「ファイルが存在するか」「拡張子が正しいか」「開発サーバー再起動済みか」をチェックリスト化する


## [2026-04-18] 画像がアップロードされない

【影響範囲】
発生環境：ローカル開発環境（Next.js + Supabase Local）
緊急度：高（プロフィール画像等の主要機能が確認できないため）

【症状】
何が起きたか：
Supabaseに画像をアップロードし、URLを取得して next/image で表示しようとしたが、画像が表示されず「割れたアイコン」と代替テキスト（alt）のみが表示された。

期待していた動作：
アップロードした画像が指定したサイズ（64x64）で正しく表示されること。

【再現手順】
Supabase Localを起動し、画像をStorageにアップロードする。
返ってきたURL（http://127.0.0...）を next/image の src に渡す。
next.config.ts の remotePatterns を設定する。
ページを読み込むと画像が表示されない。

【エラーメッセージ / ログ】
・Next.js Error: Invalid src prop ... hostname "127.0.0.1" is not configured under images in your next.config.js
・400 (Bad Request)（Next.jsの画像最適化エンドポイントからの返答）
・net::ERR_CONNECTION_TIMED_OUT（接続タイムアウト）
・Body exceeded 1 MB limit（Server Actionsの容量制限エラー）
【切り分けメモ（どこが怪しいか）】
・ブラウザでURLを直打ちすると画像が見えるため、Supabase側の設定や画像自体の存在は問題ない。
・Next.jsの画像最適化（Image Optimization）サーバーが、外部ホスト（127.0.0.1）にアクセスする際にトラブルが起きている。
・localhost と 127.0.0.1 の表記の食い違い。

【原因（Root Cause）】
設定不足: next.config.ts で 127.0.0.1 が許可されていなかった。
接続制限: Next.jsの最適化サーバーがローカルのIPアドレス（127.0.0.1）に対して内部通信しようとしてタイムアウトしていた。
デフォルト制限: Server Actionsのデフォルトのbodyサイズ制限（1MB）を超えていた。

【結論】
ローカル環境特有のネットワーク構成により、Next.jsの画像最適化サーバーを介した画像取得が正常に機能しなかった。
【解決策（Fix）】
next.config.ts の remotePatterns に 127.0.0.1 とポート番号 54321 を正しく設定した。
Image コンポーネントに unoptimized 属性を付与し、Next.jsの最適化サーバーを通さずブラウザが直接Supabaseから取得するようにした。
next.config.ts の experimental.serverActions.bodySizeLimit を 10mb に拡張した。

【確認（動作検証）】
・npm run dev を再起動後、プロフィール画像が正常に表示されることを確認。
・1MBを超える画像のアップロードが成功することを確認。

【よくある落とし穴】
・next.config.ts を修正した後、サーバー（npm run dev）を再起動し忘れると設定が反映されない。
・.env.local では 127.0.0.1 なのに next.config.ts で localhost と書くなど、ホスト名の不一致。

【再発防止（Prevention）】
・外部ストレージ（Supabase, S3等）を導入する際は、初期設定時に remotePatterns と unoptimized（開発時）の検討をセットで行う。
・画像アップロード機能を実装する際は、あらかじめ bodySizeLimit を想定される最大サイズに合わせて設定しておく。



[2026-04-23] [React 19 Deprecated Type: FormEvent to SubmitEvent]
【影響範囲】
発生環境：React 19 / TypeScript 開発環境
緊急度：中（動作はするが、将来的な破壊的変更への対応とコード品質維持のため）

【症状】
何が起きたか：React.FormEvent<HTMLFormElement> を使用している箇所に、エディタ（VS Code）上で「非推奨（Deprecated）」を示す横線（打消し線）が表示された。
期待していた動作：最新のReact型定義に基づき、警告のない適切な型を使用すること。

【再現手順】
❶React 19（および @types/react v19以降）を使用する環境でファイルを開く。
❷フォームの onSubmit ハンドラーの引数に React.FormEvent<HTMLFormElement> を定義する。
❸エディタ上の型警告を確認する。

【エラーメッセージ / ログ】
・'FormEvent' は非推奨です。ts(6385)
・@deprecated — Use SubmitEvent instead. (React 19)

【切り分けメモ（どこが怪しいか）】
・React.FormEvent から型引数を抜く、あるいは React.FormEventHandler を使用しても、環境によっては警告が解消されない。
・React 18から19へのアップデートに伴う、イベント型の厳格化（分離）が原因。

【原因（Root Cause）】
・React 19より、フォームの送信イベントを扱う型として、これまでの汎用的な FormEvent ではなく、より具体的で標準仕様に近い SubmitEvent の使用が推奨されるようになったため。

【結論】
・React 19以降では、フォームの送信処理において FormEvent は古い形式となり、SubmitEvent への移行が必要である。

【解決策（Fix）】
・イベントの型を React.FormEvent<HTMLFormElement> から React.SubmitEvent<HTMLFormElement> へ置換した。
※（変更後）
tsx
const handleSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault();
  pushWithParams({ q: query });
};


【確認（動作検証）】
・VS Code上で React.SubmitEvent に書き換えた直後、非推奨を示す横線が消えたことを確認。
・実際のフォーム送信動作（e.preventDefault() および pushWithParams）が正しく機能することを確認。

【よくある落とし穴】
・FormEvent 自体が完全に削除されたわけではなく「型引数を伴う特定の使い分け」が非推奨になったため、単純な React.FormEvent（引数なし）では警告が消えても、型安全性が低下する場合がある。

【再発防止（Prevention）】
・React 19環境では、onChange には ChangeEvent、onSubmit には SubmitEvent というように、イベントごとに特化した型を明示的に指定する習慣をつける。