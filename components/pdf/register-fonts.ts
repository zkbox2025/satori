//components/pdf/register-fonts.ts
//このファイルは、@react-pdf/renderer という巨大な道具箱の中から『フォント登録用の工具（Font.register）』を取り出して、実際に日本語フォントを使える状態にセットアップする場所。PDFを生成する前にこの関数を呼び出すことで、PDF内で日本語が正しく表示されるようになる。

import { Font } from "@react-pdf/renderer";//PDFが理解しやすい形（Reactの書き方）でレイアウトを組み、仲介役としてPDFファイルに繋ぐライブラリをインポート。react-pdf/rendererの中にフォントを登録する関数が入っていてそれがこれ⇨public/fonts/NotoSansJP-Regular.ttfとpublic/fonts/NotoSansJP-Bold.ttf。
import path from "path";

let registered = false;//フォントの登録は一度だけでいいので、registeredというフラグを用意している。これがtrueならすでに登録されているので、registerPdfFonts関数は何もしない。最初はfalseなので、最初の呼び出しでフォントが登録され、その後は何もしないようになる。

export function registerPdfFonts() {//PDFで使用するフォントを登録する関数
  if (registered) return;//すでに登録されている場合は何もしない

  Font.register({//Font.registerはreact-pdf/rendererのフォント登録用関数。引数には、フォントのファミリー名と、フォントファイルのパスを指定する。
    family: "NotoSansJP",
    fonts: [//複数のフォントを登録できるように配列で指定している。RegularとBoldの2種類を登録している。
      {
        src: path.join(process.cwd(), "public/fonts/NotoSansJP-Regular.ttf"),//フォントファイルのパスを指定している。path.join(process.cwd(), "public/fonts/NotoSansJP-Regular.ttf")は、プロジェクトのルートディレクトリから見たフォントファイルのパスを作成している。
        fontWeight: 400,//fontWeightは、フォントの太さを指定するプロパティで、400は通常の太さを表す。これを指定することで、PDF内でこのフォントを使用するときに、太さを指定できるようになる。
      },
      {
        src: path.join(process.cwd(), "public/fonts/NotoSansJP-Bold.ttf"),//同上
        fontWeight: 700, //同上
      },
    ],
  });

  //以下、「単語のどこでも改行できるようにし、かつ日本語の改行崩れ（不自然なハイフン挿入）を防ぐ」
    Font.registerHyphenationCallback((word) => {//registerHyphenationCallback:PDF生成時に「単語をどこで分割して改行するか」を決定するルール（コールバック）を独自に登録するメソッド
    return Array.from(word);//(word) => { return Array.from(word); }:受け取った単語（word）を 1文字ずつの配列（Array.from(word)）に分解して返している
  });

  registered = true;//フォントが登録されたことを示すために、registeredフラグをtrueにする。これで、次回以降の呼び出しでは、すでに登録されていることがわかるようになる。
}