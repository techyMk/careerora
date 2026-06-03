import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 64,
    fontSize: 11,
    color: "#0B0F19",
    lineHeight: 1.55,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: { fontSize: 16, fontWeight: 700 },
  email: { fontSize: 10, color: "#3A4257", marginTop: 2 },
  date: { fontSize: 10, color: "#6E768B" },
  rule: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB", marginVertical: 14 },
  re: { color: "#3A4257", marginBottom: 16 },
  body: { whiteSpace: "pre-wrap" },
  signoff: { marginTop: 28 },
  signoffName: { marginTop: 28, fontWeight: 700 },
});

export type CoverLetterPdfData = {
  name: string | null;
  email: string | null;
  date: string;
  role: string | null;
  company: string | null;
  body: string;
};

export function CoverLetterPdf({ data }: { data: CoverLetterPdfData }) {
  // Split body into paragraphs for nicer line spacing
  const paragraphs = data.body.split(/\n\s*\n/).filter(Boolean);
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.name}>{data.name ?? "Your name"}</Text>
            <Text style={s.email}>{data.email ?? ""}</Text>
          </View>
          <Text style={s.date}>{data.date}</Text>
        </View>
        <View style={s.rule} />

        {(data.role || data.company) && (
          <Text style={s.re}>
            {data.role ? <Text style={{ fontWeight: 700 }}>Re: {data.role}</Text> : null}
            {data.role && data.company ? " · " : ""}
            {data.company ?? ""}
          </Text>
        )}

        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => (
            <Text key={i} style={{ marginBottom: 10 }}>{p}</Text>
          ))
        ) : (
          <Text style={{ color: "#9CA3AF", fontStyle: "italic" }}>
            (Your cover letter body will appear here.)
          </Text>
        )}

        <Text style={s.signoff}>Sincerely,</Text>
        <Text style={s.signoffName}>{data.name ?? "Your name"}</Text>
      </Page>
    </Document>
  );
}
