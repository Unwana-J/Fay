import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503 });
  }

  const { vibe, exclude = [] } = await req.json();

  const vibeInstruction = vibe
    ? `The topic should fit the vibe: "${vibe}".`
    : `Pick any vibe from: Hot Take, Culture, Social Commentary, Pseudo-Science, Economics, Pop Culture.`;

  const excludeInstruction =
    exclude.length > 0
      ? `Do NOT generate topics similar to any of these (already used): ${exclude.join(", ")}.`
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
