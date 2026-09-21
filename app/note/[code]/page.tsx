/**
 * Server component wrapper for /note/[code]
 *
 * generateMetadata decodes the note payload server-side so that WhatsApp,
 * iMessage, Twitter, LinkedIn etc. receive per-note Open Graph tags:
 *   og:title    → the topic the scholar wrote about
 *   og:description → the first ~200 chars of the actual note
 *
 * The interactive UI lives in NoteContent.tsx (client component).
 */

import type { Metadata } from "next";
import { decodeSharedNote } from "@/lib/share-note";
import NoteContent from "./NoteContent";

// ── Dynamic OG metadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const note = decodeSharedNote(code);

  if (!note) {
    return {
      title: "Scholar Dispatch — Fey",
      description:
        "A shared synthesis note from the Fey learning platform. Think deeper, articulate clearly.",
    };
  }

  // Trim note to a compelling preview snippet
  const raw = note.notes.trim().replace(/\n+/g, " ");
  const snippet = raw.length > 220 ? raw.slice(0, 220) + "…" : raw;
  const title = `"${note.topicText}" · Scholar Dispatch — Fey`;
  const byline = `By ${note.author} · ${note.category} · ${note.difficulty}`;

  return {
    title,
    description: snippet,
    openGraph: {
      title,
      description: snippet,
      siteName: "Fey — Think Deeper, Articulate Clearly",
      type: "article",
      // If you add a /public/og-default.png, reference it here:
      // images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary",
      title,
      description: snippet,
    },
    other: {
      // WhatsApp reads these directly
      "og:site_name": "Fey",
      "article:author": byline,
    },
  };
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default async function NotePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <NoteContent code={code} />;
}
