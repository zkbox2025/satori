//docs/data-model.md
//今後実装予定のものをメモする

⚫︎Googleでログイン
⚫︎利用規約・プライバシーポリシーへのリンク
⚫︎ログインページのパスワード入力箱の下に「パスワードを忘れた方はこちら」のボタンを実装しリンク先ページを作成する。具体的には/forgot-password、メール送信、再設定導線をまとめて作る。noteを参考にする
⚫︎feedback/actions.ts と generated/actions.ts で、workId + userId や generatedId + userId の所有確認クエリが何度も出ているため、findOwnedWorkOrNotFound、findOwnedGeneratedOrNotFound みたいな helper を 1 段作る。
⚫︎レスポンシブ対応（スマホで見れるようにする）