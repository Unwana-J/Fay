import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fey — Think Deeper, Articulate Clearly",
    short_name: "Fey",
    description:
      "Explain big ideas in your own voice in 90 seconds. Daily topics, streaks, trivia and friend classrooms.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F5F0",
    theme_color: "#444E2C",
    categories: ["education", "games"],
    icons: [
      { src: "/icons/fey-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/fey-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/fey-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
