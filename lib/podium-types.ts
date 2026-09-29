export type SlideLayout =
  | "title-only"
  | "title-body"
  | "title-bullets"
  | "quote"
  | "closing";

export type SlideStyle = "bold" | "minimal" | "academic-chaos";

export interface PodiumSlide {
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  quote?: string;
  attribution?: string;
  imageUrl?: string;
  imageAlt?: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export interface PodiumTopic {
  id: string;
  text: string;
  subtitle: string;
  category: string;
  vibe: string;
  seedBullets: string[];
}

export interface PodiumDeck {
  id: string;
  topic: string;
  subtitle: string;
  author: string;
  createdAt: string;
  slides: PodiumSlide[];
  category: string;
  style: SlideStyle;
}
