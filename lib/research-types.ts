export interface ResearchSource {
  id: string; // "S1", "S2"...
  title: string;
  url: string;
  publisher: string; // Wikipedia, Europe PMC, OpenAlex
  authors?: string;
  year?: string;
  doi?: string;
}

export interface ResearchSection {
  heading: string;
  body: string; // paragraphs separated by \n\n, inline citations like [S1]
}

export interface ResearchPack {
  topicId: string;
  gist: string;
  summary: string;
  sections: ResearchSection[];
  sources: ResearchSource[];
  generatedAt: number;
  degraded?: boolean; // excerpts only, AI summary unavailable
}

export interface Cue {
  id: string;
  text: string;
  addToNotes: boolean;
}

export const MAX_CUE_WORDS_TOTAL = 500;
export const countWords = (t: string) => t.split(/\s+/).filter(Boolean).length;

const CACHE_PREFIX = "fey-research-v2:";

export function getCachedResearch(topicId: string): ResearchPack | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + topicId);
    return raw ? (JSON.parse(raw) as ResearchPack) : null;
  } catch {
    return null;
  }
}

export function cacheResearch(pack: ResearchPack) {
  try {
    window.localStorage.setItem(CACHE_PREFIX + pack.topicId, JSON.stringify(pack));
  } catch {
    /* storage full: skip caching */
  }
}
