export interface AvatarOption {
  id: string;
  title: string;
  path: string;
  role: string;
}

export const AVATARS: AvatarOption[] = [
  { id: "scholar", title: "The Polymath", path: "/avatars/avatar-scholar.svg", role: "Critical Thinker" },
  { id: "orator", title: "The Orator", path: "/avatars/avatar-orator.svg", role: "Eloquent Speaker" },
  { id: "pioneer", title: "The Explorer", path: "/avatars/avatar-pioneer.svg", role: "Curious Mind" },
  { id: "architect", title: "The Architect", path: "/avatars/avatar-architect.svg", role: "Systems Designer" },
  { id: "alchemist", title: "The Scientist", path: "/avatars/avatar-alchemist.svg", role: "Empirical Analyst" },
  { id: "philosopher", title: "The Thinker", path: "/avatars/avatar-philosopher.svg", role: "Deep Inquirer" },
  { id: "novelist", title: "The Writer", path: "/avatars/avatar-novelist.svg", role: "Storyteller & Stylist" },
  { id: "strategist", title: "The Mastermind", path: "/avatars/avatar-strategist.svg", role: "Strategic Tactician" },
  { id: "botanist", title: "The Naturalist", path: "/avatars/avatar-botanist.svg", role: "Ecological Scholar" },
  { id: "cosmologist", title: "The Stargazer", path: "/avatars/avatar-cosmologist.svg", role: "Universal Observer" },
  { id: "artisan", title: "The Creative", path: "/avatars/avatar-artisan.svg", role: "Aesthetic Visionary" },
  { id: "luminary", title: "The Visionary", path: "/avatars/avatar-luminary.svg", role: "Catalyst of Ideas" },
];

export const DEFAULT_AVATAR_PATH = "/avatars/avatar-scholar.svg";

/**
 * Returns a valid image URL for the avatar, or fallback if legacy emoji.
 */
export function resolveAvatarSrc(avatar?: string | null): { isImage: boolean; value: string } {
  if (!avatar || !avatar.trim()) {
    return { isImage: true, value: DEFAULT_AVATAR_PATH };
  }

  // Check if it's one of our predefined avatars (by ID or path)
  const found = AVATARS.find((a) => a.id === avatar || a.path === avatar);
  if (found) {
    return { isImage: true, value: found.path };
  }

  // Check if it's already an image URL or data URI
  if (avatar.startsWith("/") || avatar.startsWith("http") || avatar.startsWith("data:")) {
    return { isImage: true, value: avatar };
  }

  // Legacy emoji fallback
  return { isImage: false, value: avatar };
}
