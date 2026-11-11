import { NextRequest, NextResponse } from "next/server";
import type { ResearchPack, ResearchSource } from "@/lib/research-types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

interface RawSource extends ResearchSource {
  text: string; // retrieved passage the model may draw from
}

const STOP = new Set([
  "how", "why", "what", "when", "where", "does", "do", "is", "are", "can", "did", "will", "should",
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "it", "its", "that", "this", "with",
  "work", "works", "really", "actually", "explain", "you", "we", "our", "your", "be", "if", "as", "at",
]);

function toQuery(topic: string): string {
  const words = topic
    .replace(/[?"“”.,:;()]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w.toLowerCase()));
  return words.slice(0, 8).join(" ");
}

const SCHOLARLY_CATEGORIES = new Set(["Science", "Medicine", "Psychology", "Sex & Sexuality"]);

function tokens(q: string): string[] {
  return q.toLowerCase().split(/\s+/).map((w) => w.replace(/s$/, "")).filter((w) => w.length > 2);
}

// Fraction of query terms found in the title + opening of the passage
function relevance(q: string, s: { title: string; text: string }): number {
  const toks = tokens(q);
  if (toks.length === 0) return 0;
  const hay = `${s.title} ${s.text.slice(0, 600)}`.toLowerCase();
  return toks.filter((t) => hay.includes(t)).length / toks.length;
}

async function getJson(url: string, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "FeyApp/1.0 (fey.lokinlabs.com.ng)" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fromWikipedia(q: string): Promise<Omit<RawSource, "id">[]> {
  const search = await getJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`
  );
  const hits: { pageid: number; title: string }[] = search?.query?.search ?? [];
  if (hits.length === 0) return [];
  const ids = hits.map((h) => h.pageid).join("|");
  const ex = await getJson(
    `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&explaintext=1&exchars=3500&exlimit=3&pageids=${ids}&format=json&origin=*`
  );
  const pages: Record<string, { title: string; extract?: string; fullurl?: string }> = ex?.query?.pages ?? {};
  return Object.values(pages)
    .filter((p) => p.extract && p.extract.length > 200)
    .map((p) => ({
      title: p.title,
      url: p.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
      publisher: "Wikipedia",
      text: p.extract!,
    }));
}

async function fromEuropePmc(q: string): Promise<Omit<RawSource, "id">[]> {
  const data = await getJson(
    `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
      `${q} AND HAS_ABSTRACT:y`
    )}&format=json&resultType=core&pageSize=6`
  );
  const list = data?.resultList?.result ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return list.filter((r: any) => r.abstractText).map((r: any) => ({
    title: String(r.title ?? "").replace(/<[^>]+>/g, ""),
    url: r.doi ? `https://doi.org/${r.doi}` : `https://europepmc.org/article/${r.source}/${r.id}`,
    publisher: "Europe PMC",
    authors: r.authorString,
    year: r.pubYear,
    doi: r.doi,
    text: String(r.abstractText).replace(/<[^>]+>/g, ""),
  }));
}

async function fromOpenAlex(q: string): Promise<Omit<RawSource, "id">[]> {
  const data = await getJson(
    `https://api.openalex.org/works?search=${encodeURIComponent(q)}&filter=has_abstract:true,type:article|book-chapter|book&per-page=6&select=title,doi,publication_year,authorships,abstract_inverted_index,primary_location`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data?.results ?? []).map((w: any) => {
    const idx: Record<string, number[]> = w.abstract_inverted_index ?? {};
    const words: string[] = [];
    Object.entries(idx).forEach(([word, positions]) => positions.forEach((p) => (words[p] = word)));
    const authors = (w.authorships ?? []).slice(0, 3).map((a: any) => a.author?.display_name).filter(Boolean).join(", ");
    return {
      title: w.title,
      url: w.doi ?? w.primary_location?.landing_page_url ?? "",
      publisher: "OpenAlex",
      authors,
      year: String(w.publication_year ?? ""),
      doi: w.doi?.replace("https://doi.org/", ""),
      text: words.join(" "),
    };
  }).filter((s: any) => s.url && s.text.length > 200);
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503 });
  }
  const { topicId, topic, category } = await req.json();
  if (!topicId || !topic || typeof topic !== "string" || topic.length > 300) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }

  const q = toQuery(topic);
  const useScholarly = SCHOLARLY_CATEGORIES.has(category);
  const [wikiAll, pmcAll, oaAll] = await Promise.all([
    fromWikipedia(q),
    useScholarly ? fromEuropePmc(q) : Promise.resolve([]),
    fromOpenAlex(q),
  ]);
  // Drop anything that is not clearly about this topic
  const keep = <T extends { title: string; text: string }>(list: T[], min: number, max: number) =>
    list
      .map((x) => ({ x, r: relevance(q, x) }))
      .filter((e) => e.r >= min)
      .sort((a, b) => b.r - a.r)
      .slice(0, max)
      .map((e) => e.x);
  const wiki = keep(wikiAll, 0.4, 3);
  const pmc = keep(pmcAll, 0.6, 3);
  const oa = keep(oaAll, 0.6, 3);

  // Dedupe by title, cap to 8 sources
  const seen = new Set<string>();
  const sources: RawSource[] = [...wiki, ...pmc, ...oa]
    .filter((s) => {
      const k = s.title.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 8)
    .map((s, i) => ({ ...s, id: `S${i + 1}` }));

  if (sources.length === 0) {
    return NextResponse.json({ error: "No sources found for this topic." }, { status: 404 });
  }

  const corpus = sources
    .map((s) => `[${s.id}] ${s.title} (${s.publisher}${s.year ? ", " + s.year : ""})\n${s.text.slice(0, 3000)}`)
    .join("\n\n---\n\n");

  const prompt = `You are a research librarian preparing a reading pack for a learner who must later explain this topic aloud in plain words.

Topic question: "${topic}"
Category: ${category ?? "General"}

SOURCE MATERIAL (the ONLY facts you may use):
${corpus}

RULES:
1. Use ONLY facts stated in the source material. Do not add facts from memory. If sources do not cover part of the topic, leave it out.
2. After every factual claim, cite its source id in brackets like [S1] or [S2][S3].
3. Ignore sources that are irrelevant to the topic.
4. Plain, clear language. Define jargon when used.
5. Lengths: "gist" ~100 words, "summary" ~300 words, "sections" 3-5 sections totaling at most 800 words, each with a short "heading" and a "body" (paragraphs separated by blank lines).

Respond ONLY with JSON:
{"gist": string, "summary": string, "sections": [{"heading": string, "body": string}]}`;

  try {
    // Hard 12s budget for the whole model step; after that we serve the fallback
    const deadline = Date.now() + 12000;
    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 2000) break;
      try {
        res = await fetch(GEMINI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(remaining),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 3500 },
          }),
        });
      } catch {
        res = null;
        break;
      }
      if (res.ok || ![429, 500, 503].includes(res.status)) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!res || !res.ok) throw new Error(`Gemini ${res?.status ?? "timeout"}`);
    const data = await res.json();
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}");
    if (!parsed.gist || !parsed.summary || !Array.isArray(parsed.sections)) throw new Error("Bad shape");

    // Keep only sources actually cited, renumber is unnecessary (ids stay stable)
    const allText = [parsed.gist, parsed.summary, ...parsed.sections.map((s: { body: string }) => s.body)].join(" ");
    const cited = new Set(Array.from(allText.matchAll(/\[(S\d+)\]/g)).map((m) => m[1]));
    const finalSources: ResearchSource[] = sources
      .filter((s) => cited.has(s.id))
      .map(({ text: _text, ...rest }) => rest);
    if (finalSources.length === 0) throw new Error("No cited sources");

    const pack: ResearchPack = {
      topicId,
      gist: parsed.gist,
      summary: parsed.summary,
      sections: parsed.sections.slice(0, 5),
      sources: finalSources,
      generatedAt: Date.now(),
    };
    return NextResponse.json(pack);
  } catch (err) {
    console.error("research route error", err);
    // Degraded mode: show the retrieved excerpts directly (still real, cited sources)
    const top = sources.slice(0, 5);
    const excerpt = (t: string, n: number) => t.replace(/\s+/g, " ").split(" ").slice(0, n).join(" ") + "…";
    const pack: ResearchPack = {
      topicId,
      gist: `${excerpt(top[0].text, 100)} [${top[0].id}]`,
      summary: top.slice(0, 2).map((s) => `${excerpt(s.text, 150)} [${s.id}]`).join("\n\n"),
      sections: top.map((s) => ({ heading: s.title, body: `${excerpt(s.text, 160)} [${s.id}]` })),
      sources: top.map(({ text: _t, ...rest }) => rest),
      generatedAt: Date.now(),
      degraded: true,
    };
    return NextResponse.json(pack);
  }
}
