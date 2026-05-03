//components/pdf/generated-pdf-document.tsx
//作品PDFのDocumentコンポーネント

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { registerPdfFonts } from "./register-fonts";

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingRight: 32,
    paddingBottom: 40,
    paddingLeft: 32,
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: "NotoSansJP",
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 700,
    fontFamily: "NotoSansJP",
  },
  metaBlock: {
    marginBottom: 12,
  },
  meta: {
    fontSize: 10,
    marginBottom: 6,
    fontFamily: "NotoSansJP",
  },
  section: {
    marginTop: 8,
  },
  body: {
    fontFamily: "NotoSansJP",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 16,
    right: 32,
    color: "#666666",
    fontFamily: "NotoSansJP",
  },
});

type Props = {
  title: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  genre: string;
  generatedText: string;
};

export default function GeneratedPdfDocument({
  title,
  visibility,
  createdAt,
  genre,
  generatedText,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.metaBlock}>
          <Text style={styles.meta}>ジャンル: {genre}</Text>
          <Text style={styles.meta}>
            公開設定: {visibility === "PUBLIC" ? "公開" : "非公開"}
          </Text>
          <Text style={styles.meta}>作成日: {createdAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.body} wrap>
            {generatedText}
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}