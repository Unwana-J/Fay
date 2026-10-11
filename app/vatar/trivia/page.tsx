import type { Metadata, Viewport } from "next";
import VatarTriviaClient from "@/components/vatar/VatarTriviaClient";

export const metadata: Metadata = {
  title: "Fey Trivia — Lagos Life",
  description: "Nigeria's sharpest trivia inside Lagos Life. History, pop culture and general knowledge.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function VatarTriviaPage() {
  return <VatarTriviaClient />;
}
