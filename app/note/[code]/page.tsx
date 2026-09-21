/**
 * Server component wrapper for /note/[code]
 *
 * Decodes the note payload once, server-side. The decoded object is passed
 * directly to the NoteContent client component — no client-side decode needed.
 *
 * generateMetadata also uses the decoded note to produce per-note Open Graph
 * tags (topic title + note snippet) that WhatsApp, iMessage, Twitter etc read.
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
    },
    twitter: {
      card: "summary",
      title,
      description: snippet,
    },
    other: {
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
  // Decode once on the server — pass the result directly to the client component
  const note = decodeSharedNote(code);
  return <NoteContent note={note} />;
}
