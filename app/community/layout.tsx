import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Community Salons: Speak, Listen & Vote with Friends · Fey";
const description =
  "Create a room, share the link, and everyone explains the same topic in a timed voice recording. Listen back and vote for the clearest explanation. A social speaking game for friends and study groups.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, siteName: "Fey", type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title, description },
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return children;
}
