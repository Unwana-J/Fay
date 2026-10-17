import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Knowledge Constellation: Map What You've Learned · Fey";
const description =
  "An interactive map of the topics you've explained on Fey, showing how ideas connect and recommending what to explore next.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/constellation" },
  openGraph: { title, description, siteName: "Fey", type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title, description },
};

export default function ConstellationLayout({ children }: { children: ReactNode }) {
  return children;
}
