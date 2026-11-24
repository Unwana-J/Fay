import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security-guard";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`ai-podium-topic:${clientIp}`, 15, 60);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many topic requests. Please wait a moment." }, { status: 429 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { vibe, exclude = [] } = body;
  const safeVibe = typeof vibe === "string" ? vibe.slice(0, 60) : "";
  const safeExclude = Array.isArray(exclude) ? exclude.slice(0, 20).map((e) => String(e).slice(0, 120)) : [];

  const vibeInstruction = safeVibe
    ? `The topic should fit the vibe: "${safeVibe}".`
    : `Pick any vibe from: Hot Take, Culture, Social Commentary, Pseudo-Science, Economics, Pop Culture.`;

  const excludeInstruction =
    safeExclude.length > 0
      ? `Do NOT generate topics similar to any of these (already used): ${safeExclude.join(", ")}.`
      : "";

  const prompt = `You are the host of a chaotic, fun party presentation game. Generate ONE bold, opinionated presentation topic for a house party.

${vibeInstruction}
${excludeInstruction}

Rules:
- The topic should be bold, slightly controversial, culturally aware, and very fun
- Think: Ted Talk meets drunk conversation
- The subtitle should be a cheeky academic-sounding label (e.g. "A Sociological Study", "An Exposé", "Field Notes")
- Seed bullets are 3 punchy starting arguments or angles the presenter could use
- Keep it fun, not actually harmful

Respond ONLY with valid JSON matching this exact shape:
{
  "text": "The main topic title",
  "subtitle": "A cheeky subtitle label",
  "category": "One of: Economics, Culture, Psychology, Politics, Relationships, Health, Entertainment, Technology, Food, Work, Social, Music, Media, Fashion, Philosophy, Education, Family, Astrology",
  "vibe": "The vibe category",
  "seedBullets": ["First punchy argument", "Second angle", "Third spicy point"]
}`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 1.2,
          maxOutputTokens: 400,
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const result = JSON.parse(text);

    return NextResponse.json({
      id: `ai-${Date.now()}`,
      text: result.text ?? "The Unpopular Opinion That is Actually Correct",
      subtitle: result.subtitle ?? "A Bold Claim",
      category: result.category ?? "Social",
      vibe: result.vibe ?? "🔥 Hot Take",
      seedBullets: Array.isArray(result.seedBullets) ? result.seedBullets : [],
    });
  } catch (e) {
    console.error("[ai/podium-topic]", e);
    return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
  }
}
