import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/* ─── Types ─── */

type Experience = {
  id?: string;
  role: string;
  company: string;
  location?: string;
  period: string;
  bullets: string[];
};
type Education = {
  id?: string;
  school: string;
  degree: string;
  period: string;
  details?: string;
};
type ProjectItem = {
  id?: string;
  name: string;
  description: string;
  tech?: string;
  url?: string;
};
type Certification = {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
};
type Award = { id?: string; name: string; issuer: string; date: string };
type Language = { id?: string; name: string; level: string };
type LinkItem = { id?: string; label: string; url: string };

export type ResumePdfData = {
  summary?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  projects?: ProjectItem[];
  certifications?: Certification[];
  awards?: Award[];
  languages?: Language[];
  links?: LinkItem[];
};

export type ResumePdfUser = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  headline?: string | null;
};

/* ─── Styles ─── */

const COLOR = {
  ink: "#0B0F19",
  ink70: "#3A4257",
  ink55: "#6E768B",
  ink30: "#B8BECB",
  rule: "#E5E7EB",
  band: "#F4F4F7",
  brand: "#7C3AED",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontSize: 9.5,
    color: COLOR.ink,
    lineHeight: 1.4,
    fontFamily: "Helvetica",
  },
  pageSplit: {
    flexDirection: "row",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontSize: 9.5,
    color: COLOR.ink,
    lineHeight: 1.4,
    fontFamily: "Helvetica",
  },
  pageSerif: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 50,
    fontSize: 10,
    color: COLOR.ink,
    lineHeight: 1.45,
    fontFamily: "Times-Roman",
  },

  centerHeader: { textAlign: "center", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLOR.rule },
  h1: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  h1Serif: { fontSize: 24, marginBottom: 4 },
  headline: { fontSize: 10, color: COLOR.ink70 },

  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
    marginTop: 6,
    fontSize: 8.5,
    color: COLOR.ink70,
  },
  contactDot: { color: COLOR.ink30 },

  sectionTitle: {
    fontSize: 8.5,
    letterSpacing: 1.8,
    fontWeight: 700,
    color: COLOR.brand,
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  sectionTitleSerif: {
    fontSize: 9,
    letterSpacing: 2.4,
    fontFamily: "Helvetica-Bold",
    color: COLOR.ink,
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 1,
  },
  itemTitle: { fontWeight: 700 },
  itemDate: { fontSize: 8.5, color: COLOR.ink55 },
  itemSubtitle: { color: COLOR.ink70, marginBottom: 2 },
  bullet: { flexDirection: "row", marginBottom: 1.5 },
  bulletDot: { width: 10, color: COLOR.ink55 },
  bulletText: { flex: 1 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  chip: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    backgroundColor: COLOR.band,
    fontSize: 8.5,
    marginBottom: 2,
  },

  itemBlock: { marginBottom: 6 },

  // Modern split
  sidebar: {
    width: "34%",
    backgroundColor: COLOR.band,
    padding: 24,
    paddingTop: 36,
  },
  main: { flex: 1, padding: 24, paddingTop: 36 },
  sideSmall: { fontSize: 8.5, color: COLOR.ink70 },
  sideLabel: {
    fontSize: 8.5,
    letterSpacing: 1.6,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    color: COLOR.ink,
  },

  // Executive
  serifRule: { borderBottomWidth: 1, borderBottomColor: COLOR.rule, marginVertical: 6 },
  serifItalic: { fontStyle: "italic", color: COLOR.ink70, marginTop: 4 },
  serifFooter: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLOR.rule,
    textAlign: "center",
    fontSize: 8.5,
    letterSpacing: 2.4,
    color: COLOR.ink55,
    textTransform: "uppercase",
    fontFamily: "Helvetica",
  },
});

/* ─── Helpers ─── */

function ContactLine({ user, links }: { user: ResumePdfUser; links?: LinkItem[] }) {
  const items: string[] = [];
  if (user.email) items.push(user.email);
  if (user.phone) items.push(user.phone);
  if (user.location) items.push(user.location);
  if (user.website) items.push(user.website);
  links?.forEach((l) => l.url && items.push(`${l.label}: ${l.url}`));
  return (
    <View style={s.contactRow}>
      {items.map((it, i) => (
        <Text key={i}>
          {i > 0 && <Text style={s.contactDot}>· </Text>}
          {it}
        </Text>
      ))}
    </View>
  );
}

/* ─── Classic template ─── */

function ClassicDoc({ user, data, name }: { user: ResumePdfUser; data: ResumePdfData; name: string }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <View style={s.centerHeader}>
          <Text style={s.h1}>{user.name || name}</Text>
          {user.headline ? <Text style={s.headline}>{user.headline}</Text> : null}
          <ContactLine user={user} links={data.links} />
        </View>

        {data.summary ? (
          <>
            <Text style={s.sectionTitle}>Summary</Text>
            <Text>{data.summary}</Text>
          </>
        ) : null}

        {data.experience && data.experience.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Experience</Text>
            {data.experience.map((e, i) => (
              <View key={i} style={s.itemBlock}>
                <View style={s.itemRow}>
                  <Text style={s.itemTitle}>{e.role}</Text>
                  <Text style={s.itemDate}>{e.period}</Text>
                </View>
                <Text style={s.itemSubtitle}>
                  {e.company}
                  {e.location ? ` · ${e.location}` : ""}
                </Text>
                {e.bullets.filter(Boolean).map((b, j) => (
                  <View key={j} style={s.bullet}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {data.education && data.education.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Education</Text>
            {data.education.map((ed, i) => (
              <View key={i} style={s.itemBlock}>
                <View style={s.itemRow}>
                  <Text style={s.itemTitle}>{ed.school}</Text>
                  <Text style={s.itemDate}>{ed.period}</Text>
                </View>
                <Text style={s.itemSubtitle}>{ed.degree}</Text>
                {ed.details ? <Text style={s.itemDate}>{ed.details}</Text> : null}
              </View>
            ))}
          </>
        ) : null}

        {data.projects && data.projects.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Projects</Text>
            {data.projects.map((p, i) => (
              <View key={i} style={s.itemBlock}>
                <View style={s.itemRow}>
                  <Text style={s.itemTitle}>{p.name}</Text>
                  {p.url ? <Text style={s.itemDate}>{p.url}</Text> : null}
                </View>
                {p.description ? <Text>{p.description}</Text> : null}
                {p.tech ? <Text style={s.itemDate}>{p.tech}</Text> : null}
              </View>
            ))}
          </>
        ) : null}

        {data.skills && data.skills.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Skills</Text>
            <View style={s.chipsRow}>
              {data.skills.map((sk, i) => (
                <Text key={i} style={s.chip}>{sk}</Text>
              ))}
            </View>
          </>
        ) : null}

        {data.certifications && data.certifications.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Certifications</Text>
            {data.certifications.map((c, i) => (
              <View key={i} style={s.itemRow}>
                <Text>
                  <Text style={s.itemTitle}>{c.name}</Text>
                  {c.issuer ? <Text style={{ color: COLOR.ink55 }}> · {c.issuer}</Text> : null}
                </Text>
                <Text style={s.itemDate}>{c.date}</Text>
              </View>
            ))}
          </>
        ) : null}

        {data.languages && data.languages.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Languages</Text>
            {data.languages.map((l, i) => (
              <Text key={i}>
                <Text style={s.itemTitle}>{l.name}</Text>
                <Text style={{ color: COLOR.ink55 }}> · {l.level}</Text>
              </Text>
            ))}
          </>
        ) : null}

        {data.awards && data.awards.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Awards</Text>
            {data.awards.map((a, i) => (
              <Text key={i}>
                <Text style={s.itemTitle}>{a.name}</Text>
                <Text style={{ color: COLOR.ink55 }}> · {a.issuer} · {a.date}</Text>
              </Text>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  );
}

/* ─── Modern Split template ─── */

function ModernDoc({ user, data, name }: { user: ResumePdfUser; data: ResumePdfData; name: string }) {
  return (
    <Document>
      <Page size="LETTER" style={s.pageSplit}>
        <View style={s.sidebar}>
          <Text style={s.h1}>{user.name || name}</Text>
          {user.headline ? <Text style={s.sideSmall}>{user.headline}</Text> : null}

          <Text style={s.sideLabel}>Contact</Text>
          {user.email ? <Text style={s.sideSmall}>{user.email}</Text> : null}
          {user.phone ? <Text style={s.sideSmall}>{user.phone}</Text> : null}
          {user.location ? <Text style={s.sideSmall}>{user.location}</Text> : null}
          {user.website ? <Text style={s.sideSmall}>{user.website}</Text> : null}

          {data.links && data.links.length > 0 ? (
            <>
              <Text style={s.sideLabel}>Links</Text>
              {data.links.map((l, i) => (
                <Text key={i} style={s.sideSmall}>
                  {l.label}: {l.url}
                </Text>
              ))}
            </>
          ) : null}

          {data.skills && data.skills.length > 0 ? (
            <>
              <Text style={s.sideLabel}>Skills</Text>
              <View style={s.chipsRow}>
                {data.skills.map((sk, i) => (
                  <Text key={i} style={s.chip}>{sk}</Text>
                ))}
              </View>
            </>
          ) : null}

          {data.languages && data.languages.length > 0 ? (
            <>
              <Text style={s.sideLabel}>Languages</Text>
              {data.languages.map((l, i) => (
                <Text key={i} style={s.sideSmall}>
                  {l.name} · {l.level}
                </Text>
              ))}
            </>
          ) : null}

          {data.certifications && data.certifications.length > 0 ? (
            <>
              <Text style={s.sideLabel}>Certifications</Text>
              {data.certifications.map((c, i) => (
                <View key={i} style={{ marginBottom: 3 }}>
                  <Text style={{ fontWeight: 700, fontSize: 8.5 }}>{c.name}</Text>
                  <Text style={s.sideSmall}>{c.issuer} · {c.date}</Text>
                </View>
              ))}
            </>
          ) : null}

          {data.awards && data.awards.length > 0 ? (
            <>
              <Text style={s.sideLabel}>Awards</Text>
              {data.awards.map((a, i) => (
                <View key={i} style={{ marginBottom: 3 }}>
                  <Text style={{ fontWeight: 700, fontSize: 8.5 }}>{a.name}</Text>
                  <Text style={s.sideSmall}>{a.issuer} · {a.date}</Text>
                </View>
              ))}
            </>
          ) : null}
        </View>

        <View style={s.main}>
          {data.summary ? (
            <>
              <Text style={s.sectionTitle}>About</Text>
              <Text>{data.summary}</Text>
            </>
          ) : null}

          {data.experience && data.experience.length > 0 ? (
            <>
              <Text style={s.sectionTitle}>Experience</Text>
              {data.experience.map((e, i) => (
                <View key={i} style={s.itemBlock}>
                  <View style={s.itemRow}>
                    <Text style={s.itemTitle}>{e.role}</Text>
                    <Text style={s.itemDate}>{e.period}</Text>
                  </View>
                  <Text style={s.itemSubtitle}>
                    {e.company}
                    {e.location ? ` · ${e.location}` : ""}
                  </Text>
                  {e.bullets.filter(Boolean).map((b, j) => (
                    <View key={j} style={s.bullet}>
                      <Text style={s.bulletDot}>•</Text>
                      <Text style={s.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          ) : null}

          {data.projects && data.projects.length > 0 ? (
            <>
              <Text style={s.sectionTitle}>Projects</Text>
              {data.projects.map((p, i) => (
                <View key={i} style={s.itemBlock}>
                  <View style={s.itemRow}>
                    <Text style={s.itemTitle}>{p.name}</Text>
                    {p.url ? <Text style={s.itemDate}>{p.url}</Text> : null}
                  </View>
                  {p.description ? <Text>{p.description}</Text> : null}
                  {p.tech ? <Text style={s.itemDate}>{p.tech}</Text> : null}
                </View>
              ))}
            </>
          ) : null}

          {data.education && data.education.length > 0 ? (
            <>
              <Text style={s.sectionTitle}>Education</Text>
              {data.education.map((ed, i) => (
                <View key={i} style={s.itemBlock}>
                  <View style={s.itemRow}>
                    <Text style={s.itemTitle}>{ed.school}</Text>
                    <Text style={s.itemDate}>{ed.period}</Text>
                  </View>
                  <Text style={s.itemSubtitle}>{ed.degree}</Text>
                  {ed.details ? <Text style={s.itemDate}>{ed.details}</Text> : null}
                </View>
              ))}
            </>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

/* ─── Executive template ─── */

function ExecutiveDoc({ user, data, name }: { user: ResumePdfUser; data: ResumePdfData; name: string }) {
  return (
    <Document>
      <Page size="LETTER" style={s.pageSerif}>
        <Text style={s.h1Serif}>{user.name || name}</Text>
        {user.headline ? (
          <Text style={{ fontSize: 9, letterSpacing: 2.4, color: COLOR.ink70, fontFamily: "Helvetica", textTransform: "uppercase" }}>
            {user.headline}
          </Text>
        ) : null}
        <View style={s.serifRule} />
        <View style={{ fontFamily: "Helvetica", fontSize: 8.5, color: COLOR.ink70 }}>
          <ContactLine user={user} links={data.links} />
        </View>

        {data.summary ? <Text style={s.serifItalic}>{data.summary}</Text> : null}

        {data.experience && data.experience.length > 0 ? (
          <>
            <Text style={s.sectionTitleSerif}>Selected Experience</Text>
            {data.experience.map((e, i) => (
              <View key={i} style={s.itemBlock}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5, letterSpacing: 2, textTransform: "uppercase" }}>
                  {e.company}
                  {e.location ? ` · ${e.location}` : ""}
                </Text>
                <View style={s.itemRow}>
                  <Text>{e.role}</Text>
                  <Text style={{ fontSize: 8.5, fontStyle: "italic", color: COLOR.ink55 }}>{e.period}</Text>
                </View>
                {e.bullets.filter(Boolean).map((b, j) => (
                  <View key={j} style={s.bullet}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {data.education && data.education.length > 0 ? (
          <>
            <Text style={s.sectionTitleSerif}>Education</Text>
            {data.education.map((ed, i) => (
              <View key={i} style={s.itemRow}>
                <Text>
                  <Text style={{ fontWeight: 700 }}>{ed.school}</Text>
                  <Text style={{ color: COLOR.ink70 }}> — {ed.degree}</Text>
                  {ed.details ? <Text style={{ color: COLOR.ink55 }}> · {ed.details}</Text> : null}
                </Text>
                <Text style={{ fontSize: 8.5, fontStyle: "italic", color: COLOR.ink55 }}>{ed.period}</Text>
              </View>
            ))}
          </>
        ) : null}

        {data.projects && data.projects.length > 0 ? (
          <>
            <Text style={s.sectionTitleSerif}>Notable Projects</Text>
            {data.projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text>
                  <Text style={{ fontWeight: 700 }}>{p.name}</Text>
                  {p.tech ? <Text style={{ color: COLOR.ink55 }}> · {p.tech}</Text> : null}
                </Text>
                {p.description ? <Text style={{ color: COLOR.ink70 }}>{p.description}</Text> : null}
              </View>
            ))}
          </>
        ) : null}

        {data.skills && data.skills.length > 0 ? (
          <>
            <Text style={s.sectionTitleSerif}>Skills</Text>
            <Text style={{ fontFamily: "Helvetica" }}>{data.skills.join(" · ")}</Text>
          </>
        ) : null}

        {data.certifications && data.certifications.length > 0 ? (
          <>
            <Text style={s.sectionTitleSerif}>Certifications</Text>
            {data.certifications.map((c, i) => (
              <Text key={i} style={{ fontFamily: "Helvetica" }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{c.name}</Text>
                <Text style={{ color: COLOR.ink70 }}> · {c.issuer} · {c.date}</Text>
              </Text>
            ))}
          </>
        ) : null}

        {data.awards && data.awards.length > 0 ? (
          <>
            <Text style={s.sectionTitleSerif}>Awards</Text>
            {data.awards.map((a, i) => (
              <Text key={i} style={{ fontFamily: "Helvetica" }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{a.name}</Text>
                <Text style={{ color: COLOR.ink70 }}> · {a.issuer} · {a.date}</Text>
              </Text>
            ))}
          </>
        ) : null}

        <Text style={s.serifFooter}>References available on request</Text>
      </Page>
    </Document>
  );
}

/* ─── Public component ─── */

export function ResumePdf({
  user,
  data,
  name,
  template,
}: {
  user: ResumePdfUser;
  data: ResumePdfData;
  name: string;
  template: string;
}) {
  if (template === "modern") return <ModernDoc user={user} data={data} name={name} />;
  if (template === "executive") return <ExecutiveDoc user={user} data={data} name={name} />;
  return <ClassicDoc user={user} data={data} name={name} />;
}
