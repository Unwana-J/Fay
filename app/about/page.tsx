/**
 * /about — Public, server-rendered landing page for Fey.
 */

import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";
import LandingPageView from "@/components/marketing/LandingPageView";

const title = "Fey: A Curated Daily Learning & Speaking Habit + Smart Games";
const description =
  "Discover ideas outside your circle, research them, and explain them out loud in 90 seconds. Start a 7-day Speak-to-Unlock Classroom with close friends, or play Naija Trivia, Quant, Online Articulate, and The Podium.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, siteName: SITE_NAME, type: "website", url: "/about", locale: "en_NG" },
  twitter: { card: "summary_large_image", title, description },
};

export default function AboutPage() {
  return <LandingPageView />;
}
