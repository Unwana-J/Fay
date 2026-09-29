import { NextRequest, NextResponse } from "next/server";
import { type SlideStyle } from "@/lib/podium-types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Colour palettes per theme name
const PALETTES = [
  { name: "midnight",       bgColor: "#0d0d1a", textColor: "#ffffff", accentColor: "#6c63ff" },
  { name: "vivid-sky",      bgColor: "#0055cc", textColor: "#ffffff", accentColor: "#ffe45e" },
  { name: "forest-fire",    bgColor: "#1a3a2a", textColor: "#f0ead6", accentColor: "#e07a5f" },
  { name: "terracotta",     bgColor: "#b03a2e", textColor: "#fff8f0", accentColor: "#ffd166" },
  { name: "chalk",          bgColor: "#f7f5f0", textColor: "#1a1a1a", accentColor: "#2d6a4f" },
  { name: "naija-green",    bgColor: "#006633", textColor: "#ffffff", accentColor: "#ffffff" },
  { name: "electric-grape", bgColor: "#2d0057", textColor: "#ffffff", accentColor: "#e040fb" },
  { name: "burnt-amber",    bgColor: "#7a2e0e", textColor: "#fef3c7", accentColor: "#fbbf24" },
];

function getStyleInstruction(style: SlideStyle): string {
  if (style === "minimal") {
    return `Style: MINIMAL. Clean, sparse language. Short sentences. Lots of white space energy. Think Apple keynote meets art gallery.`;
  }
  if (style === "academic-chaos") {
    return `Style: ACADEMIC-CHAOS. Write as if the presenter has a PhD in this ridiculous topic. Add fake citations like (Okafor et al., 2019), use unnecessarily long words, write bullet points as if they are thesis statements, but the topic is still absurd and funny. Think: Harvard professor who secretly agrees with the conspiracy.`;
  }
  // bold (default)
  return `Style: BOLD. Punchy, declarative sentences. Short and impactful. Think TED Talk meets roast comedy. No hedging.`;
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503 });
  }

  const { topic, subtitle, notes, author, style = "bold", category = "General" } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  // Pick a random palette for this deck
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const styleInstruction = getStyleInstruction(style as SlideStyle);

  const notesSection = notes?.trim()
    ? `The presenter's research notes are:\n${notes}`
    : `No notes provided — generate compelling content from the topic itself.`;

  const prompt = `You are building a bold party presentation slide deck for the topic: "${topic}".
Subtitle: "${subtitle}"
Presenter: ${author}

${notesSection}

${styleInstruction}

Generate EXACTLY 5 slides as a JSON array.

Slide structure rules:
- Slide 1: layout must be "title-only". Use a huge punchy title (can be the topic text or a twist on it) and the subtitle. This is the title card.
- Slides 2, 3, 4: layout can be "title-bullets", "title-body", or "quote". Mix them up. Use the notes to generate the content. Make each slide make ONE clear argument or point.
- Slide 5: layout must be "closing". A cheeky closing statement. Examples: "And that's my TED talk.", "No further questions.", "The mic has been dropped.", "Thank you for coming to my unhinged presentation."

For each slide:
- title: punchy, short (max 8 words for title-only/closing, max 6 words for others)
- subtitle (title-only only): the deck subtitle
- bullets (title-bullets only): array of 3 punchy bullet points
- body (title-body only): 1-2 sentences max
- quote (quote only): the actual quote text
- attribution (quote only): who said it (can be fictional or "— Me, probably")

Respond ONLY with a valid JSON array of exactly 5 slide objects. Each object has:
{
  "layout": "title-only" | "title-bullets" | "title-body" | "quote" | "closing",
  "title": string,
  "subtitle": string (optional, title-only only),
  "body": string (optional),
  "bullets": string[] (optional),
  "quote": string (optional),
  "attribution": string (optional)
}

Do NOT include bgColor, textColor, or accentColor — those will be added server-side.`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 1.0,
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
