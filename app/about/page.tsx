/**
 * /about — Public, server-rendered landing page for Fey.
 */

import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";
import LandingPageView from "@/components/marketing/LandingPageView";

const title = "Fey: A Curated Daily Learning & Speaking Habit + Smart Games";
const description =
  "Discover ideas outside your circle, research them, and explain them out loud in 90 seconds. Plus play Naija Trivia, Online Articulate, and The Podium with friends. A focused daily habit to think deeper and articulate clearly.";

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
