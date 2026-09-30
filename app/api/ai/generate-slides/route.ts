import { NextRequest, NextResponse } from "next/server";
import { type SlideStyle } from "@/lib/podium-types";
import { PODIUM_THEMES } from "@/lib/podium-themes";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

function getStyleInstruction(style: SlideStyle): string {
  if (style === "minimal") {
    return `Style: MINIMAL. Clean, sparse language. Short impactful lines. Lots of whitespace energy. Think high-end presentation meets witty observation.`;
  }
  if (style === "academic-chaos") {
    return `Style: ACADEMIC-CHAOS. Treat the presenter's points with absurd scholarly seriousness. Add humorous citations or thesis-style phrasing, but keep the core points grounded in their actual arguments.`;
  }
  // bold (default)
  return `Style: BOLD. Punchy, confident, conversational sentences. Short and impactful. High charisma, zero fluff.`;
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503 });
  }

  const { topic, subtitle, notes, author, style = "bold", category = "General" } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  // Pick a curated theme for this deck
  const palette = PODIUM_THEMES[Math.floor(Math.random() * PODIUM_THEMES.length)];
  const styleInstruction = getStyleInstruction(style as SlideStyle);

  const hasUserNotes = notes && notes.trim().length > 0;
  const notesSection = hasUserNotes
    ? `THE PRESENTER'S PERSONAL NOTES & TALKING POINTS:
"""
${notes.trim()}
"""`
    : `No specific notes provided — generate authentic, witty, high-conviction points from the topic thesis.`;

  const prompt = `You are a world-class speechwriter and presentation editor designing a 5-slide deck for a live talk.

Topic: "${topic}"
Subtitle: "${subtitle}"
Presenter: "${author || "Scholar"}"

${notesSection}

${styleInstruction}

CRITICAL EDITORIAL DIRECTIVES:
1. RESPECT THE PRESENTER'S ORIGINAL THOUGHTS:
   ${hasUserNotes ? "- DO NOT overhaul, erase, or sterilize what the presenter wrote. Their notes represent their actual thoughts, personal convictions, and humor.\n   - KEEP THEIR NATURAL TONE & VOICE: Preserve their conversational flavor, specific anecdotes, regional humor, and authentic personality (e.g. personal stories, direct observations, funny expressions).\n   - EDIT & ELEVATE, DO NOT REPLACE: Structure their points into compelling slides, tighten the phrasing for slide readability, and add 1-2 complementary supporting points that directly reinforce what they wrote." : "- Write in an authentic, natural speaking voice with high conviction and humor."}

2. SLIDE STRUCTURE (EXACTLY 5 SLIDES):
   - Slide 1 (title-only): Huge punchy title honoring the topic and subtitle.
   - Slide 2, 3, 4 (mix of title-body, title-bullets, quote): Deliver the presenter's arguments. If they shared a story, quote, or specific point in their notes, feature it prominently!
   - Slide 5 (closing): A memorable, punchy takeaway or cheeky mic-drop closing line.

Field requirements per slide:
- "title": punchy, strong (max 8 words for title-only/closing, max 6 words for others)
- "subtitle": optional, for title-only
- "bullets": array of 2-3 punchy points (for title-bullets only)
- "body": 1-2 sentences in the presenter's natural tone (for title-body only)
- "quote": quote text (for quote only)
- "attribution": who said it, e.g. "— ${author || "Me"}, from experience" (for quote only)

Respond ONLY with a valid JSON array of exactly 5 slide objects:
[
  {
    "layout": "title-only" | "title-bullets" | "title-body" | "quote" | "closing",
    "title": string,
    "subtitle"?: string,
    "body"?: string,
    "bullets"?: string[],
    "quote"?: string,
    "attribution"?: string
  }
]`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });


    if (!res.ok) {
      const errText = await res.text().catch(() => res.status.toString());
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    let rawSlides = JSON.parse(text);

    // Gemini sometimes wraps the array in an object: { slides: [...] } or { data: [...] }
    // Unwrap it if so.
    if (!Array.isArray(rawSlides)) {
      const firstArrayValue = Object.values(rawSlides as Record<string, unknown>).find(
        (v) => Array.isArray(v)
      );
      if (firstArrayValue) {
        rawSlides = firstArrayValue;
      } else {
        throw new Error(`AI returned unexpected shape: ${JSON.stringify(rawSlides).slice(0, 200)}`);
      }
    }

    if (rawSlides.length === 0) {
      throw new Error("AI returned an empty slide array");
    }

    // Inject colour palette into each slide
    const slides = rawSlides.slice(0, 5).map((slide: Record<string, unknown>) => ({
      ...slide,
      bgColor: palette.bgColor,
      textColor: palette.textColor,
      accentColor: palette.accentColor,
    }));

    const deck = {
      id: `deck-${Date.now()}`,
      topic,
      subtitle,
      author: author || "Scholar",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      slides,
      category,
      style,
    };

    return NextResponse.json({ deck });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[ai/generate-slides]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
