//app/api/works/[id]/pdf/route.ts

//DBから特定の記事データを取り出し、PDFに変換して表示するAPI

import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/src/infrastructure/prisma/client";
import { createClient } from "@/src/infrastructure/supabase/server";
import WorkPdfDocument from "@/components/pdf/work-pdf-document";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const work = await prisma.work.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!work) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const pdfElement = React.createElement(WorkPdfDocument, {//作品PDFのDocumentコンポーネント（react-pdf/rendererでPDFファイルが理解しやすい形に翻訳済み）にDBからとってきたデータを流し込む
    title: work.title,
    genre: work.genre,
    visibility: work.visibility,
    createdAt: work.createdAt.toLocaleString(),
    content: work.content,
  });

  const pdfBuffer = await renderToBuffer(pdfElement);//記事PDFのDocumentコンポーネント（react-pdf/rendererでPDFファイルが理解しやすい形に翻訳済み）へDBからとってきたデータを流し込んだものをPDFデータに変換する。

const pdfBytes = new Uint8Array(pdfBuffer);//データを扱いやすい形式（バイト配列）に整える

return new Response(pdfBytes, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="work-${work.id}.pdf"`,//ダウンロードではなくブラウザの中で新たなページとして表示してねという指示
  },
});
}