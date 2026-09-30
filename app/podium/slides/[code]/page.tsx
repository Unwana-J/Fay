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
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { code } = await params;
  const sParams = searchParams ? await searchParams : {};
  const deck = decodePodiumDeck(code);

  if (!deck) {
    return {
      title: "Party Presentation · The Podium on Fey",
      description:
        "A bold party slide presentation crafted with Fey. Think deeper, articulate clearly.",
    };
  }

  const slideRaw = typeof sParams.slide === "string" ? parseInt(sParams.slide, 10) : undefined;
  const highlightParam =
    typeof sParams.q === "string"
      ? sParams.q
      : typeof sParams.highlight === "string"
      ? sParams.highlight
      : undefined;

  const slideIdx =
    slideRaw && slideRaw >= 1 && slideRaw <= deck.slides.length ? slideRaw - 1 : 0;
  const featuredSlide = deck.slides[slideIdx];

  let excerpt = highlightParam;
  if (!excerpt && featuredSlide) {
    if (slideIdx > 0) {
      if (featuredSlide.quote) {
        excerpt = `“${featuredSlide.quote}” ${featuredSlide.attribution || ""}`.trim();
      } else if (featuredSlide.body) {
        excerpt = `${featuredSlide.title} — ${featuredSlide.body}`;
      } else if (featuredSlide.bullets && featuredSlide.bullets.length > 0) {
        excerpt = `${featuredSlide.title}: ${featuredSlide.bullets.join(" · ")}`;
      } else {
        excerpt = featuredSlide.title;
      }
    }
  }

  const title =
    slideIdx > 0 && featuredSlide?.title
      ? `"${featuredSlide.title}" · ${deck.topic}`
      : `"${deck.topic}" · The Podium on Fey`;

  const description = excerpt
    ? `${excerpt} — Presented by ${deck.author || "Scholar"} · Slide ${slideIdx + 1} of ${deck.slides.length}`
    : `${deck.subtitle || "A Bold Party Presentation"} — Presented by ${deck.author || "Scholar"} · ${deck.slides.length} slides`;

  const queryParams = new URLSearchParams();
  queryParams.set("code", code);
  if (slideIdx > 0) queryParams.set("slide", String(slideIdx + 1));
  if (excerpt) queryParams.set("highlight", excerpt);

  const canonicalUrl = `https://fey.lokinlabs.com.ng/podium/slides/${code}${
    slideIdx > 0 ? `?slide=${slideIdx + 1}` : ""
  }`;
  const ogImageUrl = `https://fey.lokinlabs.com.ng/api/og/podium?${queryParams.toString()}`;

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
          alt: title,
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
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code } = await params;
  const sParams = searchParams ? await searchParams : {};
  const deck = decodePodiumDeck(code);
  const slideRaw = typeof sParams.slide === "string" ? parseInt(sParams.slide, 10) : undefined;
  const initialSlideIndex =
    slideRaw && slideRaw >= 1 && deck && slideRaw <= deck.slides.length ? slideRaw - 1 : 0;
  return <SlidesViewerClient initialDeck={deck} code={code} initialSlideIndex={initialSlideIndex} />;
}
