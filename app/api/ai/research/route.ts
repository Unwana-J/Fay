import { NextRequest, NextResponse } from "next/server";
import type { ResearchPack, ResearchQuizQuestion, ResearchSource } from "@/lib/research-types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Gemini 3 models use thinkingLevel: "minimal" to respond in ~2-3s instead of spending 15s+ reasoning
const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3-flash-preview"];

interface RawSource extends ResearchSource {
  text: string; // retrieved passage the model may draw from
}

const STOP = new Set([
  "how", "why", "what", "when", "where", "who", "which", "whom", "whose",
  "does", "do", "is", "are", "can", "could", "did", "will", "would", "should", "shall", "may", "might",
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "it", "its", "that", "this", "with", "by", "at", "as", "if", "be", "been", "being",
  "work", "works", "working", "really", "actually", "explain", "compare", "contrast", "defend", "position", "describe", "discuss",
  "you", "we", "our", "your", "us", "they", "them", "their", "there", "here", "have", "has", "had",
  "difference", "differences", "between", "versus", "vs", "mean", "means", "meaning", "make", "makes", "making", "made",
  "affect", "affects", "effect", "effects", "impact", "impacts", "shape", "shapes", "role", "play", "plays",
  "change", "changed", "changes", "changing", "everyday", "life", "world", "people", "human", "humans", "humanity", "society", "modern",
  "matter", "matters", "important", "better", "worse", "good", "bad", "most", "more", "less", "many", "much", "into", "from", "about", "than", "then",
  "ever", "truly", "only", "simply", "just", "still", "even", "always", "never", "often", "sometimes", "fast", "faster", "slow", "hard", "easy",
  "thing", "things", "way", "ways", "nature", "system", "systems", "process", "processes", "used", "using", "use", "enable", "enables",
]);

// Known technical abbreviations in TOPIC_BANK -> canonical encyclopedia article titles
const ABBREVIATION_MAP: Record<string, string> = {
  ai: "Artificial intelligence",
  ml: "Machine learning",
  llm: "Large language model",
  llms: "Large language model",
  nlp: "Natural language processing",
  rlhf: "Reinforcement learning from human feedback",
  agi: "Artificial general intelligence",
  asi: "Superintelligence",
  gan: "Generative adversarial network",
  gans: "Generative adversarial network",
  rag: "Retrieval-augmented generation",
  nas: "Neural architecture search",
  gofai: "Symbolic artificial intelligence",
  db: "Database",
  "vector db": "Vector database",
  seo: "Search engine optimization",
  pm: "Product management",
  ux: "User experience",
  ui: "User interface",
  api: "API",
  gdp: "Gross domestic product",
  inflation: "Inflation",
  adhd: "Attention deficit hyperactivity disorder",
  dna: "DNA",
  rna: "RNA",
  mrna: "Messenger RNA",
  atp: "Adenosine triphosphate",
};

// Extracts ordered, deduplicated concept search phrases for ANY topic in TOPIC_BANK
// by combining:
// 1. Explicit multi-word concept phrases from the question (e.g. "remote work", "neural networks", "industrial revolution")
// 2. Curated topic.tags (expanding abbreviations like "rlhf" -> "Reinforcement learning from human feedback")
// 3. Individual high-signal nouns from the question
// 4. The topic's discipline category as a backstop
function extractSearchQueries(topic: string, category?: string, tags?: string[]): string[] {
  const queries: string[] = [];
  const add = (q: string) => {
    const clean = q.trim();
    if (!clean || clean.length < 3) return;
    if (!queries.some((existing) => existing.toLowerCase() === clean.toLowerCase())) {
      queries.push(clean);
    }
  };

  // 1. Check parenthetical acronyms in the question e.g. "(RLHF)", "(GAN)", "(AGI)"
  for (const m of topic.matchAll(/\(([A-Za-z0-9-]{2,10})\)/g)) {
    const key = m[1].toLowerCase();
    if (ABBREVIATION_MAP[key]) add(ABBREVIATION_MAP[key]);
  }

  // 2. Expand curated tags first — every topic in TOPIC_BANK has 2-3 high-signal tags!
  if (Array.isArray(tags)) {
    for (const rawTag of tags) {
      const t = rawTag.trim().toLowerCase();
      if (ABBREVIATION_MAP[t]) {
        add(ABBREVIATION_MAP[t]);
      } else if (!STOP.has(t) && t.length > 2) {
        add(rawTag.trim());
      }
    }
  }

  // 3. Extract contiguous non-stopword concept phrases from the question text
  // e.g. "How do social media recommendation algorithms shape..." -> "social media recommendation algorithms"
  const clauses = topic
    .replace(/\([^)]*\)/g, " ")
    .split(/[?,.;:—–\-]|(?:\b(?:and|or|vs|versus|between|from|with|while|than|into|over)\b)/i);

  for (const clause of clauses) {
    const words = clause
      .replace(/["“”']/g, "")
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()));
    if (words.length >= 2 && words.length <= 4) {
      add(words.join(" "));
    } else if (words.length === 1) {
      const w = words[0].toLowerCase();
      add(ABBREVIATION_MAP[w] ?? words[0]);
    }
  }

  // 4. Individual core tokens from the question
  const coreWords = topic
    .replace(/[?"“”.,:;()—–]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()));

  if (coreWords.length > 0) {
    add(coreWords.slice(0, 5).join(" "));
    for (const w of coreWords.slice(0, 4)) {
      const lower = w.toLowerCase();
      add(ABBREVIATION_MAP[lower] ?? w);
    }
  }

  // 5. Category fallback so philosophical/wildcard topics always have a disciplinary anchor
  if (category && category !== "Wildcard") {
    add(category);
  }

  return queries.slice(0, 6);
}

function tokensFromQueries(queries: string[]): string[] {
  const all = queries
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/s$/, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
  return Array.from(new Set(all));
}

// Scores how well a Wikipedia article matches the topic's core concepts
function relevance(queries: string[], s: { title: string; text: string }): number {
  const toks = tokensFromQueries(queries);
  if (toks.length === 0) return 0.5;
  const titleLower = s.title.toLowerCase();
  const bodyLower = s.text.slice(0, 900).toLowerCase();
  const hay = `${titleLower} ${bodyLower}`;
  const matched = toks.filter((t) => hay.includes(t)).length;
  const titleMatched = toks.filter((t) => titleLower.includes(t)).length;
  const exactQueryTitle = queries.some(
    (q) => titleLower === q.toLowerCase() || titleLower.startsWith(q.toLowerCase() + " (")
  );
  const exactTokenTitle = toks.some((t) => titleLower === t || titleLower.startsWith(t + " ("));
  if (titleMatched === 0 && matched < 2) return 0;
  return (
    matched / toks.length +
    (titleMatched / toks.length) * 0.45 +
    (exactQueryTitle ? 0.75 : exactTokenTitle ? 0.45 : 0)
  );
}

// Splits text into clean, complete, plain-English sentences (strips academic abstract filler)
function splitCleanSentences(raw: string): string[] {
  const cleaned = raw
    .replace(/\s+/g, " ")
    .replace(/==+[^=]+==+/g, " ")
    .replace(/\s*\((?:from\s+[^)]+|pronounced\s+[^)]+|lit\.\s+[^)]+|also\s+called\s+[^)]+)\)/gi, "")
    .trim();
  const rawSents = cleaned.split(/(?<=[.!?])\s+/);
  return rawSents
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length >= 35 &&
        /[.!?]$/.test(s) &&
        !/^(this\s+(chapter|article|paper|section|study|book|review)|in\s+this\s+(chapter|article|paper|section|study)|it\s+describes\s+how|the\s+results\s+are\s+consistent|here\s+we\s+show)/i.test(
          s
        )
    );
}

// Builds a structured, encyclopedia-grade answer from Wikipedia lead paragraphs
// when Gemini is rate-limited or unreachable
function synthesizeQuestionFocusedFallback(
  sources: RawSource[],
  topic: string
): { gist: string; summary: string; sections: { heading: string; body: string }[] } {
  // For the Gist: take the opening 2 definitional sentences of the top 2 concept articles
  const gistParts: string[] = [];
  for (const s of sources.slice(0, 2)) {
    const sents = splitCleanSentences(s.text);
    if (sents.length > 0) {
      gistParts.push(`${sents.slice(0, 2).join(" ")} [${s.id}]`);
    }
  }

  // For the Summary: take the opening 3-4 sentences from up to 3 core concept articles
  const summaryParts: string[] = [];
  for (const s of sources.slice(0, 3)) {
    const sents = splitCleanSentences(s.text);
    if (sents.length > 0) {
      summaryParts.push(`${sents.slice(0, 4).join(" ")} [${s.id}]`);
    }
  }

  // For Deep Dive sections: each core encyclopedia concept gets a multi-paragraph breakdown
  const sections = sources.slice(0, 4).map((s) => {
    const sents = splitCleanSentences(s.text);
    const p1 = sents.slice(0, 3).join(" ");
    const p2 = sents.slice(3, 7).join(" ");
    const body = p2 ? `${p1} [${s.id}]\n\n${p2} [${s.id}]` : `${p1} [${s.id}]`;
    return {
      heading: s.title,
      body,
    };
  });

  return {
    gist: gistParts.join("\n\n") || `Key overview for ${topic}.`,
    summary: summaryParts.join("\n\n") || gistParts.join("\n\n"),
    sections,
  };
}

async function getJson(url: string, timeoutMs = 6000) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          "User-Agent": "FeyApp/1.0 (https://fey.lokinlabs.com.ng; support@lokinlabs.com.ng)",
          Accept: "application/json",
        },
      });
      if (res.ok) return await res.json();
    } catch {
      /* retry */
    } finally {
      clearTimeout(t);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

async function fetchWikiRestSummary(titleOrQuery: string): Promise<Omit<RawSource, "id"> | null> {
  const slug = encodeURIComponent(titleOrQuery.trim().replace(/\s+/g, "_"));
  const data = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, 4000);
  if (
    data &&
    data.type === "standard" &&
    typeof data.extract === "string" &&
    data.extract.length > 100
  ) {
    return {
      title: data.title,
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${slug}`,
      publisher: "Wikipedia",
      text: data.extract,
    };
  }
  return null;
}

async function fetchWikiPagesByIds(ids: number[]): Promise<Omit<RawSource, "id">[]> {
  if (ids.length === 0) return [];
  const uniqueIds = Array.from(new Set(ids)).slice(0, 6);
  // Using `exintro=1` guarantees all requested pages return full lead extracts at once
  const ex = await getJson(
    `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&explaintext=1&exintro=1&exlimit=6&pageids=${uniqueIds.join("|")}&format=json&origin=*`
  );
  const pages: Record<string, { pageid: number; title: string; extract?: string; fullurl?: string }> =
    ex?.query?.pages ?? {};
  return uniqueIds
    .map((id) => pages[String(id)])
    .filter(
      (p) =>
        p &&
        p.extract &&
        p.extract.length > 120 &&
        // Exclude Wikipedia disambiguation pages
        !p.extract.includes("may refer to:") &&
        !p.title.toLowerCase().includes("(disambiguation)")
    )
    .map((p) => ({
      title: p.title,
      url: p.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
      publisher: "Wikipedia",
      text: p.extract!,
    }));
}

async function fromWikipedia(queries: string[]): Promise<Omit<RawSource, "id">[]> {
  // Run at most 4 search queries so we never trigger Wikimedia rate limits
  const topQueries = queries.slice(0, 4);
  const searches = await Promise.all(
    topQueries.map((term) =>
      getJson(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=2&format=json&origin=*`
      )
    )
  );
  const pageIds: number[] = [];
  for (const s of searches) {
    const first = s?.query?.search?.[0];
    if (first && !pageIds.includes(first.pageid)) pageIds.push(first.pageid);
  }
  for (const s of searches) {
    const second = s?.query?.search?.[1];
    if (second && !pageIds.includes(second.pageid)) pageIds.push(second.pageid);
  }
  const pages = await fetchWikiPagesByIds(pageIds.slice(0, 6));
  if (pages.length > 0) return pages;

  // Fallback to Wikipedia REST summary endpoint if MediaWiki search was rate-limited
  const restPages = await Promise.all(topQueries.map((q) => fetchWikiRestSummary(q)));
  return restPages.filter((p): p is Omit<RawSource, "id"> => Boolean(p));
}

// Deterministic fallback quiz built strictly from complete sentences in the retrieved passages
function buildFallbackQuiz(sources: RawSource[], topic: string): ResearchQuizQuestion[] {
  const sentences: { sent: string; srcId: string; title: string }[] = [];
  for (const s of sources) {
    const parts = splitCleanSentences(s.text).filter((p) => p.length >= 50 && p.length <= 190);
    for (const p of parts.slice(0, 2)) {
      sentences.push({ sent: p, srcId: s.id, title: s.title });
    }
  }

  const distractors = [
    "It occurred solely as a digital-first transformation in the late 20th century.",
    "It was legally prohibited across all regions and produced no measurable social change.",
    "It relied exclusively on unrecorded oral traditions without physical tools or biological mechanisms.",
    "It had no connection to energy transfer, economic output, or natural processes.",
    "It was restricted to a single isolated experiment and never occurred in nature or society.",
    "It eliminated the need for energy, inputs, or structural organization altogether.",
  ];

  const picked = sentences.slice(0, 3);
  if (picked.length === 0) return [];

  const prompts = [
    `Based on the reading pack for "${topic}", which statement is directly supported by the cited sources?`,
    `According to the source material you studied, which of the following is an accurate key takeaway?`,
    `Which detail from the reading pack accurately reflects the documented evidence on this topic?`,
  ];

  return picked.map((item, idx) => {
    const correctIndex = idx % 4;
    const d1 = distractors[(idx * 2) % distractors.length];
    const d2 = distractors[(idx * 2 + 1) % distractors.length];
    const d3 = distractors[(idx * 2 + 2) % distractors.length];
    const wrong = [d1, d2, d3];
    const options: [string, string, string, string] = ["", "", "", ""];
    let wIdx = 0;
    for (let i = 0; i < 4; i++) {
      options[i] = i === correctIndex ? item.sent : wrong[wIdx++];
    }
    return {
      question: prompts[idx % prompts.length],
      options,
      correctIndex,
      explanation: `Stated in ${item.title} [${item.srcId}]: "${item.sent}"`,
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeQuiz(raw: any, fallback: ResearchQuizQuestion[]): ResearchQuizQuestion[] {
  if (!Array.isArray(raw)) return fallback;
  const valid: ResearchQuizQuestion[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item.question === "string" &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.every((o: unknown) => typeof o === "string" && o.trim().length > 0) &&
      typeof item.correctIndex === "number" &&
      item.correctIndex >= 0 &&
      item.correctIndex <= 3 &&
      typeof item.explanation === "string"
    ) {
      valid.push({
        question: item.question.trim(),
        options: [
          item.options[0].trim(),
          item.options[1].trim(),
          item.options[2].trim(),
          item.options[3].trim(),
        ],
        correctIndex: item.correctIndex,
        explanation: item.explanation.trim(),
      });
    }
  }
  return valid.length >= 3 ? valid.slice(0, 3) : fallback;
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503 });
  }
  const { topicId, topic, category, tags } = await req.json();
  if (!topicId || !topic || typeof topic !== "string" || topic.length > 300) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }

  const queries = extractSearchQueries(topic, category, tags);
  const wikiAll = await fromWikipedia(queries);
  const scoredWiki = wikiAll
    .map((x) => ({ x, r: relevance(queries, x) }))
    .filter((e) => e.r >= 0.1)
    .sort((a, b) => b.r - a.r)
    .slice(0, 4)
    .map((e) => e.x);
  // Never drop all retrieved Wikipedia pages if relevance threshold was too strict
  const wiki = scoredWiki.length > 0 ? scoredWiki : wikiAll.slice(0, 4);

  const seen = new Set<string>();
  const sources: RawSource[] = wiki
    .filter((s) => {
      const k = s.title.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 4)
    .map((s, i) => ({ ...s, id: `S${i + 1}` }));

  if (sources.length === 0) {
    return NextResponse.json({ error: "No sources found for this topic." }, { status: 404 });
  }

  const fallbackQuiz = buildFallbackQuiz(sources, topic);

  const corpus = sources
    .map((s) => `[${s.id}] ${s.title} (${s.publisher})\n${s.text.slice(0, 1800)}`)
    .join("\n\n---\n\n");

  const prompt = `You are a master educator and research librarian writing a custom study briefing that directly answers the learner's question so they can explain it aloud in their own words.

LEARNER'S QUESTION: "${topic}"
CATEGORY: ${category ?? "General"}

SOURCE MATERIAL (ground all facts in these sources):
${corpus}

CRITICAL WRITING DIRECTIVES:
1. DO NOT copy-paste raw sentences from the sources, and NEVER include meta-language like "This chapter provides..." or "In this paper we...".
2. SYNTHESIZE & TEACH: Write in your own clear, cohesive voice to directly answer "${topic}". Start the "gist" with a direct, plain-English answer to the question in the very first sentence.
3. ADAPT TO THE QUESTION TYPE:
   - Definitional / Mechanism ("What is X and how does it work?"): Define X in plain terms first, then walk step-by-step through the mechanism.
   - Comparison ("What is the difference between X and Y?" or "Compare X, Y, and Z"): Explicitly define each concept and contrast them side-by-side in the Gist, Summary, and Deep Dive.
   - Causal / Behavioral ("Why do we procrastinate?" or "How do algorithms shape belief?"): Explain the core psychological, economic, or technical drivers and how they play out in real life.
   - Normative / Debate ("Should AI have legal personhood?" or "Is remote work making us more productive or isolated?"): Present the strongest evidence-backed arguments on both sides so the learner can form and articulate their own position.
4. Ground every factual claim in the source material and cite its source ID in brackets like [S1] or [S1][S2]. Do not invent facts outside the sources.
5. Every sentence must be complete, grammatically sound, and free of unexplained jargon.
6. Lengths:
   - "gist": 80-110 words directly answering "${topic}" in 1-2 tight paragraphs.
   - "summary": 220-280 words walking through the core mechanism, key distinctions, and a concrete takeaway in 2-3 paragraphs.
   - "sections": 3 themed sections (totaling 450-650 words) with clear, question-answering headings and well-structured paragraphs.
7. "quiz": Exactly 3 multiple-choice questions testing the core takeaways of "${topic}". Each question must have 4 complete options, "correctIndex" (0, 1, 2, or 3), and a 1-sentence "explanation" citing the source like [S1].

Respond ONLY with JSON:
{
  "gist": string,
  "summary": string,
  "sections": [{"heading": string, "body": string}],
  "quiz": [{"question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string}]
}`;

  try {
    let res: Response | null = null;
    for (const modelName of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(14000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.25,
              maxOutputTokens: 2800,
              thinkingConfig: { thinkingLevel: "minimal" },
            },
          }),
        });
      } catch (e) {
        console.warn(`[research] ${modelName} error:`, e);
        res = null;
        continue;
      }
      if (res.ok) break;
      const errBody = await res.text().catch(() => "");
      console.warn(`[research] ${modelName} status: ${res.status}`, errBody.slice(0, 150));
      if (res.status === 400) {
        try {
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(14000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.25,
                maxOutputTokens: 2000,
              },
            }),
          });
          if (res.ok) break;
        } catch {
          res = null;
        }
      }
    }
    if (!res || !res.ok) throw new Error(`Gemini ${res?.status ?? "timeout"}`);
    const data = await res.json();
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}");
    if (!parsed.gist || !parsed.summary || !Array.isArray(parsed.sections)) throw new Error("Bad shape");

    const allText = [parsed.gist, parsed.summary, ...parsed.sections.map((s: { body: string }) => s.body)].join(" ");
    const cited = new Set(Array.from(allText.matchAll(/\[(S\d+)\]/g)).map((m) => m[1]));
    const finalSources: ResearchSource[] = sources
      .filter((s) => cited.has(s.id))
      .map(({ text: _text, ...rest }) => rest);
    const usedSources = finalSources.length > 0 ? finalSources : sources.map(({ text: _t, ...rest }) => rest);

    const pack: ResearchPack = {
      topicId,
      gist: parsed.gist.trim(),
      summary: parsed.summary.trim(),
      sections: parsed.sections.slice(0, 5),
      sources: usedSources,
      quiz: normalizeQuiz(parsed.quiz, fallbackQuiz),
      generatedAt: Date.now(),
    };
    return NextResponse.json(pack);
  } catch (err) {
    console.error("research route error", err);
    const fb = synthesizeQuestionFocusedFallback(sources, topic);
    const pack: ResearchPack = {
      topicId,
      gist: fb.gist,
      summary: fb.summary,
      sections: fb.sections,
      sources: sources.map(({ text: _t, ...rest }) => rest),
      quiz: fallbackQuiz,
      generatedAt: Date.now(),
      degraded: true,
    };
    return NextResponse.json(pack);
  }
}
