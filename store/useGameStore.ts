import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type GameCategory, type GameDifficulty, type GameWord, buildDeck } from "@/lib/game-words";

export type GamePhase = "setup" | "handoff" | "playing" | "results" | "gameover" | "spinner";

export interface TeamRoundStats {
  playerName: string;
  team: "A" | "B";
  correctWords: string[];
  skippedWords: string[];
  totalTime: number;
  bonusPoints?: number;
  note?: string;
}

export interface BonusEvent {
  id: string;
  team: "A" | "B";
  points: number;
  label: string;
  timestamp: number;
}

export type SpinnerModifier = "none" | "double" | "extra-time";

interface GameState {
  // Config state
  timerSeconds: number;
  selectedCategories: GameCategory[];
  difficulty: GameDifficulty;
  numberOfRounds: number;
  phase: GamePhase;
  spinnerModifier: SpinnerModifier;
  gameMode: "classic" | "masterchef";
  feyVoiceEnabled: boolean;
  aiRefereeEnabled: boolean;
  
  // Players state
  playersA: string[];
  playersB: string[];
  colorA: string;
  colorB: string;
  scoreGoal: number;
  
  // Game session progress
  currentRoundIndex: number; // 0-based
  currentTurnIndex: number;  // index of player whose turn it is
  turnOrder: { name: string; team: "A" | "B" }[];
  deck: GameWord[];
  currentWordIndex: number;
  
  // Current turn variables
  activeSpeaker: string | null;
  activeTeam: "A" | "B" | null;
  correctInCurrentTurn: string[];
  skippedInCurrentTurn: string[];
  correctAInCurrentTurn: string[];
  correctBInCurrentTurn: string[];
  challengeRestriction: string | null;
  
  // Historical stats & events
  turnsHistory: TeamRoundStats[];
  bonusEvents: BonusEvent[];
  getScore: (team: "A" | "B") => number;
  
  // Actions
  setTimerSeconds: (secs: number) => void;
  toggleCategory: (cat: GameCategory) => void;
  setSelectedCategories: (cats: GameCategory[]) => void;
  setDifficulty: (diff: GameDifficulty) => void;
  setNumberOfRounds: (num: number) => void;
  setPlayers: (teamA: string[], teamB: string[]) => void;
  setColors: (colorA: string, colorB: string) => void;
  setScoreGoal: (goal: number) => void;
  setPhase: (phase: GamePhase) => void;
  setSpinnerModifier: (mod: SpinnerModifier) => void;
  setGameMode: (mode: "classic" | "masterchef") => void;
  setFeyVoiceEnabled: (enabled: boolean) => void;
  setAiRefereeEnabled: (enabled: boolean) => void;
  applyImmediateSpinnerAdvance: (team: "A" | "B", spaces: number, label: string) => void;
  awardCoachBonus: (team: "A" | "B", points: number, reason: string) => void;
  
  startGame: () => void;
  startTurn: () => void;
  recordCorrect: () => void;
  recordCorrectForTeam: (team: "A" | "B") => void;
  recordSkip: () => void;
  endTurn: (elapsedSeconds: number) => void;
  resetGame: () => void;
}

const DEFAULT_CATEGORIES: GameCategory[] = ["Object", "Nature", "Person", "Action", "World", "Random"];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      timerSeconds: 30,
      selectedCategories: DEFAULT_CATEGORIES,
      difficulty: "mixed",
      numberOfRounds: 3,
      phase: "setup",
      spinnerModifier: "none",
      gameMode: "classic",
      feyVoiceEnabled: false,
      aiRefereeEnabled: false,
      
      playersA: ["Player A1"],
      playersB: ["Player B1"],
      colorA: "#EF4444", // default red
      colorB: "#3B82F6", // default blue
      scoreGoal: 30,    // default 30
      
      currentRoundIndex: 0,
      currentTurnIndex: 0,
      turnOrder: [],
      deck: [],
      currentWordIndex: 0,
      
      activeSpeaker: null,
      activeTeam: null,
      correctInCurrentTurn: [],
      skippedInCurrentTurn: [],
      correctAInCurrentTurn: [],
      correctBInCurrentTurn: [],
      challengeRestriction: null,
      turnsHistory: [],
      bonusEvents: [],

      getScore: (team) => {
        const { turnsHistory, bonusEvents } = get();
        const turnsScore = (turnsHistory || [])
          .filter((t) => t.team === team)
          .reduce((acc, t) => acc + t.correctWords.length + (t.bonusPoints || 0), 0);
        const eventsScore = (bonusEvents || [])
          .filter((e) => e.team === team)
          .reduce((acc, e) => acc + e.points, 0);
        return Math.max(0, turnsScore + eventsScore);
      },

      setTimerSeconds: (secs) => set({ timerSeconds: secs }),
      
      toggleCategory: (cat) => set((state) => {
        const isSelected = state.selectedCategories.includes(cat);
        const updated = isSelected 
          ? state.selectedCategories.filter(c => c !== cat)
          : [...state.selectedCategories, cat];
        // Keep at least one category enabled
        return { selectedCategories: updated.length > 0 ? updated : state.selectedCategories };
      }),
      
      setSelectedCategories: (cats) => set({ selectedCategories: cats }),
      setDifficulty: (diff) => set({ difficulty: diff }),
      setNumberOfRounds: (num) => set({ numberOfRounds: num }),
      
      setPlayers: (teamA, teamB) => set({
        playersA: teamA.filter(p => p.trim() !== ""),
        playersB: teamB.filter(p => p.trim() !== "")
      }),
      setColors: (colorA, colorB) => set({ colorA, colorB }),
      setScoreGoal: (goal) => set({ scoreGoal: goal }),
      setPhase: (phase) => set({ phase }),
      setSpinnerModifier: (mod) => set({ spinnerModifier: mod }),
      setGameMode: (mode) => set({ gameMode: mode }),
      setFeyVoiceEnabled: (enabled) => set({ feyVoiceEnabled: enabled }),
      setAiRefereeEnabled: (enabled) => set({ aiRefereeEnabled: enabled }),

      applyImmediateSpinnerAdvance: (team, spaces, label) => set((state) => {
        const newEvent: BonusEvent = {
          id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          team,
          points: spaces,
          label,
          timestamp: Date.now(),
        };
        return { bonusEvents: [...(state.bonusEvents || []), newEvent] };
      }),

      awardCoachBonus: (team, points, reason) => set((state) => {
        const newEvent: BonusEvent = {
          id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          team,
          points,
          label: reason,
          timestamp: Date.now(),
        };
        return { bonusEvents: [...(state.bonusEvents || []), newEvent] };
      }),

      startGame: () => {
        const { playersA, playersB, selectedCategories, difficulty } = get();
        
        const pA = playersA.length > 0 ? playersA : ["Player A1"];
        const pB = playersB.length > 0 ? playersB : ["Player B1"];

        // Generate fair alternating turn order so both teams receive equal turns per round
        const order: { name: string; team: "A" | "B" }[] = [];
        const maxPlayers = Math.max(pA.length, pB.length);
        for (let i = 0; i < maxPlayers; i++) {
          order.push({ name: pA[i % pA.length], team: "A" });
          order.push({ name: pB[i % pB.length], team: "B" });
        }
        
        // Build the card deck
        const deck = buildDeck(selectedCategories, difficulty, 150);
        
        set({
          turnOrder: order,
          deck,
          currentWordIndex: 0,
          currentRoundIndex: 0,
          currentTurnIndex: 0,
          turnsHistory: [],
          bonusEvents: [],
          activeSpeaker: null,
          activeTeam: null,
          phase: "handoff",
          spinnerModifier: "none"
        });
      },

      startTurn: () => {
        const { turnOrder, currentTurnIndex, turnsHistory, scoreGoal, difficulty, getScore } = get();
        const speaker = turnOrder[currentTurnIndex];
        if (!speaker) return;

        // Calculate current score for this speaker's team
        const teamScore = getScore(speaker.team);

        // Determine category by space (cycle Object -> Nature -> Person -> Action -> World -> Random)
        const tileIdx = Math.min(scoreGoal - 1, teamScore);
        const categoriesCycle: GameCategory[] = ["Object", "Nature", "Person", "Action", "World", "Random"];
        
        let targetCategory: GameCategory = "Random";
        if (tileIdx > 0 && tileIdx < scoreGoal - 1) {
          targetCategory = categoriesCycle[tileIdx % 6];
        }

        // Gather all previously used words (correct + skipped) in this session to exclude them
        const usedWords = turnsHistory.reduce((acc, t) => {
          return [...acc, ...t.correctWords, ...t.skippedWords];
        }, [] as string[]);

        // Build a targeted 50-word deck for this turn
        const turnCategories = targetCategory === "Random" 
          ? DEFAULT_CATEGORIES 
          : [targetCategory];

        const turnDeck = buildDeck(turnCategories, difficulty, 50, usedWords);

        // Calculate Special Spaces modifiers based on the speaker's team score
        const isDoubleTile = teamScore > 0 && teamScore < scoreGoal - 1 && teamScore % 7 === 2;
        const isChallengeTile = teamScore > 0 && teamScore < scoreGoal - 1 && teamScore % 7 === 5;

        let targetRestriction: string | null = null;
        if (isChallengeTile) {
          const challenges = [
            "One-Word Clues Only (e.g. no sentences/descriptions)",
            "No Nouns Allowed (use verbs and adjectives only)",
            "Rhyme Time (all clues must rhyme with the word or each other)",
            "No Gestures (keep hands completely still)",
            "Alliteration (all description words must start with the same letter)"
          ];
          targetRestriction = challenges[Math.floor(Math.random() * challenges.length)];
        }
        
        set({
          activeSpeaker: speaker.name,
          activeTeam: speaker.team,
          correctInCurrentTurn: [],
          skippedInCurrentTurn: [],
          correctAInCurrentTurn: [],
          correctBInCurrentTurn: [],
          deck: turnDeck,
          currentWordIndex: 0,
          phase: "handoff",
          spinnerModifier: isDoubleTile ? "double" : "none",
          challengeRestriction: targetRestriction
        });
      },

      recordCorrect: () => {
        const { deck, currentWordIndex, correctInCurrentTurn } = get();
        const currentWord = deck[currentWordIndex];
        if (!currentWord) return;
        
        set({
          correctInCurrentTurn: [...correctInCurrentTurn, currentWord.word],
          currentWordIndex: currentWordIndex + 1
        });
      },

      recordCorrectForTeam: (team) => {
        const { deck, currentWordIndex, correctAInCurrentTurn, correctBInCurrentTurn, correctInCurrentTurn } = get();
        const currentWord = deck[currentWordIndex];
        if (!currentWord) return;

        if (team === "A") {
          set({
            correctAInCurrentTurn: [...correctAInCurrentTurn, currentWord.word],
            correctInCurrentTurn: [...correctInCurrentTurn, currentWord.word],
            currentWordIndex: currentWordIndex + 1
          });
        } else {
          set({
            correctBInCurrentTurn: [...correctBInCurrentTurn, currentWord.word],
            correctInCurrentTurn: [...correctInCurrentTurn, currentWord.word],
            currentWordIndex: currentWordIndex + 1
          });
        }
      },

      recordSkip: () => {
        const { deck, currentWordIndex, skippedInCurrentTurn } = get();
        const currentWord = deck[currentWordIndex];
        if (!currentWord) return;
        
        set({
          skippedInCurrentTurn: [...skippedInCurrentTurn, currentWord.word],
          currentWordIndex: currentWordIndex + 1
        });
      },

      endTurn: (elapsedSeconds) => {
        const { 
          activeSpeaker, activeTeam, correctInCurrentTurn, skippedInCurrentTurn,
          correctAInCurrentTurn, correctBInCurrentTurn, gameMode,
          turnsHistory, currentTurnIndex, turnOrder, currentRoundIndex, spinnerModifier,
          scoreGoal
        } = get();
        
        if (!activeSpeaker || !activeTeam) return;

        const doubleActive = spinnerModifier === "double";
        const nextTurnIndex = currentTurnIndex + 1;
        let nextRoundIndex = currentRoundIndex;
        
        // If we've completed all turns in the rotation list, we complete the round
        const isRoundOver = nextTurnIndex >= turnOrder.length;
        if (isRoundOver) {
          nextRoundIndex += 1;
        }

        if (gameMode === "masterchef") {
          // In Masterchef, record points to both Team A and Team B based on who won them
          const doubleBonusA = (doubleActive && activeTeam === "A") ? correctAInCurrentTurn.length : 0;
          const doubleBonusB = (doubleActive && activeTeam === "B") ? correctBInCurrentTurn.length : 0;

          const prevScoreA = get().getScore("A");
          const prevScoreB = get().getScore("B");

          const tentativeA = prevScoreA + correctAInCurrentTurn.length + doubleBonusA;
          const tentativeB = prevScoreB + correctBInCurrentTurn.length + doubleBonusB;

          const landedBonusA = tentativeA > 0 && tentativeA < scoreGoal - 1 && tentativeA % 7 === 0;
          const landedBonusB = tentativeB > 0 && tentativeB < scoreGoal - 1 && tentativeB % 7 === 0;

          const notesA: string[] = [];
          if (doubleActive && activeTeam === "A") notesA.push("Double Points Mod!");
          if (landedBonusA) notesA.push("Landed on Bonus Space (+1)!");

          const notesB: string[] = [];
          if (doubleActive && activeTeam === "B") notesB.push("Double Points Mod!");
          if (landedBonusB) notesB.push("Landed on Bonus Space (+1)!");

          const statsA: TeamRoundStats = {
            playerName: activeSpeaker,
            team: "A",
            correctWords: correctAInCurrentTurn,
            skippedWords: activeTeam === "A" ? skippedInCurrentTurn : [],
            totalTime: activeTeam === "A" ? elapsedSeconds : 0,
            bonusPoints: doubleBonusA + (landedBonusA ? 1 : 0),
            note: notesA.length > 0 ? notesA.join(" · ") : undefined
          };

          const statsB: TeamRoundStats = {
            playerName: activeSpeaker,
            team: "B",
            correctWords: correctBInCurrentTurn,
            skippedWords: activeTeam === "B" ? skippedInCurrentTurn : [],
            totalTime: activeTeam === "B" ? elapsedSeconds : 0,
            bonusPoints: doubleBonusB + (landedBonusB ? 1 : 0),
            note: notesB.length > 0 ? notesB.join(" · ") : undefined
          };

          set({
            turnsHistory: [...turnsHistory, statsA, statsB],
            currentTurnIndex: isRoundOver ? 0 : nextTurnIndex,
            currentRoundIndex: nextRoundIndex,
            activeSpeaker: null,
            activeTeam: null,
            phase: "results",
            spinnerModifier: "none"
          });
        } else {
          // Classic mode: all points go to the active team
          const doubleBonus = doubleActive ? correctInCurrentTurn.length : 0;
          const prevScore = get().getScore(activeTeam);
          const tentativeScore = prevScore + correctInCurrentTurn.length + doubleBonus;
          const landedOnBonus = tentativeScore > 0 && tentativeScore < scoreGoal - 1 && tentativeScore % 7 === 0;

          const notes: string[] = [];
          if (doubleActive) notes.push("Double Points Mod!");
          if (landedOnBonus) notes.push("Landed on Bonus Space (+1)!");

          const stats: TeamRoundStats = {
            playerName: activeSpeaker,
            team: activeTeam,
            correctWords: correctInCurrentTurn,
            skippedWords: skippedInCurrentTurn,
            totalTime: elapsedSeconds,
            bonusPoints: doubleBonus + (landedOnBonus ? 1 : 0),
            note: notes.length > 0 ? notes.join(" · ") : undefined
          };

          set({
            turnsHistory: [...turnsHistory, stats],
            currentTurnIndex: isRoundOver ? 0 : nextTurnIndex,
            currentRoundIndex: nextRoundIndex,
            activeSpeaker: null,
            activeTeam: null,
            phase: "results",
            spinnerModifier: "none"
          });
        }
      },

      resetGame: () => set({
        currentRoundIndex: 0,
        currentTurnIndex: 0,
        turnOrder: [],
        deck: [],
        currentWordIndex: 0,
        activeSpeaker: null,
        activeTeam: null,
        correctInCurrentTurn: [],
        skippedInCurrentTurn: [],
        correctAInCurrentTurn: [],
        correctBInCurrentTurn: [],
        challengeRestriction: null,
        turnsHistory: [],
        bonusEvents: [],
        phase: "setup",
        spinnerModifier: "none"
      })
    }),
    { name: "fey-multiplayer-game" }
  )
);
