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

export interface ResearchQuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0..3
  explanation: string; // 1-sentence explanation grounded in the reading pack
}

export interface ResearchPack {
  topicId: string;
  gist: string;
  summary: string;
  sections: ResearchSection[];
  sources: ResearchSource[];
  quiz?: ResearchQuizQuestion[];
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

const CACHE_PREFIX = "fey-research-v8:";
// In-memory store so even degraded/un-persisted packs stay available across session stages
const memoryCache = new Map<string, ResearchPack>();

export function clearMemoryResearch(topicId: string) {
  memoryCache.delete(topicId);
}

export function getCachedResearch(topicId: string): ResearchPack | null {
  const inMem = memoryCache.get(topicId);
  if (inMem) return inMem;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + topicId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResearchPack;
    memoryCache.set(topicId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function setMemoryResearch(pack: ResearchPack) {
  memoryCache.set(pack.topicId, pack);
}

export function cacheResearch(pack: ResearchPack) {
  memoryCache.set(pack.topicId, pack);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + pack.topicId, JSON.stringify(pack));
  } catch {
    /* storage full: skip caching */
  }
}
