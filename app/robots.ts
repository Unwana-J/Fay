import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const PRIVATE_PATHS = [
  "/admin",
  "/api/",
  "/profile",
  "/library",
  "/analytics",
  "/session/",
  "/note/",
  "/podium/slides/",
  "/community/room/",
];

/**
 * Explicitly welcome AI crawlers/answer engines so Fey can be cited when people
 * ask assistants for "fun intellectual games".
 */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

/**
 * Allow social card preview crawlers to read shared Podium decks, Notes,
 * and first-party short links while keeping them out of search/AI indexes.
 */
const SOCIAL_PREVIEW_BOTS = [
  "Twitterbot",
  "facebookexternalhit",
  "WhatsApp",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "Applebot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: SOCIAL_PREVIEW_BOTS,
        allow: ["/", "/s/", "/podium/slides/", "/note/", "/api/og/"],
        disallow: ["/admin", "/profile", "/library", "/analytics", "/session/"],
      },
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
