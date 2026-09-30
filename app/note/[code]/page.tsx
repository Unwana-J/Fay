/**
 * Server component wrapper for /note/[code]
 *
 * Decodes the note payload on the server. Passes both the decoded note and
 * the raw `code` parameter to NoteContent so it has both instant SSR hydration
 * and a client-side fallback if required.
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
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { code } = await params;
  const sParams = searchParams ? await searchParams : {};
  const note = decodeSharedNote(code);

  if (!note) {
    return {
      title: "Scholar Dispatch — Fey",
      description:
        "A shared synthesis note from the Fey learning platform. Think deeper, articulate clearly.",
    };
  }

  const highlight =
    (typeof sParams.highlight === "string"
      ? sParams.highlight
      : typeof sParams.q === "string"
      ? sParams.q
      : ""
    ).trim();

  // Strip HTML tags (e.g. <p>, <br>, etc.) and trim note to a clean, compelling preview snippet
  const cleanText = note.notes
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const defaultSnippet = cleanText.length > 220 ? cleanText.slice(0, 220) + "…" : cleanText;
  const snippet = highlight ? `“${highlight}”` : defaultSnippet;

  const title = highlight
    ? `“${highlight.length > 60 ? highlight.slice(0, 60) + "…" : highlight}” · ${note.topicText} — Fey`
    : `"${note.topicText}" · Scholar Dispatch — Fey`;

  const byline = `By ${note.author} · ${note.category} · ${note.difficulty}`;
  const canonicalUrl = `https://fey.lokinlabs.com.ng/note/${code}${
    highlight ? `?q=${encodeURIComponent(highlight)}` : ""
  }`;
  const ogImageUrl = `https://fey.lokinlabs.com.ng/api/og/note?code=${encodeURIComponent(code)}${
    highlight ? `&highlight=${encodeURIComponent(highlight)}` : ""
  }`;

  return {
    title,
    description: snippet,
    openGraph: {
      title,
      description: snippet,
      siteName: "Fey — Think Deeper, Articulate Clearly",
      type: "article",
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: snippet,
      images: [ogImageUrl],
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
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code } = await params;
  const sParams = searchParams ? await searchParams : {};
  const note = decodeSharedNote(code);
  const highlight =
    typeof sParams.highlight === "string"
      ? sParams.highlight
      : typeof sParams.q === "string"
      ? sParams.q
      : undefined;
  return <NoteContent initialNote={note} code={code} initialHighlight={highlight} />;
}
