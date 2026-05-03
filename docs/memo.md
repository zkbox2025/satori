//docs/memo.md
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

2026/04/07
⚫︎tailwindCSSを使う場合はappのlayoutにtailwindCSSをインポートしないと使えない（import "./globals.css"; ）。
⚫︎await prisma.work.「update」だと、スキーマのテーブルに@uniqueで紐付けが必要。しかし、workはuserに対して@uniqueしていなかったため、ひとまずは、await prisma.work.「updateMany」して全ての一致するものを選出する（1件しかない）。

2026/04/08
⚫︎supabase clientとprisma clientの違い
・supabase clientは、DB側がクッキーを使ってログインの有無を自動判別し、RLS（閲覧制限などsupabaseのSQL Editorに書き込むもの）でガードし、ログイン状態に係るユーザーごとの簡単なデータ取得を行う（自分のプロフィールや自分が投稿した記事の取得など）
・prisma clientは、ユーザのログイン状態やSQLを気にせずに直接DBと接続しデータの読み書きができる。複雑な集計や大量のデータのやり取りを行う。なお、自動認証機能がないため、閲覧制限をコードで書く必要がある

⚫︎mapは「配列の要素を繰り返し処理して、表示用のJSX要素（JavaScript の中に HTML のような記述を混ぜた構文）を作る」ときに使う。keyは、リスト内の要素を効率よく見分けるために用いる（mapでは必須）。
具体的にはリストの要素が追加・削除・順番入れ替えされたときに
React が「どの要素を再利用して、どの要素を差し替えるか」を効率的に決められるようになる。

works.map((work) => (
            <Link
              key={work.id}
              href={`/users/${user.id}/works/${work.id}`}
              className="block rounded-md border p-4"
            >
              <p className="font-semibold">{work.title}</p>
              <p className="text-sm text-gray-500">{work.genre}</p>
              <p className="mt-2 text-sm">

⚫︎PDF出力実装について
react-pdf/renderer：通常HTMLをPDFファイル（PDFとして出力するところ）が読み取ってPDFの形にするところを、最初からPDFファイルが理解しやすい形（Reactの書き方）でレイアウトを組む機能がある。これによりレイアウト崩れが起きにくくなる。

⚫︎renderToBuffer（APIの主関数）：//記事/作品PDFのDocumentコンポーネント（react-pdf/rendererでPDFファイルが理解しやすい形に翻訳する）を読み込み、、DBから持ってきた生のデータをPDFデータに変換する
⚫︎対象がなければ → notFound()
　成功したら → redirect(...)
⚫︎Payload=追加データ　const=定数化する

2026/04/18
⚫︎画像アップロードの手順（重要！）
【前提】
❶next.config.tsの設定：外部からの情報（写真など）を制限したりチェックしたりするための設計書
　例）bodySizeLimitで画像の重さ（1MB以下か）を制限したり、remotePatternsでローカルDBの住所（NEXT_PUBLIC_SUPABASE_URL）が設計書の住所と同じがをチェックしたりする（住所設定の違いによるエラーが今回あったので注意）
❷env.localにNEXT_PUBLIC_SUPABASE_URLがremotePatternsと同じ住所で設定されてる：env.localに保存されてるローカルDBの住所（アプリやブラウザがどこに情報を保存するかやどこに情報をとりにいけばいいかを知るための宛先）
❸Supabase Storageの「バケット」を設定する：ここに画像や動画など大きいファイルが保存される。DBにはバケットに保存されたファイル名で画像が保存されており、DBからいつでもバケットへ画像をとりに行くことができるようにする（DBを軽くするため）。一方でDBには公開用URL（httpから始まりファイル名が末尾にあるもの）が画像の情報として保存されてある。
❹Supabase Storageの「ポリシー」を設定する：「誰が」「どのファイルを」「見たり、消したり、保存したりしていいか」を厳格にルール化する（画像生成の設定を行うのに必須でローカルDBと本番DBの両方に設定が必要）
　例）自分以外のユーザーが、勝手に自分のアバター画像を消せないようにする

【流れ】
1.アプリで画像を選択し、保存ボタンを押す。
2.next.config.tsに設定したbodySizeLimitが「画像が重すぎないか（1MB以下か）」を設計書通りにチェックして通す。
3.NEXT_PUBLIC_SUPABASE_URL という 住所 を頼りに、画像データがSupabaseへ飛んでいく。
4.Supabaseの ポリシー 警備員が「この人は画像を保存する権限があるか？」をチェックし、OKならフォルダに保管する。
5.保存された場所のURL（http://127.0.0.1...）がアプリに戻ってくる（URL生成）。
6.アプリが Image タグで画像を表示しようとすると、next.config.tsに設定したremotePatternsが「この住所は設計書にあるか？」をチェックする（env.localで設定した住所とnext.config.tsに設定したremotePatternsが一致しないとエラーになる）。
7.※unoptimizedをユーザークライアントのコード（VSCode内）で設定することで、画像表示前にnext.config.tsが画像の加工をするのを回避できる（ローカル開発ではnext.config.tsがローカルDBの住所を自分自身の住所だと勘違いして無限ループのエラーになるのをふせぐ。本番環境ではunoptimized無しでもOK）。わかりやすくいうとnext.config.tsが「今回は加工サービスは無し！ユーザーのブラウザさん、直接送り主（Supabase）から受け取って！」と指示する流れ。

2026/04/19
⚫︎DBとストレージの違い
・DB：中身はユーザー名、メールアドレス、投稿した文章、画像の保存場所など、短いテキストや数字を管理。画像については公開用URL（ストレージに保存されてあるファイル名が末尾でhttpから始まるフル住所が保存されている）
・ストレージ：アイコン画像、作品画像、作品動画などサイズが大きいファイルそのものを保管（supabaseのストレージのバケットに保存されている）。画像は、ファイル名（`${user.id}/${Date.now()}.${fileExt}`などで保存されてある（コードで示す必要あり）（fileExtはjpgなど））

2026/04/21
⚫︎入力フォームのページでエラーをthrowではなくreturnで返すときによく使う道具
・useActionState：フォームに入力したものを送信するだけでアクション関数がよばれ、アクション関数が結果（エラーなど）を返すと即座に表示が更新されるというサイクルを完結させるためのもの
※使い方：  
    const [avatarState, avatarFormAction] = useActionState(
    updateAvatarAction,initialSettingsActionState);
    //updateAvatarAction（画像変更のための入力値から値を取り出しDB保存する関数に渡す窓口関数。引数はFormdataと結果：State）とinitialSettingsActionState（Stateの初期値：null）を始めの値として（順番はサーバー関数の引数の順番を守ること）, avatarFormActionの実行及び実行結果（avatarState：実行のたびに最新の avatarStateとして記録される。initialSettingsActionState（初期値）は、ページを読み込んだ直後だけ）を、戻り値として記録する。
    
     <form action={avatarFormAction}>
     <input
      ref={libraryInputRef}
      type="file"
      name="avatar"
      accept="image/*"
      className="hidden"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      />
      </form>

    //入力フォームに入力後にrequestSubmitされると、Reactが自動でuseActionState が保持している最新の avatarState を取り出し、フォーム内の入力値をFormdataにまとめて、その二つを合体させて、updateAvatarAction(最新のstate, まとめたformData) という形で実行させる（この過程は自分でコードに書く必要はなく、useActionStateによりReactが実行してくれる）
    //リターン内に書く
    
⚫︎getRequiredAuthUserはsupabase.Authにあるユーザー情報（ログインに必要な情報：メアド,PW,UUIDなど）をログインであれば取得できる関数で、その中からUUID＝user.idなのでuser.idを活用する方法を多くのファイルで使っている。
⚫︎"use server"は非同期関数しかエクスポートできない。

2026/04/23
⚫︎Dropdown.tsx：プルダウンメニューのTypeScriptファイル
⚫︎ExploreControls.tsx（エクスプローラー・コントロール）：「探索（Explore）」画面における、操作パネルやフィルター機能をまとめたコンポーネント。役割:としては、検索条件の指定、表示順の切り替え（ソート）、表示形式（グリッド/リスト）の変更などを行うボタンや入力フォームを配置する。
⚫︎SearchTabsBar.tsx（サーチ・タブ・バー）：検索結果を切り替えるためのタブバー
⚫︎KebabMenu.tsx（ケバブ・メニュー）：通称「ケバブメニュー（3点リーダーのアイコン）」をクリックした時に表示されるメニュー。
⚫︎params?: { limit?: number; q?: string } という引数の渡し方は「オブジェクト」として渡すといって、複数の設定項目を、一つのパッケージにして渡している。意味としては「params という名前の箱（オブジェクト）を1つ受け取ります。その箱の中には、limit という名前の数字や、q という名前の文字が入っているかもしれません（?）」
⚫︎ Debounce（デバウンス）：「連続して発生するイベントを間引いて、最後の1回だけ実行する」仕組み。
なぜ使うのか？:検索窓に入力するたびにAPIを叩くと、1文字打つごとに通信が発生し、サーバーに負荷がかかったり動作が重くなったりするため。
どう動くのか？:ユーザーがタイピングを止めてから「一定時間（例：0.5秒）」経った後に、初めて検索処理を実行する。
⚫︎boolean＝真か偽かの二つしか持たない
⚫︎アロー関数：const 関数名 = (引数) => { 処理 } 
⚫︎??（ヌル合体演算子）　・・・＝◯◯◯??×××（・・・は◯◯◯だが、nullまたはundefinedの場合は×××になる）
例）const nextQ = next.q ?? query;（const nextQがnullまたはundefinedの場合はqueryになる）

⚫︎エラールール
ページ表示不可 → notFound()
フォーム入力不備 → return { error: ... }
想定外障害 → throw

⚫︎$transactionについて
「複数の命令をひとまとめにして、全部成功か、全部失敗（なかったことにする）かのどちらかにする仕組み」
全部成功: 両方の処理が正しく反映される（コミット）。一部でも失敗: すべての処理を取り消して、最初から何もなかった状態に戻す（ロールバック）
※これを使用することで2つのクエリ（generatedContentとlikedGenerated）を同時に（並列に）投げて、早く結果を得ることができる
※「1つ目のクエリの結果を使って2つ目の条件を変える」や「 ? 」を使うなどといった途中にロジックを挟むことができない配列版 $transaction と引数に async 関数（コールバック関数） を渡すコールバック版 $transactionがある。
