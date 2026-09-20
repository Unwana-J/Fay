import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const {
    speakerName,
    wordsCorrect,
    wordsSkipped,
    timeSeconds,
    wordsPerMinute,
    phoneticMatches, // words where guesser was accepted on phonetic leniency
  } = await req.json();

  const correctList = (wordsCorrect as string[]).join(", ") || "none";
  const skippedList = (wordsSkipped as string[]).join(", ") || "none";
  const phoneticList = (phoneticMatches as string[] || []).join(", ") || "none";

  const prompt = `You are Fey, an AI speaking coach for a multiplayer word-description party game like Articulate.

A player just completed their speaking turn. Here are their stats:

Speaker: ${speakerName}
Words successfully described (teammates guessed): ${correctList}
Words skipped (teammates couldn't guess): ${skippedList}
Words guessed via phonetic approximation: ${phoneticList}
Time used: ${timeSeconds} seconds
Speaking pace: ${wordsPerMinute} words per minute

Your job is to give SHORT, ACTIONABLE pronunciation and communication coaching.

Analyse:
1. Pronunciation clarity — did the skipped words tend to be complex/long words? Were phonetic matches needed?
2. Speaking pace — is ${wordsPerMinute} words/min too fast, too slow, or ideal (8-12 is ideal for this game)?
3. Vocabulary strategy — did they choose clear, concrete clues?

Respond ONLY with valid JSON:
{
  "pronunciationScore": 8.2,
  "paceScore": 7.5,
  "clarityScore": 9.0,
  "overallScore": 8.3,
  "paceFeedback": "one sentence on pace",
  "pronunciationTip": "one specific pronunciation tip",
  "vocabularyTip": "one tip on word choice for clues",
  "strength": "one thing they did well",
  "improvement": "one most important improvement",
  "challengeWords": ["word1", "word2"]
}

challengeWords should list 1-3 skipped words that were likely difficult to pronounce clearly.
All scores are out of 10. Be honest but encouraging. Keep all text under 15 words per field.`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (e) {
    console.error("[ai/pronunciation-coach]", e);
    return NextResponse.json({ error: "AI coaching unavailable" }, { status: 500 });
  }
}
