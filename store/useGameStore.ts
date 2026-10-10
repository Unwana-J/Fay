import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type GameCategory, type GameDifficulty, type GameWord, buildDeck } from "@/lib/game-words";
import { type BuzzerSoundType } from "@/lib/articulate-room";

export type GamePhase = "setup" | "handoff" | "playing" | "results" | "gameover" | "spinner";

export type TeamId = "A" | "B" | "C" | "D";

export interface TeamRoundStats {
  playerName: string;
  team: TeamId;
  correctWords: string[];
  skippedWords: string[];
  disputedWords?: string[]; // Scored words that were disputed/voided (-1 pt)
  awardedWords?: string[];  // Skipped words that were claimed/awarded (+1 pt)
  totalTime: number;
  bonusPoints?: number;
  note?: string;
}

export interface BonusEvent {
  id: string;
  team: TeamId;
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
  gameTitle: string;
  isGamePaused: boolean;
  savedPhase: GamePhase | null;
  
  // Teams & Players state (Supports up to 4 teams)
  teamCount: number; // 2, 3, or 4
  playersA: string[];
  playersB: string[];
  playersC: string[];
  playersD: string[];
  teamNameA: string;
  teamNameB: string;
  teamNameC: string;
  teamNameD: string;
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
  scoreGoal: number;
  buzzerSound: BuzzerSoundType;
  
  // Game session progress
  currentRoundIndex: number; // 0-based
  currentTurnIndex: number;  // index of player whose turn it is
  turnOrder: { name: string; team: TeamId }[];
  deck: GameWord[];
  currentWordIndex: number;
  
  // Current turn variables
  activeSpeaker: string | null;
  activeTeam: TeamId | null;
  correctInCurrentTurn: string[];
  skippedInCurrentTurn: string[];
  correctAInCurrentTurn: string[];
  correctBInCurrentTurn: string[];
  correctCInCurrentTurn: string[];
  correctDInCurrentTurn: string[];
  challengeRestriction: string | null;
  
  // Historical stats & events
  turnsHistory: TeamRoundStats[];
  bonusEvents: BonusEvent[];
  getScore: (team: TeamId) => number;
  getTeamName: (team: TeamId) => string;
  getTeamColor: (team: TeamId) => string;
  getActiveTeams: () => { id: TeamId; name: string; color: string; players: string[] }[];
  
  // Actions
  setTimerSeconds: (secs: number) => void;
  toggleCategory: (cat: GameCategory) => void;
  setSelectedCategories: (cats: GameCategory[]) => void;
  setDifficulty: (diff: GameDifficulty) => void;
  setNumberOfRounds: (num: number) => void;
  setTeamCount: (count: number) => void;
  setPlayers: (teamA: string[], teamB: string[], teamC?: string[], teamD?: string[]) => void;
  setTeamNames: (nameA: string, nameB: string, nameC?: string, nameD?: string) => void;
  setGameTitle: (title: string) => void;
  shufflePlayers: () => void;
  setColors: (colorA: string, colorB: string, colorC?: string, colorD?: string) => void;
  setScoreGoal: (goal: number) => void;
  setBuzzerSound: (sound: BuzzerSoundType) => void;
  setPhase: (phase: GamePhase) => void;
  setSpinnerModifier: (mod: SpinnerModifier) => void;
  setGameMode: (mode: "classic" | "masterchef") => void;
  setFeyVoiceEnabled: (enabled: boolean) => void;
  setAiRefereeEnabled: (enabled: boolean) => void;
  applyImmediateSpinnerAdvance: (team: TeamId, spaces: number, label: string) => void;
  awardCoachBonus: (team: TeamId, points: number, reason: string) => void;
  toggleDisputeWordInLastTurn: (word: string) => void;
  toggleAwardPassedWordInLastTurn: (word: string) => void;
  
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  discardSavedGame: () => void;
  startTurn: () => void;
  recordCorrect: () => void;
  recordCorrectForTeam: (team: TeamId) => void;
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
      gameTitle: "Fey Game Night",
      isGamePaused: false,
      savedPhase: null,
      
      teamCount: 2,
      playersA: ["Player A1"],
      playersB: ["Player B1"],
      playersC: ["Player C1"],
      playersD: ["Player D1"],
      teamNameA: "Team Alpha",
      teamNameB: "Team Omega",
      teamNameC: "Team Delta",
      teamNameD: "Team Sigma",
      colorA: "#EF4444", // default red
      colorB: "#3B82F6", // default blue
      colorC: "#10B981", // default emerald green
      colorD: "#F59E0B", // default gold/amber
      scoreGoal: 30,    // default 30
      buzzerSound: "classic",
      
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
      correctCInCurrentTurn: [],
      correctDInCurrentTurn: [],
      challengeRestriction: null,
      turnsHistory: [],
      bonusEvents: [],

      getScore: (team) => {
        const { turnsHistory, bonusEvents } = get();
        const turnsScore = (turnsHistory || [])
          .filter((t) => t.team === team)
          .reduce((acc, t) => {
            const netWords = Math.max(
              0,
              t.correctWords.length - (t.disputedWords?.length || 0) + (t.awardedWords?.length || 0)
            );
            return acc + netWords + (t.bonusPoints || 0);
          }, 0);
        const eventsScore = (bonusEvents || [])
          .filter((e) => e.team === team)
          .reduce((acc, e) => acc + e.points, 0);
        return Math.max(0, turnsScore + eventsScore);
      },

      getTeamName: (team) => {
        const { teamNameA, teamNameB, teamNameC, teamNameD } = get();
        if (team === "A") return teamNameA || "Team Alpha";
        if (team === "B") return teamNameB || "Team Omega";
        if (team === "C") return teamNameC || "Team Delta";
        return teamNameD || "Team Sigma";
      },

      getTeamColor: (team) => {
        const { colorA, colorB, colorC, colorD } = get();
        if (team === "A") return colorA || "#EF4444";
        if (team === "B") return colorB || "#3B82F6";
        if (team === "C") return colorC || "#10B981";
        return colorD || "#F59E0B";
      },

      getActiveTeams: () => {
        const { teamCount, playersA, playersB, playersC, playersD, teamNameA, teamNameB, teamNameC, teamNameD, colorA, colorB, colorC, colorD } = get();
        const teams: { id: TeamId; name: string; color: string; players: string[] }[] = [
          { id: "A", name: teamNameA || "Team Alpha", color: colorA || "#EF4444", players: playersA || [] },
          { id: "B", name: teamNameB || "Team Omega", color: colorB || "#3B82F6", players: playersB || [] },
        ];
        if (teamCount >= 3) {
          teams.push({ id: "C", name: teamNameC || "Team Delta", color: colorC || "#10B981", players: playersC || [] });
        }
        if (teamCount >= 4) {
          teams.push({ id: "D", name: teamNameD || "Team Sigma", color: colorD || "#F59E0B", players: playersD || [] });
        }
        return teams;
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
      setTeamCount: (count) => set({ teamCount: Math.min(4, Math.max(2, count)) }),
      
      setPlayers: (teamA, teamB, teamC, teamD) => set((state) => ({
        playersA: teamA.filter(p => p.trim() !== ""),
        playersB: teamB.filter(p => p.trim() !== ""),
        playersC: teamC ? teamC.filter(p => p.trim() !== "") : state.playersC,
        playersD: teamD ? teamD.filter(p => p.trim() !== "") : state.playersD,
      })),
      setTeamNames: (nameA, nameB, nameC, nameD) => set((state) => ({
        teamNameA: nameA.trim() || "Team Alpha",
        teamNameB: nameB.trim() || "Team Omega",
        teamNameC: nameC !== undefined ? (nameC.trim() || "Team Delta") : state.teamNameC,
        teamNameD: nameD !== undefined ? (nameD.trim() || "Team Sigma") : state.teamNameD,
      })),
      setGameTitle: (title) => set({
        gameTitle: title.trim() || "Fey Game Night",
      }),
      pauseGame: () => {
        const current = get().phase;
        const safePhase: GamePhase = current === "playing" || current === "spinner" ? "handoff" : current;
        set({
          isGamePaused: true,
          savedPhase: safePhase,
          phase: "setup"
        });
      },
      resumeGame: () => {
        const { savedPhase, activeSpeaker } = get();
        const targetPhase = savedPhase || "handoff";
        if (targetPhase === "handoff" && !activeSpeaker) {
          get().startTurn();
          set({
            isGamePaused: false,
            savedPhase: null,
          });
        } else {
          set({
            isGamePaused: false,
            savedPhase: null,
            phase: targetPhase
          });
        }
      },
      discardSavedGame: () => {
        get().resetGame();
      },
      shufflePlayers: () => set((state) => {
        const { teamCount } = state;
        const activeLists = [state.playersA, state.playersB];
        if (teamCount >= 3) activeLists.push(state.playersC);
        if (teamCount >= 4) activeLists.push(state.playersD);

        const pool = activeLists.flat().filter(p => p.trim() !== "");
        if (pool.length < teamCount) return state;

        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const buckets: string[][] = Array.from({ length: teamCount }, () => []);
        shuffled.forEach((p, idx) => {
          buckets[idx % teamCount].push(p);
        });

        return {
          playersA: buckets[0] || [],
          playersB: buckets[1] || [],
          playersC: buckets[2] || state.playersC,
          playersD: buckets[3] || state.playersD,
        };
      }),
      setColors: (colorA, colorB, colorC, colorD) => set((state) => ({
        colorA,
        colorB,
        colorC: colorC || state.colorC,
        colorD: colorD || state.colorD,
      })),
      setScoreGoal: (goal) => set({ scoreGoal: goal }),
      setBuzzerSound: (sound) => set({ buzzerSound: sound }),
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

      toggleDisputeWordInLastTurn: (word) => set((state) => {
        if (!state.turnsHistory || state.turnsHistory.length === 0) return state;
        const newHistory = [...state.turnsHistory];
        for (let i = newHistory.length - 1; i >= 0; i--) {
          const entry = { ...newHistory[i] };
          if (entry.correctWords.includes(word)) {
            const currentDisputed = entry.disputedWords || [];
            if (currentDisputed.includes(word)) {
              entry.disputedWords = currentDisputed.filter((w) => w !== word);
            } else {
              entry.disputedWords = [...currentDisputed, word];
            }
            newHistory[i] = entry;
            return { turnsHistory: newHistory };
          }
        }
        return state;
      }),

      toggleAwardPassedWordInLastTurn: (word) => set((state) => {
        if (!state.turnsHistory || state.turnsHistory.length === 0) return state;
        const newHistory = [...state.turnsHistory];
        for (let i = newHistory.length - 1; i >= 0; i--) {
          const entry = { ...newHistory[i] };
          if (entry.skippedWords.includes(word)) {
            const currentAwarded = entry.awardedWords || [];
            if (currentAwarded.includes(word)) {
              entry.awardedWords = currentAwarded.filter((w) => w !== word);
            } else {
              entry.awardedWords = [...currentAwarded, word];
            }
            newHistory[i] = entry;
            return { turnsHistory: newHistory };
          }
        }
        return state;
      }),

      startGame: () => {
        const {
          teamCount,
          playersA, playersB, playersC, playersD,
          selectedCategories, difficulty,
          teamNameA, teamNameB, teamNameC, teamNameD
        } = get();

        const activeTeamConfigs: { id: TeamId; name: string; players: string[] }[] = [
          { id: "A", name: teamNameA || "Team Alpha", players: (playersA || []).map((p) => p.trim()).filter(Boolean) },
          { id: "B", name: teamNameB || "Team Omega", players: (playersB || []).map((p) => p.trim()).filter(Boolean) },
        ];
        if (teamCount >= 3) {
          activeTeamConfigs.push({
            id: "C",
            name: teamNameC || "Team Delta",
            players: (playersC || []).map((p) => p.trim()).filter(Boolean)
          });
        }
        if (teamCount >= 4) {
          activeTeamConfigs.push({
            id: "D",
            name: teamNameD || "Team Sigma",
            players: (playersD || []).map((p) => p.trim()).filter(Boolean)
          });
        }

        // Ensure each active team has at least one valid player name
        const normalizedTeams = activeTeamConfigs.map((t) => ({
          id: t.id,
          players: t.players.length > 0 ? t.players : [`${t.name} 1`]
        }));

        // Generate fair interleaved turn order across all active teams
        const maxPlayers = Math.max(...normalizedTeams.map((t) => t.players.length));
        const order: { name: string; team: TeamId }[] = [];
        for (let i = 0; i < maxPlayers; i++) {
          for (const t of normalizedTeams) {
            order.push({
              name: t.players[i % t.players.length],
              team: t.id
            });
          }
        }
        
        // Build the card deck
        const deck = buildDeck(selectedCategories, difficulty, 180);
        
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
          spinnerModifier: "none",
          isGamePaused: false,
          savedPhase: null,
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
          correctCInCurrentTurn: [],
          correctDInCurrentTurn: [],
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
        const {
          deck,
          currentWordIndex,
          correctAInCurrentTurn,
          correctBInCurrentTurn,
          correctCInCurrentTurn,
          correctDInCurrentTurn,
          correctInCurrentTurn
        } = get();
        const currentWord = deck[currentWordIndex];
        if (!currentWord) return;

        const word = currentWord.word;
        if (team === "A") {
          set({
            correctAInCurrentTurn: [...correctAInCurrentTurn, word],
            correctInCurrentTurn: [...correctInCurrentTurn, word],
            currentWordIndex: currentWordIndex + 1
          });
        } else if (team === "B") {
          set({
            correctBInCurrentTurn: [...correctBInCurrentTurn, word],
            correctInCurrentTurn: [...correctInCurrentTurn, word],
            currentWordIndex: currentWordIndex + 1
          });
        } else if (team === "C") {
          set({
            correctCInCurrentTurn: [...correctCInCurrentTurn, word],
            correctInCurrentTurn: [...correctInCurrentTurn, word],
            currentWordIndex: currentWordIndex + 1
          });
        } else if (team === "D") {
          set({
            correctDInCurrentTurn: [...correctDInCurrentTurn, word],
            correctInCurrentTurn: [...correctInCurrentTurn, word],
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
          correctAInCurrentTurn, correctBInCurrentTurn, correctCInCurrentTurn, correctDInCurrentTurn,
          gameMode, turnsHistory, currentTurnIndex, turnOrder, currentRoundIndex, spinnerModifier,
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
          const activeTeams = get().getActiveTeams();
          const teamStatsList: TeamRoundStats[] = [];

          for (const t of activeTeams) {
            let teamCorrectWords: string[] = [];
            if (t.id === "A") teamCorrectWords = correctAInCurrentTurn;
            else if (t.id === "B") teamCorrectWords = correctBInCurrentTurn;
            else if (t.id === "C") teamCorrectWords = correctCInCurrentTurn;
            else if (t.id === "D") teamCorrectWords = correctDInCurrentTurn;

            const doubleBonus = (doubleActive && activeTeam === t.id) ? teamCorrectWords.length : 0;
            const prevScore = get().getScore(t.id);
            const tentativeScore = prevScore + teamCorrectWords.length + doubleBonus;
            const landedBonus = tentativeScore > 0 && tentativeScore < scoreGoal - 1 && tentativeScore % 7 === 0;

            const notes: string[] = [];
            if (doubleActive && activeTeam === t.id) notes.push("Double Points Mod!");
            if (landedBonus) notes.push("Landed on Bonus Space (+1)!");

            teamStatsList.push({
              playerName: activeSpeaker,
              team: t.id,
              correctWords: teamCorrectWords,
              skippedWords: activeTeam === t.id ? skippedInCurrentTurn : [],
              totalTime: activeTeam === t.id ? elapsedSeconds : 0,
              bonusPoints: doubleBonus + (landedBonus ? 1 : 0),
              note: notes.length > 0 ? notes.join(" · ") : undefined
            });
          }

          set({
            turnsHistory: [...turnsHistory, ...teamStatsList],
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
        correctCInCurrentTurn: [],
        correctDInCurrentTurn: [],
        challengeRestriction: null,
        turnsHistory: [],
        bonusEvents: [],
        phase: "setup",
        spinnerModifier: "none",
        isGamePaused: false,
        savedPhase: null,
      })
    }),
    {
      name: "fey-multiplayer-game",
      version: 5,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState) {
          if (persistedState.timerSeconds === 60) {
            persistedState.timerSeconds = 30;
          }
        }
        if (version < 3 && persistedState) {
          if (!persistedState.teamNameA) persistedState.teamNameA = "Team Alpha";
          if (!persistedState.teamNameB) persistedState.teamNameB = "Team Omega";
          if (!persistedState.buzzerSound) persistedState.buzzerSound = "classic";
        }
        if (version < 4 && persistedState) {
          if (!persistedState.gameTitle) persistedState.gameTitle = "Fey Game Night";
          if (persistedState.isGamePaused === undefined) persistedState.isGamePaused = false;
          if (persistedState.savedPhase === undefined) persistedState.savedPhase = null;
        }
        if (version < 5 && persistedState) {
          if (!persistedState.teamCount) persistedState.teamCount = 2;
          if (!persistedState.playersC) persistedState.playersC = ["Player C1"];
          if (!persistedState.playersD) persistedState.playersD = ["Player D1"];
          if (!persistedState.teamNameC) persistedState.teamNameC = "Team Delta";
          if (!persistedState.teamNameD) persistedState.teamNameD = "Team Sigma";
          if (!persistedState.colorC) persistedState.colorC = "#10B981";
          if (!persistedState.colorD) persistedState.colorD = "#F59E0B";
          if (!persistedState.correctCInCurrentTurn) persistedState.correctCInCurrentTurn = [];
          if (!persistedState.correctDInCurrentTurn) persistedState.correctDInCurrentTurn = [];
        }
        return persistedState;
      },
    }
  )
);
