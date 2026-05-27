//docs/memo.md
//開発中の学習メモをそのまま載せています（原本）
# satori



## 失敗ログはこちsatori/docs/troubleshooting.md


## 日々の気づきとメモ (Development Log)
2026/04/04
⚫︎supabase authで用意するもの
・ユーザー操作用 createBrowserClient（ユーザー操作：ユーザーがボタンを押した時のログイン、ログアウト、文章入力、いいねを押すなどでDBに保存する用）
・ページ表示準備用 createServerClient（クッキーによるログイン判定してからのサーバー側でのデータ（投稿一覧など）をDBから取得など）
・middleware（未ログインなら/loginに飛ばす）
・/login ページ（ログイン/アカウント作成を切り替えて送信）
※アカウント生成やログインの裏側の処理で大事な四つは以下の通り。
１.NEXT_PUBLIC_SUPABASE_ANON_KEY：どこからアクセスしているのかを証明する合言葉
２.SUPABASE_JWT_SECRET：環境変数に設定不要のトークン改竄チェックの合言葉でcreateServerClientとDBのみ知っている。
３.access_token（ユーザー情報：UUIDなど。auth.users テーブルにある一意な id (uuid) ）（DBが発行するもので、これがあるからこそログイン中であることの証明になる）
４.refresh_token（access_tokenの有効期限が近づいたら更新するための控え）（DBが発行する）
その中でDB（supabase）によってログイン時に発行されるものが二つある。
access_token（ユーザー情報：UUIDなど）とrefresh_token（有効期限が近づいたら更新するための控え）である。それをcreateServerClientがCookieに包んでSUPABASE_JWT_SECRETとNEXT_PUBLIC_SUPABASE_ANON_KEYを添えてログイン時にブラウザへ渡す。
ログイン中にログインしてるか確認するときはブラウザから送られてきたクッキーをcreateServerClientが開いて、「Cookieのトークンが正しいか？」チェックしたり、クッキーについてる合言葉（SUPABASE_JWT_SECRET：環境変数に設定不要のトークン改竄チェックの合言葉でcreateServerClientとDBのみ知っている）を見て「改ざんされていないか？」を検証し（この検証はcreateServerClientのみ行う）、DBもアクセストークンの確認をした上で、データと一緒に返してくれる（短時間の間にブラウザにリクエストを送るときはクッキー（トークン入り）を同封してもらう。リフレッシュトークンが切れるまでログインしなくていい）

⚫︎supabase authについてローカル環境（dockerで）を作成する際に「supabase init（プロジェクトの初期化）」「supabase start（Dockerコンテナの起動）」をターミナルに打って、環境構築して、その後.env.localに書き込む用のNEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY、SUPABASE_SERVICE_ROLE_KEY、DATABASE_URLを「supabase status -o env
」をして見る

2026/04/06
⚫︎認証（Auth）とは「この人は誰か？」を特定し、ログイン状態を管理する仕組みのこと。
⚫︎クッキーの中には、アクセストークン（ユーザー情報：UUIDなど）とリフレッシュトークン（このトークン自体の有効期限の証明書）があり、ログイン時やアカウント作成時にサーバーが発行しブラウザに渡す。この二つのトークンは発行すると毎回内容が変わる（アクセストークン：このトークンの有効期限の記載が変わる。リフレッシュトークン：このトークンの有効期限の証明書自体が変わる）※アクセストークン（有効期限：１時間）とリフレッシュトークン（有効期限：１週間）の有効期限は違う。アクセストークンの有効期限が過ぎてもリフレッシュトークンにより再度ログイン状態に戻れる。
⚫︎セッション：ログインかログアウトかの状態。ex）セッションが切れる：リフレッシュトークンの期限が切れたり、ログアウトした状態。

⚫︎ブラウザ側（ユーザー操作）とアプリサーバー（Next.js上でSupabase SSRの中のサーバークライアントが動く）とsupabase（DB/Auth）がある。ブラウザからのリクエストをアプリサーバーが受け取り、supabase（DB/Auth）に指示を出すブラウザクライアントはブラウザ側から直接DBにデータを送る。
⚫︎RLS（閲覧制限など）はsupabaseのSQL Editorで直接書く
⚫︎Supabase Auth / DB / Storageの違い
・Supabase Auth：クッキーの発行・メアド、パスワード、UUIDの管理。会員証のチェック。
・DB：投稿内容などの文字データを管理。
・Storage：重たいファイル（画像、動画、PDFなど）の保管
・RPC：SQL Editorに直接書き込む。Authの部屋のデータが追加されたらDBにも同じデータを追加するという関数。例）アカウントを作成したら、 AuthのuserテーブルにUUIDとして追加されたものがDB（Public）のuserモデルのuserIdにも同じものが追加されるというもの。

⚫︎supabase authについてローカル環境（dockerで）を作成する際に「supabase init（プロジェクトの初期化）」「supabase start（Dockerコンテナの起動）」をターミナルに打って、環境構築して、その後.env.localに書き込む用のNEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY、SUPABASE_SERVICE_ROLE_KEY、DATABASE_URLを「supabase status -o env
」をして見る

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
・DB：中身はユーザー名、メールアドレス、投稿した文章、画像の保存場所など、短いテキストや数字を管理。画像については公開用URL（ストレージに保存されてあるファイル名が末尾でhttpから始まるURLが住所（ファイルパス）となる。ストレージには本体（サイズが大きいもの）。DBのアバターなどにはファイルパスが保存されてる）
・ストレージ：アイコン画像、作品画像、作品動画などサイズが大きいものを保管（supabaseのストレージのバケットに保存されている）。画像は、ファイル名（`${user.id}/${Date.now()}.${fileExt}`などでストレージに保存されてある（コードで示す必要あり）（fileExtはjpgなど））。住所の作成とストレージに保存、さらにDBへのファイルパスの書き込みは、コードで示す必要がある（app/(app)/settings/actions.tsにて）。

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

⚫︎supabaseDBのスキーマテーブルを追加した後にVSCode内で新しいモデル名に赤線が出るときは
VSCodeのCommand Palette を開いて（command + Shift ＋　P）
TypeScript: Restart TS Server　と検索し、選択実行する
※npx prisma generate で新しく作られたファイル（node_modulesの中身）を読み込み直しを行うことで赤線が消える

⚫︎useActionStateについて
⭐️どんな時に使うのか：ユーザーが何か操作（ボタンクリックやフォーム送信）をした後、その結果によって画面を更新したい時に使う。例えば、生成ボタンを押した時などに使う
⭐️決まり：第一引数「直前の状態（initialAiActionStateなど）」、第二引数「Formdata」と決まっている。例えば、以下のようなコード。

type Props = {
  action: (state: AiActionState, formData: FormData) => Promise<AiActionState>;
  label?: string;
  className?: string;
};

export default function FeedbackGenerateButton({
  action,
  label = "フィードバックを生成する",
  className = "rounded-md bg-black px-4 py-2 text-white",
}: Props) {
  const [state, formAction] = useActionState(action, initialAiActionState);←ここ！！！formAction（データ送信：親から受け取ったaction）を実行して結果（State）を表示する。

  return (
    <form action={formAction} className="space-y-2">
      <button className={className}>{label}</button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

⭐️フォームの中身（入力値）以外のデータをアクション関数に渡したい時にbindを使う。
⭐️-1決まり：bindの第一引数は「null」とすると決まっていて、第二引数が最初の引数とする。

<FeedbackGenerateButton
  action={generateFeedbackAction.bind(null, work.id)}
  label="フィードバックを生成する"
/>
※この場合、generateFeedbackActionの引数が、workId,state,formdataで、
FeedbackGenerateButtonの引数が、action: (state: AiActionState, formData: FormData),label?: string,className?:string;だったので、アクション関数にworkIdを渡すためにbindをしている

※formのみに囲まれてる場合、formの中身にアクション関数の引数がないときはbindをする
例）
  <form action={toggleWorkLikeAction.bind(null, work.id)}>
    <button className="rounded-md border px-4 py-2">
      {work.isLiked ? "♥ いいね解除" : "♡ いいね"}
    </button>
  </form>
⭐️ form action に渡すのは「関数の実行結果」ではなく「あとで実行される関数」。
⭐️ bind は、フォーム入力以外の値を Server Action に先に渡しておくために使う。
⭐️ action={someAction.bind(null, id)} と書くと、
id が先に固定された新しい関数が作られる。
⭐️その新しい関数は、ページ表示時ではなく、フォーム送信時に実行される。
⭐️ bind の第一引数は this 用。Server Action では this を使わないので null にする。
第二引数以降が、元の関数の先頭の引数として渡される。



⚫︎row:横の並び（行） column:縦の並び（列） select:読む
⚫︎データベース（PostgreSQL / Supabase）の RLS（行レベルセキュリティ）ポリシー で使われる条件式
・USING（操作前）：既存の行にアクセスしていいかのチェックを行う（SELECT：読む　UPDATE：更新　で使う）
例）using (
  auth.uid()::text = "id"
)
意味）この行のuserIdが自分のIDなら触っていい

・WITH CHECK（操作後 / 保存時）：操作後に保存していいかのチェックを行う（INSERT：新規保存　UPDATE：更新　で使う）
例）with check (
  auth.uid()::text = "id"
);
意味）新しく追加するuserIdは自分自身でなければならない（他人へのなりすまし防止のため）
⚫︎楽観更新 は、DB更新の完了を待たずに、画面だけ先に変えること：いいねボタンを押した瞬間に先にいいね表示を変えてその裏でDB更新をする
onClick={() => {//クリックしたら
  setIsLiked(v => !v);//先に表示変更

  startTransition(() => toggleLike(evaluationId, pathname));//トグル（裏でDB保存関数の実行）
}}

⚫︎テーブルのidを削除すれば行全体が削除される

【新規追加】
⚫︎mapはデータ配列をリターンで表示するために一つ一つHTMLにするために使う。表示する際は生データ（配列）からマッピングなどで単一にしてから一つずつ表示する。
⚫︎久しぶりにローカルホストを見る場合のエラー解決策2点
・npx prisma generate
・ドッカーを開く
⚫︎renderItemとは
一件ずつのデータのデザインをその場で外から決める仕組み。一件ずつカードを識別するために一番外側にキーが必要。

⚫︎URLパラメータについて
?：ここからURLパラメータのスタートていう印（URLには一つしかない）
＆：次の条件を追加するという接着剤（例　?q=a&sort=latest&visibility=all）
＝：これはこれだよっていうこと
⚫︎以下、元々DBから取得してデータは「配列」なので、順番は変えずに表示用に「単一」にして、一つ一つの要素としてidやtitleを抽出するコード。
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

⚫︎絞り込みについて
app/(app)/works/page.tsx は、q / sort / visibility を URL から読み取り、それを repository に渡して DB 取得の条件にしている。URL の発行は ListControls が担当している。
一方で app/(app)/users/[userId]/page.tsx は、URL からは tab だけを読み取り、記事一覧・作品一覧は最初にまとめて取得している。その後、UserProfilePage 側で keyword・tab・sort を state として持ち、取得済みデータを画面内で絞り込み・切り替えしている。
latest は repository 側ですでに最新順になっている前提。
genre は GenreGroupedList の getSortedGenreEntries によって画面側でジャンル別表示にしている。
だからapp/(app)/users/[userId]/page.tsx およびUserProfilePageの今の実装では、sort や q を URL にしていない。ただし、q を URL にしないのは必須ではなく、検索状態を保存・共有したいなら URL にした方がよい。

⚫︎WorkActionsMenu（記事詳細ページの・・・の実行関数）について
この中の、公開設定の変更（公開/非公開）がconfirmmodalではなくbasemodalに引数を入れているのは、ConfirmModalは実行する/キャンセルだけで、公開/非公開の設定はそれだけでは足りないため、BaseModalを直接使っている。

⚫︎findWorkDetailViewModelのbuildViewableWorkWhereで  return isOwner? {　id: workId,userId: ownerId,}:{・・・にして、このステータス（自身の詳細ページにアクセスした場合は下書き、公開済み全てをとってくる）のようにしているのは、たとえ、下書きの詳細ページにアクセスする導線が無い（下書き一覧の記事を押しても編集ページに行くため）としても、他人が直打ちで他人の下書きを見れないようにするための予防として書いている。

⚫︎作品のタイトル編集画面ではrditorformを使わずにGeneratedActionsMenu の中に直接書いている理由は以下の通り。
・タイトルのみ編集のため（入力欄1つ。保存ボタン1つ。エラー表示1つ。成功したら閉じて refresh）
・タイトル編集フォームを複数ページで使い回すことがない。
そのためGeneratedActionsMenu の中で
❶タイトル入力 state を持つ
↓
❷BaseModal の中に input を直接置く
↓
❸保存ボタンで updateGeneratedTitleAction を直接呼ぶ

