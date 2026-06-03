/**
 * Lightweight ATS-style keyword analyzer.
 *
 * Takes a job description + a resume's text content, extracts meaningful
 * keywords from both, and returns:
 *   - score (0-100)
 *   - matched (keywords found in the resume)
 *   - missing (keywords from the JD not found in the resume)
 *   - resumeOnly (resume keywords not in the JD — informational)
 *   - jdKeywords (top extracted keywords from the JD with frequency)
 *
 * No external NLP — pure string heuristics that work everywhere.
 */

const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","of","on","in","at","to","for","by","from","with",
  "as","is","are","was","were","be","been","being","do","does","did","have","has","had","i","we",
  "you","they","he","she","it","this","that","these","those","there","here","what","which","who",
  "whom","where","when","why","how","not","no","yes","so","than","also","more","most","much",
  "some","any","all","can","could","should","would","may","might","must","will","just","like",
  "such","into","onto","over","under","between","through","across","per","upon","plus","minus",
  "very","really","ever","since","while","without","within","about","because","both","each",
  "either","its","our","their","your","my","me","us","them","him","her","his","hers","theirs",
  "ours","yours","mine","whose","whether","into","work","working","experience","experienced",
  "year","years","strong","ability","including","include","including","etc","using","etc.",
  "team","teams","role","responsibilities","responsibility","candidate","candidates","required",
  "preferred","plus","ideally","nice","have","must","day","based","across","cross-functional",
  "fast-paced","environment","environments","environmentwe","company","companies","worked","work",
  "skills","skill","build","building","built","help","helping","helped","new","opportunity",
  "opportunities","looking","seeking","seek","seeks","required","require","requires","love",
  "passionate","passion","focus","focused","focusing","ensure","ensuring","ensured","drive",
  "driven","driving","high","higher","highest","low","lower","lowest","good","great","excellent",
  "best","better","worst","make","makes","made","making","take","takes","taking","took","done",
  "well","ll","ve","re","etc","s","t","m","d","n","b","c","e","f","g","h","i","j","k","l","n",
  "o","p","q","r","u","v","w","x","y","z",
]);

const CLEAN_RE = /[^a-z0-9+#.\-/&\s]/gi;
const SPLIT_RE = /[\s,;:!?()[\]{}"'`]+/;

function normalize(text: string): string {
  return text.toLowerCase().replace(CLEAN_RE, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(SPLIT_RE)
    .map((t) => t.replace(/^[.\-/&]+|[.\-/&]+$/g, ""))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

function extractPhrases(text: string): Map<string, number> {
  const phrases = new Map<string, number>();
  const sentences = text.split(/[.\n!?]+/);
  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    // bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
      const phrase = `${tokens[i]} ${tokens[i + 1]}`;
      if (phrase.length > 5 && phrase.length < 40) {
        phrases.set(phrase, (phrases.get(phrase) ?? 0) + 1);
      }
    }
  }
  return phrases;
}

function topKeywords(text: string, limit = 30): { word: string; freq: number }[] {
  const counts = new Map<string, number>();
  for (const tok of tokenize(text)) {
    counts.set(tok, (counts.get(tok) ?? 0) + 1);
  }
  // also weight common bigram phrases
  for (const [phrase, n] of extractPhrases(text)) {
    if (n >= 2) counts.set(phrase, (counts.get(phrase) ?? 0) + n * 2);
  }
  return [...counts.entries()]
    .map(([word, freq]) => ({ word, freq }))
    .sort((a, b) => b.freq - a.freq)
    .slice(0, limit);
}

function setOf(text: string): Set<string> {
  const s = new Set<string>();
  for (const tok of tokenize(text)) s.add(tok);
  for (const [phrase] of extractPhrases(text)) s.add(phrase);
  return s;
}

export type AtsAnalysis = {
  score: number;
  matched: string[];
  missing: string[];
  resumeOnly: string[];
  jdKeywords: { word: string; freq: number }[];
  resumeWordCount: number;
  jdWordCount: number;
};

export function analyzeAts(jobDescription: string, resumeText: string): AtsAnalysis {
  const jd = jobDescription.trim();
  const rs = resumeText.trim();

  const jdTop = topKeywords(jd, 30);
  const resumeSet = setOf(rs);

  const matched: string[] = [];
  const missing: string[] = [];
  for (const { word } of jdTop) {
    if (resumeSet.has(word)) matched.push(word);
    else missing.push(word);
  }

  const jdSet = setOf(jd);
  const resumeOnly = [...resumeSet]
    .filter((w) => !jdSet.has(w) && w.length > 2)
    .slice(0, 15);

  // Score: coverage of top JD keywords, weighted toward the top 15
  const top15 = jdTop.slice(0, 15);
  const top15Matched = top15.filter((k) => resumeSet.has(k.word)).length;
  const top15Coverage = top15.length === 0 ? 1 : top15Matched / top15.length;
  const fullCoverage = jdTop.length === 0 ? 1 : matched.length / jdTop.length;
  const score = Math.round(top15Coverage * 70 + fullCoverage * 30);

  return {
    score: Math.max(0, Math.min(100, score)),
    matched,
    missing,
    resumeOnly,
    jdKeywords: jdTop,
    resumeWordCount: tokenize(rs).length,
    jdWordCount: tokenize(jd).length,
  };
}

/** Flatten a Resume's JSON data into one plain-text blob for matching. */
export function resumeToPlainText(data: {
  summary?: string;
  skills?: string[];
  experience?: { role: string; company: string; location?: string; bullets: string[] }[];
  education?: { school: string; degree: string; details?: string }[];
  projects?: { name: string; description: string; tech?: string }[];
  certifications?: { name: string; issuer: string }[];
  awards?: { name: string; issuer: string }[];
  languages?: { name: string }[];
}): string {
  const parts: string[] = [];
  if (data.summary) parts.push(data.summary);
  if (data.skills) parts.push(data.skills.join(" · "));
  data.experience?.forEach((e) => {
    parts.push(`${e.role} ${e.company} ${e.location ?? ""}`);
    parts.push(e.bullets.join(" "));
  });
  data.education?.forEach((e) => parts.push(`${e.school} ${e.degree} ${e.details ?? ""}`));
  data.projects?.forEach((p) => parts.push(`${p.name} ${p.description} ${p.tech ?? ""}`));
  data.certifications?.forEach((c) => parts.push(`${c.name} ${c.issuer}`));
  data.awards?.forEach((a) => parts.push(`${a.name} ${a.issuer}`));
  data.languages?.forEach((l) => parts.push(l.name));
  return parts.join("\n");
}
