import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type PodiumTopic, type PodiumDeck, type SlideStyle, type SlideLayout, type PodiumSlide } from "@/lib/podium-types";
import { getRandomTopic } from "@/lib/podium-topics";
import { encodePodiumDeck } from "@/lib/podium-share";
import { PODIUM_THEMES } from "@/lib/podium-themes";
import { triggerCelestialAscension } from "@/lib/celestial-events";

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
  createManualDeck: (authorName?: string) => PodiumDeck;
  addSlide: (layout?: SlideLayout, insertAfterIndex?: number) => void;
  deleteSlide: (index: number) => void;
  moveSlide: (fromIndex: number, toIndex: number) => void;
  changeSlideLayout: (index: number, newLayout: SlideLayout) => void;
  updateSlide: (index: number, updates: Partial<PodiumSlide>) => void;
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

      createManualDeck: (authorName = "Scholar") => {
        const { currentTopic, notes, slideStyle } = get();
        const topicText = currentTopic?.text?.trim() || "Untitled Hot Take";
        const subtitleText = currentTopic?.subtitle?.trim() || "A Personal Thesis";
        const category = currentTopic?.category || "Culture";

        // Pick a curated theme
        const palette = PODIUM_THEMES[Math.floor(Math.random() * PODIUM_THEMES.length)];

        // Parse user notes into usable points
        const rawLines = notes
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        const cleanBullets = rawLines
          .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
          .filter(Boolean);

        const hasUserNotes = cleanBullets.length > 0;

        // Slide 1: Cover (Topic & Subtitle)
        const slide1: PodiumSlide = {
          layout: "title-only",
          title: topicText,
          subtitle: subtitleText,
          bgColor: palette.bgColor,
          textColor: palette.textColor,
          accentColor: palette.accentColor,
        };

        let slide2: PodiumSlide;
        let slide3: PodiumSlide;
        let slide4: PodiumSlide;
        let slide5: PodiumSlide;

        if (hasUserNotes) {
          // Presenter provided notes — structure their points directly
          slide2 = {
            layout: "title-bullets",
            title: "The Core Premise",
            bullets: cleanBullets.slice(0, 3),
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };

          slide3 = {
            layout: "title-body",
            title: "Supporting Reality",
            body: cleanBullets.length > 3
              ? cleanBullets.slice(3, 6).join(". ")
              : rawLines.length > 0
              ? rawLines.slice(0, 3).join(" ")
              : "Key supporting argument.",
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };

          slide4 = {
            layout: "quote",
            title: "A Provocative Truth",
            quote: cleanBullets.length > 1
              ? cleanBullets[cleanBullets.length - 1]
              : topicText,
            attribution: `— ${authorName}, with conviction`,
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };

          slide5 = {
            layout: "closing",
            title: "The Final Verdict",
            subtitle: "Think deeper. Disagree if you dare.",
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };
        } else {
          // Option 1: Clean starter skeleton without pre-filled assumptions
          slide2 = {
            layout: "title-bullets",
            title: "Key Point",
            bullets: ["First observation or takeaway", "Supporting evidence or example"],
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };

          slide3 = {
            layout: "title-body",
            title: "Supporting Argument",
            body: "Add your context, personal experience, or argument breakdown here.",
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };

          slide4 = {
            layout: "quote",
            title: "The Punchline",
            quote: "Add a memorable hot-take or bold quote here.",
            attribution: `— ${authorName}`,
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };

          slide5 = {
            layout: "closing",
            title: "In Conclusion",
            subtitle: "Final takeaway or question for the room.",
            bgColor: palette.bgColor,
            textColor: palette.textColor,
            accentColor: palette.accentColor,
          };
        }

        const deck: PodiumDeck = {
          id: `deck-${Date.now()}`,
          topic: topicText,
          subtitle: subtitleText,
          author: authorName,
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          slides: [slide1, slide2, slide3, slide4, slide5],
          category,
          style: slideStyle,
        };

        set({
          generatedDeck: deck,
          phase: "preview",
          currentSlideIndex: 0,
          generationError: null,
          isGenerating: false,
        });

        get().saveDeck(deck);
        return deck;
      },

      addSlide: (layout: SlideLayout = "title-body", insertAfterIndex?: number) => {
        const deck = get().generatedDeck;
        if (!deck) return;

        const basePalette = deck.slides[0] || PODIUM_THEMES[0];
        const newSlide: PodiumSlide = {
          layout,
          title: layout === "closing" ? "In Conclusion" : layout === "quote" ? "A Memorable Thought" : "New Slide",
          subtitle: layout === "title-only" || layout === "closing" ? "Subtitle or supporting point" : undefined,
          body: layout === "title-body" ? "Add your supporting explanation, anecdote, or thesis argument here." : undefined,
          bullets: layout === "title-bullets" ? ["First major takeaway", "Second supporting observation"] : undefined,
          quote: layout === "quote" ? "Insert a punchy quote or spicy hot-take here." : undefined,
          attribution: layout === "quote" ? `— ${deck.author}` : undefined,
          bgColor: basePalette.bgColor,
          textColor: basePalette.textColor,
          accentColor: basePalette.accentColor,
        };

        const targetIndex = typeof insertAfterIndex === "number" && insertAfterIndex >= 0 && insertAfterIndex < deck.slides.length
          ? insertAfterIndex + 1
          : deck.slides.length;

        const newSlides = [...deck.slides];
        newSlides.splice(targetIndex, 0, newSlide);

        const newDeck = { ...deck, slides: newSlides };
        const savedDecks = get().savedDecks.map((d) => (d.id === deck.id ? newDeck : d));
        set({
          generatedDeck: newDeck,
          savedDecks,
          currentSlideIndex: targetIndex,
        });
      },

      deleteSlide: (index: number) => {
        const deck = get().generatedDeck;
        if (!deck || deck.slides.length <= 1) return; // Keep at least 1 slide

        const newSlides = deck.slides.filter((_, i) => i !== index);
        const newDeck = { ...deck, slides: newSlides };
        const savedDecks = get().savedDecks.map((d) => (d.id === deck.id ? newDeck : d));
        const newCurrentIndex = Math.max(0, Math.min(get().currentSlideIndex, newSlides.length - 1));
        set({
          generatedDeck: newDeck,
          savedDecks,
          currentSlideIndex: newCurrentIndex,
        });
      },

      moveSlide: (fromIndex: number, toIndex: number) => {
        const deck = get().generatedDeck;
        if (!deck) return;
        if (fromIndex < 0 || fromIndex >= deck.slides.length || toIndex < 0 || toIndex >= deck.slides.length) return;

        const newSlides = [...deck.slides];
        const [moved] = newSlides.splice(fromIndex, 1);
        newSlides.splice(toIndex, 0, moved);

        const newDeck = { ...deck, slides: newSlides };
        const savedDecks = get().savedDecks.map((d) => (d.id === deck.id ? newDeck : d));
        set({
          generatedDeck: newDeck,
          savedDecks,
          currentSlideIndex: toIndex,
        });
      },

      changeSlideLayout: (index: number, newLayout: SlideLayout) => {
        const deck = get().generatedDeck;
        if (!deck || !deck.slides[index]) return;

        const slide = deck.slides[index];
        if (slide.layout === newLayout) return;

        const updates: Partial<PodiumSlide> = { layout: newLayout };

        if (newLayout === "title-bullets") {
          if (!slide.bullets || slide.bullets.length === 0) {
            updates.bullets = slide.body ? [slide.body] : ["Key point 1", "Key point 2"];
          }
        } else if (newLayout === "title-body") {
          if (!slide.body) {
            updates.body = slide.bullets && slide.bullets.length > 0 ? slide.bullets.join(". ") : slide.quote || "Enter your body text here.";
          }
        } else if (newLayout === "quote") {
          if (!slide.quote) {
            updates.quote = slide.body || (slide.bullets && slide.bullets[0]) || slide.title;
            updates.attribution = slide.attribution || `— ${deck.author}`;
          }
        } else if (newLayout === "title-only" || newLayout === "closing") {
          if (!slide.subtitle) {
            updates.subtitle = slide.body ? slide.body.slice(0, 60) : "A Presentation Point";
          }
        }

        get().updateSlide(index, updates);
      },

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
          triggerCelestialAscension({
            kind: "sun",
            orbitLabel: "SOLAR ORBIT · PODIUM DECK",
            headline: "New Sun Ignited in Your Constellation",
            activityTitle: deck.topic,
            badgeText: deck.category || "Podium",
            rewardText: `${deck.slides.length} Slides`,
            category: deck.category || "Culture",
          });
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
