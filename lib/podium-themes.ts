export interface PodiumTheme {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  description: string;
}

export const PODIUM_THEMES: PodiumTheme[] = [
  {
    id: "vivid-sky",
    name: "Cobalt Blue",
    bgColor: "#0052cc",
    textColor: "#ffffff",
    accentColor: "#ffd166",
    description: "Bold electric blue with solar gold accent",
  },
  {
    id: "forest-olive",
    name: "Fey Olive",
    bgColor: "#1b281f",
    textColor: "#f4f1eb",
    accentColor: "#a3b18a",
    description: "Deep classical forest with sage highlights",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    bgColor: "#8c2d19",
    textColor: "#fdfbf7",
    accentColor: "#ffd166",
    description: "Editorial burgundy with warm amber accent",
  },
  {
    id: "midnight",
    name: "Midnight",
    bgColor: "#0d111a",
    textColor: "#ffffff",
    accentColor: "#6c63ff",
    description: "Deep obsidian navy with electric violet",
  },
  {
    id: "chalk-editorial",
    name: "Chalk Parchment",
    bgColor: "#f7f4ee",
    textColor: "#18181b",
    accentColor: "#8c2d19",
    description: "Minimalist light gallery with terracotta ink",
  },
  {
    id: "naija-green",
    name: "Heritage Emerald",
    bgColor: "#004d26",
    textColor: "#ffffff",
    accentColor: "#6ee7b7",
    description: "Deep rich emerald with mint highlight",
  },
  {
    id: "electric-grape",
    name: "Royal Plum",
    bgColor: "#2a0845",
    textColor: "#ffffff",
    accentColor: "#f472b6",
    description: "Dramatic dark purple with neon rose",
  },
  {
    id: "burnt-amber",
    name: "Burnt Amber",
    bgColor: "#3d1a0e",
    textColor: "#fef3c7",
    accentColor: "#f59e0b",
    description: "Warm leather espresso with golden amber",
  },
  {
    id: "obsidian-gold",
    name: "Obsidian Gold",
    bgColor: "#121212",
    textColor: "#f5f5f5",
    accentColor: "#d4af37",
    description: "Cinematic black with antique gold accent",
  },
  {
    id: "slate-minimal",
    name: "Nordic Slate",
    bgColor: "#1e293b",
    textColor: "#f8fafc",
    accentColor: "#38bdf8",
    description: "Crisp architectural slate with cyan pop",
  },
];
