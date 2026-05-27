satori 運用メモ（トラブルシューティングのまとめ含む）
1. 目的

satori の開発・本番運用で、環境差分や migration、デプロイ、AI生成、画像/PDFまわりで詰まらないための運用ルールをまとめる。

2. 環境の使い分け
ローカル開発
環境変数: .env.local
接続先:
Supabase Local
Docker の Postgres
Prisma migration:
npx dotenv-cli -e .env.local -- npx prisma migrate dev --name <migration_name>

本番
環境変数: .env.prod
接続先:
Supabase 本番
Prisma migration:
npx dotenv-cli -e .env.prod -- npx prisma migrate deploy
原則
ローカル確認前に本番 migration を流さない
schema.prisma を変えたら、まず .env.local で migrate → 動作確認 → .env.prod で deploy

3. Prisma 運用
3-1. 初期セットアップ時

依存追加後は、install しただけでは不十分。Prisma Client の生成が必要。@prisma/client の PrismaClient が見つからない症状は、generate 未実行が原因になりやすい。

実行
npm install
npx prisma generate

3-2. schema 変更時の基本手順
ローカル
npx dotenv-cli -e .env.local -- npx prisma migrate dev --name <migration_name>
npx prisma generate
npm run dev

本番
npx dotenv-cli -e .env.prod -- npx prisma migrate deploy

3-3. Prisma 7 の注意

satori は Prisma 7 + adapter 構成。
new PrismaClient() を引数なしで使う古い記事をそのまま真似しない。Prisma 7 の engineType: "client" 系では adapter が必要。pg と @prisma/adapter-pg を使って PrismaPg を渡す。

3-4. Prisma で不整合が出た時の復旧コマンド
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run build

これはローカルでも Vercel でも、Prisma Client 生成ズレの切り分けの基本。

4. Vercel デプロイ運用
4-1. Build Command

Vercel では build 前に Prisma Client を明示生成する。

npx prisma generate --schema=./prisma/schema.prisma && next build

postinstall だけに依存しない。クリーン環境だと Prisma Client の生成タイミングがずれて落ちることがある。

4-2. デプロイ前チェック

ローカルで以下を通してから push する。

npm install
npx prisma generate
npm run build

4-3. 本番環境変数

最低限これを Vercel / 本番環境に設定する。

DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_MODEL_TEXT
OPENAI_MODEL_JSON


5. Supabase / Storage / Image 運用
5-1. 画像が表示されない時

Supabase Local の画像URLは、Next.js の Image Optimization と噛み合わずタイムアウトや 400 になりやすい。
ローカルでは next/image に unoptimized を付ける運用が安全。加えて next.config.ts の remotePatterns に 127.0.0.1 とポートを正しく入れる。

5-2. アップロードサイズ

Server Actions の body サイズ制限に引っかかる場合は、next.config.ts で experimental.serverActions.bodySizeLimit を拡張する。過去に 1MB 制限で詰まっている。

5-3. ローカルでの注意
.env.local と next.config.ts の host 名を揃える
localhost と 127.0.0.1 を混ぜない
next.config.ts を変えたら npm run dev を再起動

6. PDF 運用
6-1. react-pdf のフォントパス

Font.register() にはブラウザURLではなく、サーバーが読める実ファイルパスを渡す。
"/fonts/..." ではなく、process.cwd() + "/public/fonts/..." のように指定する。過去に ENOENT が出ている。

6-2. チェック項目
フォントファイルが public/fonts にあるか
パスが絶対パスになっているか
開発サーバー再起動済みか

7. App Router / ルーティング運用
7-1. 動的セグメント命名

単独IDは [id] に統一。
複数IDを持つネストページだけ [userId], [workId], [generatedId] を使う。
動的フォルダ名と params 名がズレると、記事の増殖・別データ表示・ undefined 遷移の原因になる。実際に [work_id] と params.id の不一致で壊れた。

7-2. ルート変更後
.next を消す
dev server を再起動する
型生成物が古く残っていないか確認する
8. AI運用
8-1. AI の状態

satori では AI 生成結果を DB に保存し、状態を持つ。

PENDING
SUCCESS
ERROR

UI は原則として DB の状態を読む。
SUCCESS は初回リダイレクト時のみ通知、ERROR と PENDING は常時表示。これは現行実装と一致している。

8-2. AI関連の保存項目

Feedback と GeneratedContent には少なくとも以下を保存する。

prompt
inputSnapshot
resultJson
modelName
status
errorMessage
tokensInput
tokensOutput
promptVersion
providerRequestId
8-3. Rate Limit

AI生成は 1分間に 3回まで。
AiRateLimitEvent テーブルで記録する。
新しい AI 生成機能を増やす場合は、「許可チェック」だけでなく「試行記録」も必ずセットで入れる。ここは作品生成側で一度記録漏れが起きているので、運用ルールとして明記する。

8-4. 成功/失敗記録と redirect

Next.js の redirect() は特殊制御なので、try/catch の中に入れない。
成功保存と失敗保存を終えてから、try/catch の外で1回だけ redirect する。過去に SUCCESS と ERROR が同時保存された原因はこれだった。

8-5. Prompt 運用

Prompt を変更したら promptVersion を上げる。
保存済みの prompt と promptVersion を見れば、後から「どの指示で生成されたか」を追跡できる。

9. DB 運用
9-1. 外部キーの onDelete

Work を消したら関連する Feedback / GeneratedContent も消えるよう、onDelete: Cascade を前提に運用する。過去に Feedback_workId_fkey で削除が失敗している。

9-2. migration の原則
ローカルで migration を作る
ローカルで UI まで確認する
本番へ migrate deploy
必要なら Supabase SQL Editor で確認する
9-3. AI 状態の移行

過去レコードに PENDING が残っている時は、必要に応じて SQL で SUCCESS / ERROR に整理してよい。
運用メモとしては、状態移行 SQL は docs/sql などに別保管しておくとよい。

10. 障害時の一次切り分け
10-1. Prisma まわり
npx prisma generate をしたか
DATABASE_URL は正しいか
Prisma 7 の adapter を渡しているか
ローカルで npm run build が通るか
10-2. Vercel まわり
Build Command に prisma generate を明示しているか
本番 env は揃っているか
ローカル build が通っているか
10-3. AI まわり
OPENAI_API_KEY が入っているか
OPENAI_MODEL_TEXT / OPENAI_MODEL_JSON が入っているか
DB に SUCCESS / ERROR / PENDING のどれで保存されているか
errorMessage は何か
rate limit に引っかかっていないか
10-4. 画像/PDF
画像: host 設定 / unoptimized / bodySizeLimit
PDF: フォントパス / サーバー再起動

11. デプロイ前チェックリスト
ローカル
npm install
npx prisma generate
npm run build
schema 変更がある時
npx dotenv-cli -e .env.local -- npx prisma migrate dev --name <migration_name>
npx prisma generate
npm run build
本番 migration
npx dotenv-cli -e .env.prod -- npx prisma migrate deploy
Vercel
Build Command が以下か確認
npx prisma generate --schema=./prisma/schema.prisma && next build

12. AIのプロンプトバージョンについて
もしAIへのプロンプトを大きく変える場合は以下のバージョンの数値を一つ上げること。
FEEDBACK_PROMPT_VERSION
GENERATED_PROMPT_VERSION