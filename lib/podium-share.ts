/**
 * Utility to encode and decode Podium slide decks into URL-safe strings.
 * Zero-database: state is completely portable via URL.
 *
 * Uses lz-string LZ compression. Codec:
 *   encode: JSON → LZ-compress → URL-safe string
 *   decode: URL-safe string → LZ-decompress → JSON
 */

import LZString from "lz-string";
import { type PodiumDeck } from "@/lib/podium-types";

// ── Encode ────────────────────────────────────────────────────────────────────

export function encodePodiumDeck(deck: PodiumDeck): string {
  try {
    const jsonStr = JSON.stringify(deck);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error("Failed to encode podium deck", err);
    return "";
  }
}

// ── Decode ────────────────────────────────────────────────────────────────────

export function decodePodiumDeck(encoded: string): PodiumDeck | null {
  if (!encoded || typeof encoded !== "string") return null;

  try {
    let decompressed = LZString.decompressFromEncodedURIComponent(encoded);

    if (!decompressed) {
      try {
        decompressed = LZString.decompressFromEncodedURIComponent(decodeURIComponent(encoded));
      } catch {}
    }

    if (!decompressed && encoded.includes(" ")) {
      try {
        decompressed = LZString.decompressFromEncodedURIComponent(encoded.replace(/ /g, "+"));
      } catch {}
    }

    if (decompressed) {
      const data = JSON.parse(decompressed);
      if (data && data.topic && Array.isArray(data.slides)) {
        data.slides = data.slides.map((slide: Record<string, unknown>) => {
          if (typeof slide.imageUrl === "string") {
            const url = slide.imageUrl.trim();
            const isSafeImage =
              /^https?:\/\//i.test(url) ||
              /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(url) ||
              url.startsWith("/");
            if (!isSafeImage) {
              return { ...slide, imageUrl: undefined };
            }
          }
          return slide;
        });
        return data as PodiumDeck;
      }
    }

    return null;
  } catch (err) {
    console.error("Failed to decode podium deck", err);
    return null;
  }
}
