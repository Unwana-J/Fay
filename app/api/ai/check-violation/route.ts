import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { violation: false, type: "none", excerpt: "" },
      { status: 503 }
    );
  }

  const { targetWord, description } = await req.json();

  if (!targetWord || !description) {
    return NextResponse.json({ error: "Missing targetWord or description" }, { status: 400 });
  }

  const prompt = `You are a strict rule enforcement referee for a word-description party game called Fey.

The secret word the speaker must NOT say is: "${targetWord}"
The speaker said: "${description}"

Check for these rule violations only:
1. said-word: The speaker said the exact target word (or a direct conjugation, e.g. "playing" for "play")
2. part-of-word: The speaker said a meaningful part of the target word (e.g. "chain" for "blockchain")
3. spelled: The speaker spelled out the word letter by letter
4. rhyme-hint: The speaker gave an explicit rhyme hint (e.g. "it rhymes with...") 

If none of these violations occurred, return violation: false with type "none".
Be strict but fair — only flag clear violations, not borderline metaphors or unrelated uses.

Respond ONLY with valid JSON matching exactly this shape:
{"violation": false, "type": "none", "excerpt": ""}

or if there is a violation:
{"violation": true, "type": "said-word", "excerpt": "the exact phrase that caused the violation"}`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 80,
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const result = JSON.parse(text);

    return NextResponse.json({
      violation: Boolean(result.violation),
      type: result.type ?? "none",
      excerpt: result.excerpt ?? "",
    });
  } catch (e) {
    console.error("[ai/check-violation]", e);
    return NextResponse.json({ violation: false, type: "none", excerpt: "" }, { status: 500 });
  }
}
