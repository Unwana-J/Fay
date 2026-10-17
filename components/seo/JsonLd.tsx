import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, GAMES, CORE_FEATURES, SITE_FAQ } from "@/lib/seo";

/** Renders a schema.org JSON-LD block. Server-safe (no client JS). */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" to prevent </script> injection.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

/** Site-wide graph: who makes Fey, what the site is, and what the app does. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Lokin Labs",
        url: "https://lokinlabs.com.ng",
        brand: { "@type": "Brand", name: SITE_NAME },
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: ["Fey Learning", "Fey by Lokin Labs"],
        description: SITE_DESCRIPTION,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Daily learning and public speaking practice",
        operatingSystem: "Any (web browser)",
        featureList: [...CORE_FEATURES, ...GAMES].map((f) => `${f.name}: ${f.description}`),
        audience: {
          "@type": "Audience",
          audienceType: "Professionals, students, new graduates, parents of teenagers, lifelong learners",
        },
        teaches: ["Critical thinking", "Public speaking", "Clear communication", "Feynman Technique"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** ItemList of the add-on games (used on /games and /about). */
export function gamesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Smart games on Fey",
    itemListElement: GAMES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VideoGame",
        name: g.name,
        url: `${SITE_URL}${g.path}`,
        description: g.description,
        genre: g.genre,
        numberOfPlayers: g.players,
        gamePlatform: "Web browser",
        playMode: g.players === "1" ? "SinglePlayer" : "MultiPlayer",
        applicationCategory: "Game",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": ORG_ID },
      },
    })),
  };
}

export function faqJsonLd(faq = SITE_FAQ) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
