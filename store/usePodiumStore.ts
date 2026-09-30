import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type PodiumTopic, type PodiumDeck, type SlideStyle } from "@/lib/podium-types";
import { getRandomTopic } from "@/lib/podium-topics";
import { encodePodiumDeck } from "@/lib/podium-share";

export type PodiumPhase =
  | "lobby"
  | "topic"
  | "notes"
  | "generating"
  | "preview"
  | "present"
  | "share";

interface PodiumState {
  // ── Phase ─────────────────────────────────────────────────────────
  phase: PodiumPhase;

  // ── Topic ─────────────────────────────────────────────────────────
  currentTopic: PodiumTopic | null;
  customTopic: string;
  customSubtitle: string;
  isUsingCustomTopic: boolean;
  recentTopicIds: string[]; // For de-duplication

  // ── Notes ─────────────────────────────────────────────────────────
  notes: string;
  notesTimeLimit: number; // seconds (0 = no limit)

  // ── Slide Style ───────────────────────────────────────────────────
  slideStyle: SlideStyle;

  // ── Generated Deck ────────────────────────────────────────────────
  generatedDeck: PodiumDeck | null;
  isGenerating: boolean;
  generationError: string | null;

  // ── Presentation ──────────────────────────────────────────────────
  currentSlideIndex: number;

  // ── Share ─────────────────────────────────────────────────────────
  shareCode: string | null;

  // ── Saved Decks (Library) ─────────────────────────────────────────
  savedDecks: PodiumDeck[];

  // ── Actions ───────────────────────────────────────────────────────
  setPhase: (phase: PodiumPhase) => void;
  spinLocalTopic: () => void;
  setCurrentTopic: (topic: PodiumTopic) => void;
  setCustomTopic: (text: string, subtitle?: string) => void;
  confirmCustomTopic: () => void;
  setNotes: (notes: string) => void;
  setNotesTimeLimit: (seconds: number) => void;
  setSlideStyle: (style: SlideStyle) => void;
  setGeneratedDeck: (deck: PodiumDeck | null) => void;
  setIsGenerating: (val: boolean) => void;
  setGenerationError: (err: string | null) => void;
  updateSlide: (index: number, updates: Partial<import("@/lib/podium-types").PodiumSlide>) => void;
  applyThemeToDeck: (theme: { bgColor: string; textColor: string; accentColor: string }) => void;
  applyThemeToSlide: (index: number, theme: { bgColor: string; textColor: string; accentColor: string }) => void;
  setCurrentSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  generateShareCode: () => string;
  saveDeck: (deck: PodiumDeck) => void;
  deleteSavedDeck: (id: string) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  phase: "lobby" as PodiumPhase,
  currentTopic: null,
  customTopic: "",
  customSubtitle: "",
  isUsingCustomTopic: false,
  recentTopicIds: [] as string[],
  notes: "",
  notesTimeLimit: 120, // 2 minutes default
  slideStyle: "bold" as SlideStyle,
  generatedDeck: null,
  isGenerating: false,
  generationError: null,
  currentSlideIndex: 0,
  shareCode: null,
  savedDecks: [] as PodiumDeck[],
};

export const usePodiumStore = create<PodiumState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setPhase: (phase) => set({ phase }),

      spinLocalTopic: () => {
        const recent = get().recentTopicIds;
        const topic = getRandomTopic(recent.length > 50 ? [] : recent);
        const newRecent = [...recent, topic.id].slice(-60);
        set({ currentTopic: topic, isUsingCustomTopic: false, recentTopicIds: newRecent });
      },

      setCurrentTopic: (topic) => set({ currentTopic: topic, isUsingCustomTopic: false }),

      setCustomTopic: (text, subtitle = "") =>
        set({ customTopic: text, customSubtitle: subtitle }),

      confirmCustomTopic: () => {
        const { customTopic, customSubtitle } = get();
        if (!customTopic.trim()) return;
        const customAsTopic: PodiumTopic = {
          id: `custom-${Date.now()}`,
          text: customTopic.trim(),
          subtitle: customSubtitle.trim() || "A Personal Thesis",
          category: "Custom",
          vibe: "🎤 Custom",
          seedBullets: [],
        };
        set({ currentTopic: customAsTopic, isUsingCustomTopic: true });
      },

      setNotes: (notes) => set({ notes }),
      setNotesTimeLimit: (seconds) => set({ notesTimeLimit: seconds }),
      setSlideStyle: (style) => set({ slideStyle: style }),
      setGeneratedDeck: (deck) => set({ generatedDeck: deck }),
      setIsGenerating: (val) => set({ isGenerating: val }),
      setGenerationError: (err) => set({ generationError: err }),

      updateSlide: (index, updates) => {
        const deck = get().generatedDeck;
        if (!deck) return;
        const newSlides = deck.slides.map((slide, i) =>
          i === index ? { ...slide, ...updates } : slide
        );
        const newDeck = { ...deck, slides: newSlides };
        // Also update in savedDecks if already saved
        const savedDecks = get().savedDecks.map((d) =>
          d.id === deck.id ? newDeck : d
        );
        set({ generatedDeck: newDeck, savedDecks });
      },

      applyThemeToDeck: (theme) => {
        const deck = get().generatedDeck;
        if (!deck) return;
        const newSlides = deck.slides.map((slide) => ({
          ...slide,
          bgColor: theme.bgColor,
          textColor: theme.textColor,
          accentColor: theme.accentColor,
        }));
        const newDeck = { ...deck, slides: newSlides };
        const savedDecks = get().savedDecks.map((d) =>
          d.id === deck.id ? newDeck : d
        );
        set({ generatedDeck: newDeck, savedDecks });
      },

      applyThemeToSlide: (index, theme) => {
        get().updateSlide(index, {
          bgColor: theme.bgColor,
          textColor: theme.textColor,
          accentColor: theme.accentColor,
        });
      },

      setCurrentSlide: (index) => {
        const deck = get().generatedDeck;
        if (!deck) return;
        const clamped = Math.max(0, Math.min(index, deck.slides.length - 1));
        set({ currentSlideIndex: clamped });
      },

      nextSlide: () => {
        const { currentSlideIndex, generatedDeck } = get();
        if (!generatedDeck) return;
        const next = Math.min(currentSlideIndex + 1, generatedDeck.slides.length - 1);
        set({ currentSlideIndex: next });
      },

      prevSlide: () => {
        const { currentSlideIndex } = get();
        set({ currentSlideIndex: Math.max(0, currentSlideIndex - 1) });
      },

      generateShareCode: () => {
        const deck = get().generatedDeck;
        if (!deck) return "";
        const code = encodePodiumDeck(deck);
        set({ shareCode: code });
        return code;
      },

      saveDeck: (deck) => {
        const existing = get().savedDecks;
        const alreadySaved = existing.some((d) => d.id === deck.id);
        if (!alreadySaved) {
          set({ savedDecks: [deck, ...existing].slice(0, 50) });
        }
      },

      deleteSavedDeck: (id) => {
        set({ savedDecks: get().savedDecks.filter((d) => d.id !== id) });
      },

      reset: () =>
        set({
          phase: "lobby",
          currentTopic: null,
          customTopic: "",
          customSubtitle: "",
          isUsingCustomTopic: false,
          notes: "",
          generatedDeck: null,
          isGenerating: false,
          generationError: null,
          currentSlideIndex: 0,
          shareCode: null,
        }),
    }),
    {
      name: "fey-podium-store",
      partialize: (state) => ({
        savedDecks: state.savedDecks,
        slideStyle: state.slideStyle,
        notesTimeLimit: state.notesTimeLimit,
        recentTopicIds: state.recentTopicIds,
      }),
    }
  )
);
