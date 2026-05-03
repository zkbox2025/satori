//app/api/generated/[id]/pdf/route.ts

//DBから特定の作品データを取り出し、PDFに変換して表示するAPI

import React from "react";//webの仕組みを作る基本ツール
import { NextResponse } from "next/server";//webの仕組みを作る基本ツール
import { renderToBuffer } from "@react-pdf/renderer";//Reactのコードを「PDFデータ」に変換する関数
import { prisma } from "@/src/infrastructure/prisma/client";//DBからデータを取ってくる道具
import { createClient } from "@/src/infrastructure/supabase/server";//ログイン状況を確認してユーザー情報を取ってくる道具
import GeneratedPdfDocument from "@/components/pdf/generated-pdf-document";//作品PDFのDocumentコンポーネント

type Props = {//URLからgeneratedidを抜き出して引数として使う
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Props) {//URLを開いたときに動く関数
  const { id } = await params;//generatedidを取り出したら次に行く

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();//ログイン状況を確認してログイン済みならuserを返す

  if (!user) {//未ログインならエラー（401：あなたは誰？）
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const generatedContent = await prisma.generatedContent.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {//作品のほかにworkテーブルのジャンルの情報も一緒に持ってくる
      work: {
        select: {
          genre: true,
        },
      },
    },
  });

  if (!generatedContent) {//作品がなければエラー（404：そんなデータはないよ）
    return new NextResponse("Not Found", { status: 404 });
  }

  const pdfElement = React.createElement(GeneratedPdfDocument, {//作品PDFのDocumentコンポーネント（react-pdf/rendererでPDFファイルが理解しやすい形に翻訳済み）にDBからとってきたデータを流し込む
    title: generatedContent.title,
    visibility: generatedContent.visibility,
    createdAt: generatedContent.createdAt.toLocaleString(),
    genre: generatedContent.work.genre,
    generatedText: generatedContent.generatedText,
  });

const pdfBuffer = await renderToBuffer(pdfElement);//作品PDFのDocumentコンポーネント（react-pdf/rendererでPDFファイルが理解しやすい形に翻訳済み）へDBからとってきたデータを流し込んだものをPDFデータに変換する。
const pdfBytes = new Uint8Array(pdfBuffer);//データを扱いやすい形式（バイト配列）に整える

return new Response(pdfBytes, {//出来上がったPDFファイルをブラウザへ送る
  headers: {
    "Content-Type": "application/pdf",//情報の種類：PDF
    "Content-Disposition": `inline; filename="generated-${generatedContent.id}.pdf"`,//ダウンロードではなくブラウザの中で新たなページとして表示してねという指示
  },
});
}