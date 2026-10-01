/**
 * Trivia Performance Remarks & Cultural Feedback Generator
 *
 * Provides culturally attuned, humorous, reassuring (< 60%)
 * and hyped-up (>= 60%, >= 85%, >= 90%) feedback messages.
 */

export interface TriviaRemark {
  gradeTitle: string;
  funMessage: string;
  color: string;
  tier: "reassuring" | "hyped" | "phd" | "genius";
}

const REASSURING_MESSAGES = [
  "Well, who gets paid to know this country anyway?",
  "Your best is good enough, try again tomorrow!",
  "The questions were clearly set by someone with a personal vendetta.",
  "Don't let WAEC trauma resurface, it's just trivia!",
  "Omo, this country is hard enough without trivia exams.",
  "Knowledge was tested, but vibes remained immaculate.",
  "At least your phone battery lasted through the test.",
  "Country hard, trivia harder. Take a chilled malt drink.",
  "Failure is just character development for your next run.",
  "The pass mark was clearly unrealistic anyway.",
];

const HYPED_MESSAGES = [
  "Baddest! You really know your stuff!",
  "Certified OG! Solid intellectual flex.",
  "The ancestors are nodding with approval.",
  "Clear road for who sabi book!",
  "You didn't come to play, you came to educate!",
  "Heavy intellect detected. Well done!",
  "Sharp sharp! Your brain is doing overtime in the best way.",
  "Full chest! You represented the family name well.",
];

const PHD_MESSAGES = [
  "Please register for that PhD, I'm really impressed!",
  "Scholar par excellence! National honours loading.",
  "Are you secretly consulting for the Federal Ministry of Education?",
  "You have disgraced the examiners thoroughly!",
  "Pure distinction. The academic senate is speechless!",
  "Senior Research Fellow! Your certificate is in the mail.",
];

const GENIUS_MESSAGES = [
  "Do you do this professionally?!",
  "Titan of Industry & Intellect! Absolutely untouchable.",
  "They need to name a federal polytechnic after you at this point!",
  "Genius mode unlocked. Who is even checking you?!",
  "100% pure wizardry. Go collect your chieftaincy title!",
  "Walking encyclopedia! Even Google is consulting you.",
];

/**
 * Returns a culturally calibrated remark based on score percentage.
 * Uses a seed (e.g. question IDs, username, or timestamp) for deterministic or varied picks.
 */
export function getTriviaPerformanceRemark(pct: number, seed?: number | string): TriviaRemark {
  const hash = Math.abs(
    typeof seed === "number"
      ? seed
      : typeof seed === "string"
      ? seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : Math.floor(Date.now() / 1000)
  );

  if (pct >= 90) {
    const msg = GENIUS_MESSAGES[hash % GENIUS_MESSAGES.length];
    return {
      gradeTitle: "Professional Genius",
      funMessage: msg,
      color: "var(--gold)",
      tier: "genius",
    };
  }

  if (pct >= 85) {
    const msg = PHD_MESSAGES[hash % PHD_MESSAGES.length];
    return {
      gradeTitle: "PhD Candidate",
      funMessage: msg,
      color: "#8B5CF6",
      tier: "phd",
    };
  }

  if (pct >= 60) {
    const msg = HYPED_MESSAGES[hash % HYPED_MESSAGES.length];
    return {
      gradeTitle: "Baddest!",
      funMessage: msg,
      color: "var(--olive)",
      tier: "hyped",
    };
  }

  // < 60%
  const msg = REASSURING_MESSAGES[hash % REASSURING_MESSAGES.length];
  return {
    gradeTitle: pct >= 40 ? "Honourable Attempt" : "Keep Studying",
    funMessage: msg,
    color: "var(--terra)",
    tier: "reassuring",
  };
}
