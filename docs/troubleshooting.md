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