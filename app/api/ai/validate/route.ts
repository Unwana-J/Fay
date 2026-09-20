import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { correct: false, confidence: 0, reason: "AI referee not configured." },
      { status: 503 }
    );
  }

  const { targetWord, guess, difficulty = "mixed" } = await req.json();

  if (!targetWord || !guess) {
    return NextResponse.json({ error: "Missing targetWord or guess" }, { status: 400 });
  }

  const prompt = `You are a fair and lenient referee for a fast-paced multiplayer word-description party game called Fey.

The secret target word is: "${targetWord}"
A player guessed: "${guess}"
Game difficulty mode: ${difficulty}

Your job is to decide if the guess should be accepted as correct.

**Phonetic leniency rule (very important):**
If the player clearly MEANT the right word but mispronounced it or the speech-to-text slightly garbled it, ACCEPT it.
Examples of phonetic near-misses that should be ACCEPTED:
- "Wustersher" or "Wooster-shire" → "Worcestershire" ✅
- "Fotosinthesis" → "Photosynthesis" ✅  
- "Anemoany" → "Anemone" ✅
- "Kwee-no-ah" → "Quinoa" ✅
- "Feenomenon" → "Phenomenon" ✅

Reject only if the guess is a genuinely different word or completely unrelated.

**Difficulty rules for description-based guesses:**
- easy: exact word, common synonyms, or obvious phonetic near-miss
- mixed: exact, synonyms, paraphrases, phonetic near-misses all count
- hard: exact word, very close synonyms, phonetic near-misses still count (pronunciation ≠ knowledge)

Respond ONLY with valid JSON matching exactly this shape:
{"correct": true, "confidence": 0.97, "reason": "One short sentence explaining why.", "phoneticMatch": false}

Set phoneticMatch to true if you are accepting a mispronunciation.`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 120,
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const result = JSON.parse(text);

    return NextResponse.json({
      correct: Boolean(result.correct),
      confidence: typeof result.confidence === "number" ? result.confidence : 0.5,
      reason: result.reason ?? "",
      phoneticMatch: Boolean(result.phoneticMatch),
    });
  } catch (e) {
    console.error("[ai/validate]", e);
    return NextResponse.json(
      { correct: false, confidence: 0, reason: "AI unavailable — judge manually." },
      { status: 500 }
    );
  }
}
