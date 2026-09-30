/**
 * Server component wrapper for /podium/slides/[code]
 *
 * Decodes the slide deck payload on the server for instant SSR hydration
 * and dynamic Open Graph & Twitter card previews on WhatsApp, X, iMessage, LinkedIn, etc.
 */

import type { Metadata } from "next";
import { decodePodiumDeck } from "@/lib/podium-share";
import SlidesViewerClient from "./SlidesViewerClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const deck = decodePodiumDeck(code);

  if (!deck) {
    return {
      title: "Party Presentation · The Podium on Fey",
      description:
        "A bold party slide presentation crafted with Fey. Think deeper, articulate clearly.",
    };
  }

  const title = `"${deck.topic}" · The Podium on Fey`;
  const description = `${deck.subtitle || "A Bold Party Presentation"} — Presented by ${deck.author || "Scholar"} · ${deck.slides.length} slides`;
  const canonicalUrl = `https://fey.lokinlabs.com.ng/podium/slides/${code}`;
  const ogImageUrl = `https://fey.lokinlabs.com.ng/api/og/podium?code=${encodeURIComponent(code)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Fey — Think Deeper, Articulate Clearly",
      type: "article",
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: deck.topic,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      "og:site_name": "Fey",
      "article:author": deck.author || "Scholar",
    },
  };
}

export default async function PodiumSlidesPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const deck = decodePodiumDeck(code);
  return <SlidesViewerClient initialDeck={deck} code={code} />;
}
