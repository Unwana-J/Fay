import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "daily" },
    { path: "/about", priority: 0.9, freq: "weekly" },
    { path: "/games", priority: 0.7, freq: "weekly" },
    { path: "/games/trivia", priority: 0.9, freq: "daily" },
    { path: "/play", priority: 0.8, freq: "weekly" },
    { path: "/podium", priority: 0.8, freq: "weekly" },
    { path: "/discover", priority: 0.95, freq: "daily" },
    { path: "/community", priority: 0.8, freq: "daily" },
    { path: "/constellation", priority: 0.6, freq: "monthly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
