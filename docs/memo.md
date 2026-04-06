
# satori



## 失敗ログはこちsatori/docs/troubleshooting.md


## 日々の気づきとメモ (Development Log)
2026/04/04
⚫︎supabase authで用意するもの
・ユーザー操作用 createBrowserClient（ユーザー操作：ユーザーがボタンを押した時のログイン、ログアウト、文章入力、いいねを押すなどでDBに保存する用）
・ページ表示準備用 createServerClient（クッキーによるログイン判定してからのサーバー側でのデータ（投稿一覧など）をDBから取得など）
・middleware（未ログインなら/loginに飛ばす）
・/login ページ（ログイン/アカウント作成を切り替えて送信）
※createServerClient（と Middleware）が、ログイン時に発行される access_token（ユーザー情報：UUIDなど） や refresh_token（有効期限が近づいたら更新するための控え） を自動で Cookieに包んで発行する。さらにcreateServerClientで「Cookieのトークンが正しいか？」「改ざんされていないか？」を検証し、DB上の auth.users テーブルにある一意な id (uuid) をトークンとしてクッキーに入れてブラウザにログインの返信と一緒に返してくれる（短時間の間にブラウザにリクエストを送るときはクッキー（トークン入り）を同封してもらう。リフレッシュトークンが切れるまでログインしなくていい）

⚫︎supabase authについてローカル環境（dockerで）を作成する際に「supabase init（プロジェクトの初期化）」「supabase start（Dockerコンテナの起動）」をターミナルに打って、環境構築して、その後.env.localに書き込む用のNEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY、SUPABASE_SERVICE_ROLE_KEY、DATABASE_URLを「supabase status -o env
」をして見る

2026/04/06
⚫︎認証（Auth）とは「この人は誰か？」を特定し、ログイン状態を管理する仕組みのこと。
⚫︎クッキーの中には、アクセストークン（ユーザー情報：UUIDなど）とリフレッシュトークン（このトークン自体の有効期限の証明書）があり、ログイン時やアカウント作成時にサーバーが発行しブラウザに渡す。この二つのトークンは発行すると毎回内容が変わる（アクセストークン：このトークンの有効期限の記載が変わる。リフレッシュトークン：このトークンの有効期限の証明書自体が変わる）※アクセストークン（有効期限：１時間）とリフレッシュトークン（有効期限：１週間）の有効期限は違う。アクセストークンの有効期限が過ぎてもリフレッシュトークンにより
⚫︎セッション：ログインかログアウトかの状態。ex）セッションが切れる：リフレッシュトークンの期限が切れたり、ログアウトした状態。

⚫︎ブラウザ側（ユーザー操作）とアプリサーバー（Next.js上でSupabase SSRの中のサーバークライアントが動く）とsupabase（DB/Auth）がある。ブラウザからのリクエストをアプリサーバーが受け取り、supabase（DB/Auth）に指示を出すブラウザクライアントはブラウザ側から直接DBにデータを送る。
⚫︎RLS（閲覧制限など）はsupabaseのSQL Editorで直接書く
⚫︎Supabase Auth / DB / Storageの違い
・Supabase Auth：クッキーの発行・メアド、パスワード、UUIDの管理。会員証のチェック。
・DB：投稿内容などの文字データを管理。
・Storage：重たいファイル（画像、動画、PDFなど）の保管