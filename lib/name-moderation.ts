/**
 * Name Moderation & Sanitization Helper
 * Filters racial slurs, hate speech, and profanities to ensure the Fey scholar leaderboard
 * remains dignified, safe, and intellectually vibrant.
 */

const BLOCKED_PATTERNS = [
  /n+i+[g9]+[e3]+r+/i,
  /n+i+[g9]+a+/i,
  /f+a+g+[o0]+t+/i,
  /f+a+g+s?/i,
  /k+i+k+e+/i,
  /c+h+i+n+k+/i,
  /r+e+t+a+r+d+/i,
  /c+u+n+t+/i,
  /w+h+o+r+e+/i,
  /s+l+u+t+/i,
  /p+e+n+i+s+/i,
  /d+i+c+k+h+e+a+d+/i,
  /b+i+t+c+h+/i,
  /h+i+t+l+e+r+/i,
  /n+a+z+i+/i,
];

/**
 * Checks whether a given username contains blocked hate speech or severe slurs.
 */
export function isBlockedHateSpeech(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const clean = name.toLowerCase().replace(/[\s\-_._*#@!0-9]+/g, "");
  const normalized = name.toLowerCase();
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(clean) || pattern.test(normalized));
}

/**
 * Sanitizes a username, converting offensive terms into a dignified scholar pseudonym.
 */
export function sanitizeScholarName(name: string): string {
  if (!name || typeof name !== "string") return "Scholar";
  const trimmed = name.trim();
  if (isBlockedHateSpeech(trimmed)) {
    // Generate deterministic dignified scholar pseudonym from string hash
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = (hash << 5) - hash + trimmed.charCodeAt(i);
      hash |= 0;
    }
    const suffix = Math.abs(hash % 900) + 100;
    return `Scholar ${suffix}`;
  }
  return trimmed;
}
