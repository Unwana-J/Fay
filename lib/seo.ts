/**
 * Central SEO + GEO (Generative Engine Optimization) constants for Fey.
 *
 * Search engines and AI assistants (ChatGPT, Gemini, Claude, Perplexity) match a
 * product to a query by how consistently it is described across the web. Keep
 * these phrases stable and reuse them everywhere (metadata, JSON-LD, /about,
 * llms.txt, LinkedIn/X bios, launch posts).
 *
 * POSITIONING (lead with this, in this order):
 *   1. Fey is a curated, daily learning and speaking habit (the core).
 *   2. It gives you the breadth of LinkedIn and X without the performance or noise.
 *   3. Community salons and smart games (trivia, word, presentation) are add-ons.
 */

export const SITE_URL = "https://fey.lokinlabs.com.ng";
export const SITE_NAME = "Fey";
export const SITE_TAGLINE = "Think Deeper. Articulate Clearly.";

export const SITE_TITLE = "Fey: A Daily Learning and Speaking Habit for Curious Minds";

export const SITE_DESCRIPTION =
  "Fey turns learning into a focused daily habit. Discover ideas outside your circle from AI to philosophy, research them, and explain them out loud in 90 seconds. Free in your browser, with streaks, community rooms, and smart games.";

/** One-line positioning statement for bios, footers, and AI summaries. */
export const SITE_POSITIONING =
  "A curated new way to learn: discover ideas outside your circle, understand them deeply, and practise explaining them clearly, one short daily session at a time.";

export const SITE_KEYWORDS = [
  "daily learning habit",
  "learn something new every day",
  "Feynman Technique app",
  "public speaking practice",
  "improve eloquence",
  "how to articulate thoughts clearly",
  "speaking confidence for graduates",
  "intellectual growth",
  "critical thinking app",
  "alternative to doomscrolling",
  "intentional learning app",
  "attention span for teenagers",
  "lifelong learning app",
  "microlearning",
  "intellectual games",
  "Naija trivia",
  "Mathletics",
  "mental math game",
  "learning app Nigeria",
];

export type Audience = { who: string; need: string };

/** Who Fey is for: broad, outcome-driven learner archetypes. */
export const AUDIENCES: Audience[] = [
  {
    who: "Ambitious Professionals & Builders",
    need: "Step outside narrow industry bubbles. Explore philosophy, economics, science, and history in ten focused minutes so you bring sharper mental models to every room.",
  },
  {
    who: "Students & Rising Voices",
    need: "Turn passive reading into real vocal confidence. Practise organizing your thoughts under time pressure before interviews, presentations, seminars, and pitches.",
  },
  {
    who: "Intentional Minds & Families",
    need: "Replace passive scrolling with an active ritual that stretches focus, rewards curiosity, and builds a lasting personal archive of ideas you actually understand.",
  },
  {
    who: "Friends & Game Night Hosts",
    need: "Bring smart, high-energy competition to your group with head-to-head trivia challenges, fast word-description rounds, and live hot-take slide battles.",
  },
];

/** The core daily loop, in plain words. */
export const HOW_IT_WORKS: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Get a topic",
    body: "Each day Fey suggests a topic from the subjects you care about, picked from 1,000+ across AI, product, economics, history, philosophy, science, and more.",
  },
  {
    step: "02",
    title: "Research it",
    body: "Take a few focused minutes to read and write your own notes. No feed, no likes, no distractions.",
  },
  {
    step: "03",
    title: "Explain it out loud",
    body: "Record yourself explaining it simply in 90 seconds. If you can say it clearly, you understand it. That is the Feynman Technique.",
  },
  {
    step: "04",
    title: "Reflect and build the habit",
    body: "Listen back, rate your clarity, re-record if you like, and grow your streak. Your notes and recordings build a personal library of what you know.",
  },
];

export type Feature = {
  slug: string;
  name: string;
  path: string;
  description: string;
  genre: string[];
  players: string;
};

/** Core learning experiences (lead with these). */
export const CORE_FEATURES: Feature[] = [
  {
    slug: "daily-challenge",
    name: "Daily Speaking Challenge",
    path: "/discover",
    description:
      "A daily topic, a short research window, and a 90-second spoken explanation. Built on the Feynman Technique to turn passive reading into real understanding.",
    genre: ["Learning", "Public Speaking", "Daily Habit"],
    players: "1",
  },
  {
    slug: "community",
    name: "Community Salons",
    path: "/community",
    description:
      "Shareable rooms where friends, colleagues, or classmates each explain the same topic, listen to one another, and vote on the clearest explanation.",
    genre: ["Learning", "Social", "Public Speaking"],
    players: "2 or more",
  },
  {
    slug: "constellation",
    name: "Knowledge Map",
    path: "/constellation",
    description:
      "A visual map of every topic you have explained, showing how ideas connect and suggesting what to explore next.",
    genre: ["Learning", "Discovery"],
    players: "1",
  },
];

/** Add-on games: lighter ways to keep your mind sharp. */
export const GAMES: Feature[] = [
  {
    slug: "trivia",
    name: "Naija Trivia",
    path: "/games/trivia",
    description:
      "Timed quiz with 1,000+ curated questions on Nigerian history, culture, science, and general knowledge, with explanations, challenge links, and a leaderboard.",
    genre: ["Trivia", "Quiz", "Educational"],
    players: "1 or more",
  },
  {
    slug: "articulate",
    name: "Online Articulate",
    path: "/play",
    description:
      "Team word-description party game with speech recognition and an AI referee. Play pass-the-phone or online with friends.",
    genre: ["Party", "Word Game", "Multiplayer"],
    players: "4 or more in teams",
  },
  {
    slug: "podium",
    name: "The Podium",
    path: "/podium",
    description:
      "Spin a hot-take topic, jot your angle, and AI builds a 5-slide deck you present to the room. A fun way to practise thinking on your feet.",
    genre: ["Party", "Presentation", "Debate"],
    players: "2 or more",
  },
  {
    slug: "mathletics",
    name: "Mathletics",
    path: "/games/mathletics",
    description:
      "25-second rapid mental math, algebra, probability, and geometry challenges. Spot the Socratic shortcut and compete on the Titans leaderboard.",
    genre: ["Math", "Mental Calculation", "Educational", "Puzzle"],
    players: "1 or more (1v1 duels)",
  },
];

/** Everything public, in priority order. */
export const PUBLIC_GAMES = [...CORE_FEATURES, ...GAMES];

/** FAQ copy written to match how people phrase questions to search engines and AI assistants. */
export const SITE_FAQ: { q: string; a: string }[] = [
  {
    q: "What is Fey?",
    a: "Fey is a curated daily learning and speaking platform. Each day you discover a fresh topic outside your usual circle, research it for a few minutes, and explain it out loud in 90 seconds. It also includes community rooms and smart games like Naija Trivia, Online Articulate, and The Podium.",
  },
  {
    q: "How can I build a daily learning habit?",
    a: "Keep it short, focused, and active. Fey gives you one curated topic a day, a short research window, and a 90-second spoken explanation, with streaks and daily goals to keep you consistent. Explaining out loud makes the learning stick far better than passive reading or watching.",
  },
  {
    q: "How can I learn to articulate my thoughts more clearly?",
    a: "Practise explaining ideas out loud, regularly, under a little time pressure, then listen back. Fey is built around this exact habit: 90-second spoken explanations on real topics, with playback and re-recording so you can hear yourself improve.",
  },
  {
    q: "What is the Feynman Technique?",
    a: "The Feynman Technique is a learning method named after physicist Richard Feynman: if you can explain a concept simply in your own words, you truly understand it. Fey turns this into a daily practice with a research step and a timed spoken explanation.",
  },
  {
    q: "Is Fey good for teenagers, students, or new graduates?",
    a: "Yes. Fey replaces passive scrolling with short, focused sessions that build attention span, curiosity, eloquence, and speaking confidence—ideal for students and new graduates preparing for interviews, presentations, and everyday conversations.",
  },
  {
    q: "What fun intellectual games can I play on Fey?",
    a: "Alongside the daily learning and speaking challenge, Fey includes Naija Trivia (1,000+ curated questions with 1v1 challenge links), Online Articulate (a fast team word-description party game), and The Podium (an AI-assisted hot-take presentation game), all free in your browser.",
  },
  {
    q: "Is Fey free?",
    a: "Yes. Fey is free to use in any modern web browser on phone or computer. There is nothing to download.",
  },
  {
    q: "Who made Fey?",
    a: "Fey is built by Lokin Labs, a Nigerian product studio.",
  },
];
