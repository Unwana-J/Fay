# Product Requirements Document (PRD): Fey

**Document Version:** 3.0.0  
**Status:** Active & Implemented (Phase 1 & Phase 2 Live)  
**Last Updated:** November 2026  
**Platform Vision:** *Fey — Think Deeper, Articulate Clearly.*  
**Live Deployment:** `https://fey-eight-liard.vercel.app` (Custom domain: `fey.lokinlabs.com.ng`)  
**Decision Log Reference:** [`docs/DECISIONS_LOG.md`](./DECISIONS_LOG.md)  
**Brand & Copy Reference:** [`docs/BRAND_IDENTITY.md`](./BRAND_IDENTITY.md)

---

## 1. Executive Summary & Product Philosophy

**Fey** is an intellectual learning, vocal articulation, and social parlor platform engineered around the **Feynman Technique**:
> *"If you want to master something, teach it simply in your own voice."*

### 1.1. The Problem Space
Digital learning in the 2020s suffers from the **illusion of explanatory depth**:
* People bookmark hundreds of articles, watch hours of video essays, and skim newsletters, feeling informed.
* Yet when asked to explain even basic concepts aloud without notes, understanding breaks down immediately.
* Passive consumption produces neither retention, conviction, nor communication clarity.

### 1.2. The Solution
Fey solves this through a closed-loop active learning and social sparring ecosystem:
1. **In-App Sourced Research & Timeboxed Study**: 10–15 minutes of structured reading backed by citation-grounded research packs (Wikipedia, Europe PMC, OpenAlex), highlight-to-speaking-cue selection, a 2-minute active study gate, and a focused rich-text editor with a 30-word synthesis minimum.
2. **Vocal Articulation Under Pressure**: Real browser microphone capture enforcing a 45–180 second vocal explanation with opening sentence starters, a 3-stage timed speaking scaffold, fading retrieval cues, and immediate playback/retry.
3. **Honest Self-Reflection & Recall Verification**: Structured Socratic scoring on understanding, clarity, and vocal delivery, paired with an automated **3-Question Post-Session Recall Check** (+60 Bonus XP max), constellation nodes, and a 7-Day Study Schedule planner.
4. **The Parlor & Social Multiplayer Games**: Turning intellectual rigor and mental agility into a cohesive social experience across 4 distinct games:
   * **The Podium (`/podium`)**: Split-panel manual slide studio and AI co-pilot for 5-slide hot-take presentations.
   * **Online Articulate (`/play`)**: Real-time and local multiplayer word description with Cristian's clock sync, Maker-Checker consensus disputes, and an append-only match hours ledger.
   * **Naija Trivia (`/games/trivia`)**: 1,000+ cultural and historical questions, Episodic Daily Drop Friendship Leagues, dismissible Live Arena custom challenges, sub-second AI answer contest refereeing, 1-shot capped redemption (85%), and game-to-voice cross-pollination.
   * **Mathletics (`/games/mathletics`)**: 300-question mental math & Quantitative Reasoning bank with configurable turn timers (25s floor to 90s), instant 1v1 Sprint Duels, and Multi-Day Marathon Leagues with resilient cross-device score syncing.
5. **A Viral Distribution Engine**: Zero-database URL-portable dispatches, Substack-style highlight-to-tweet tools, contextual 90s Rebuttal Challenges, dynamic SSR OpenGraph unfurls, and 1-click HTML5 Canvas shareable score and proof cards.

---

## 2. Target User Personas

| Persona | Core Motivation | Behavioral Traits | Fey Feature Fit |
| :--- | :--- | :--- | :--- |
| **1. The Self-Directed Polymath** *(e.g. Nana, 26, Product Builder)* | Wants to systematically master diverse disciplines (AI, economics, philosophy, history) and build a daily thinking habit. | Reads newsletters, hoards bookmarks, values personal intellectual growth, wants tangible proof of daily progress. | Sourced Research Pack, TipTap Editor, 7-Day Study Schedule, Dual-Hue Activity Heatmap, ReactFlow Constellation, Post-Session Recall Quiz. |
| **2. The Verbal Articulator & Orator** *(e.g. Tunde, 31, Tech Lead & Speaker)* | Wants to eliminate filler words, speak with authority, and articulate complex technical ideas simply without jargon. | Prepares for conference talks, investor pitches, or team updates; struggles with rambling explanations under pressure. | Vocal Synthesis timer (45–180s), Opening Sentence Starters, 3-Stage Timed Speaking Scaffold, Fading Retrieval Cues, Audio Playback & Retry, Impromptu Speech Mode (90s). |
| **3. The Hot-Take Presenter & Party Host** *(e.g. Amara, 24, Creator & Host)* | Loves unhinged debates, dinner-party slide nights, and sharing spicy cultural opinions with friends. | Active on X/Twitter and TikTok; creates slideshows for fun; loves comedic storytelling and group banter. | **The Podium (`/podium`)**: Split-panel Manual Studio + optional AI slide generation, photo/meme canvas compression, presenter mode, portable URL sharing. |
| **4. The Social Scholar & League Competitor** *(e.g. David, 22, University Student)* | Enjoys group study, daily competition, intellectual camaraderie, and sparring with friends. | Competes in WhatsApp/Discord groups; motivated by daily drops, streaks, and live group leaderboards. | Trivia Friendship Leagues, Mathletics Sprint Duels & Marathons, Online Articulate live rooms, Community Research Salons (`/community`). |
| **5. The Curious Lurker (Acquisition Target)** *(e.g. Sarah, 28, Casual X/WhatsApp user)* | Stumbles upon a shared slide deck, trivia challenge link, or note snippet on X or WhatsApp. | Skims feeds quickly; skeptical of traditional ed-tech; easily hooked by bold statements, 1v1 duels, or interactive quotes. | Public Note Viewer (`/note/[code]`), Slides Viewer (`/podium/slides/[code]`), **The Rebuttal Challenge**, Highlight-to-Tweet quotes, Lossless Guest-to-Scholar conversion. |

---

## 3. Product Features & Functionalities Matrix

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                   FEY DASHBOARD                                   │
│    Spatial Partitioning: [ Daily Practice & Study ]  vs.  [ The Parlor & Games ]  │
└──────────────────┬───────────────────────────────────────────────┬────────────────┘
                   │                                               │
     ┌─────────────▼──────────────┐                  ┌─────────────▼──────────────┐
     │     THE STUDY (HABITS)     │                  │    THE PARLOR (4 GAMES)    │
     │ • Sourced Research Pack    │                  │ • The Podium (/podium)     │
     │ • Speaking Cues & Scaffold │                  │ • Articulate (/play)       │
     │ • Vocal Synthesis (45-180s)│                  │ • Naija Trivia (/trivia)   │
     │ • 3-Q Recall Check (+60XP) │                  │ • Mathletics (/mathletics) │
     │ • 7-Day Study Schedule     │                  │ • Friendship Leagues       │
     │ • Dual-Hue Streak Calendar │                  │ • Dismissible Live Arenas  │
     └─────────────┬──────────────┘                  └─────────────┬──────────────┘
                   │                                               │
                   └───────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │     VIRAL LOOPS & CLOUD BACKBONE    │
                        │ • Portable URLs (LZ-String)         │
                        │ • Feynman Rebuttal Challenge (90s)  │
                        │ • Game-to-Voice Cross-Pollination   │
                        │ • HTML5 Canvas Shareable Cards      │
                        │ • Lossless Guest Account Migration  │
                        │ • Dual-Table Resilient Cloud Sync   │
                        └─────────────────────────────────────┘
```

---

### 3.1. Dashboard, Spatial Partitioning & Habit Formation (`/`)
* **Spatial Partitioning (The Study vs. The Parlor)**:
  * High-taste segmented spring switcher (`layoutId="active-dashboard-tab"`) separating the dashboard into two focused workspaces:
    1. **`Daily Practice & Study`**: Dedicated to solo Feynman sprints, daily vows, the 3-step ritual guide, and consistency tracking.
    2. **`The Parlor & Games`**: Dedicated 4-card game launcher (*The Podium*, *Online Articulate*, *Naija Trivia*, *Mathletics*) and active tournaments.
* **Day 0 Progressive Disclosure & Scheduled Topic Auto-Promotion**:
  * Newcomers with 0 completed sessions see a welcoming Day 0 banner and elevated 3-step Feynman Ritual walkthrough (*01 Deep Research → 02 Vocal Synthesis → 03 Reflect & Expand*).
  * If a user scheduled a topic for today in their **7-Day Study Schedule**, the Dashboard automatically promotes it into the Active Articulation Workspace and greets them with a 1-click reminder modal (`Scheduled for Today · Ready`).
* **Active Articulation Workspace (`.surface-hero`)**:
  * Deterministic daily topic seed strictly drawn from the user's `enabledCategories` (or promoted from today's 7-Day Schedule slot).
  * Displays category vector icon (`CategoryIcon.tsx`), Roman numeral study tier (`I · Novice`, `II · Scholar`, `III · Master`), and XP reward (`+100` to `+200 XP`).
  * Primary Actions:
    * `Begin Research (15m)`: Launches the full research + vocal sprint.
    * `Quick Test: Impromptu (90s)`: Direct-to-mic sprint bypassing research (Two-Minute Rule).
    * `Next Topic`: Cycles within enabled categories.
* **Focus Category Modal**:
  * Triggered by clicking the Fey butterfly logo; lets users filter spins to a specific discipline or browse `/discover`.
* **Daily Vows (3 Daily Quests)**:
  * Deterministic daily micro-quests resetting at midnight (*The Daily Voice* +40 XP, *Sustained Articulation* +50 XP, *Conviction & Clarity* +60 XP) with claimable bonuses.
* **3-Day Habit Momentum Track**:
  * Rewards the critical Day 1 → Day 3 retention cliff inside `completeSession`:
    * **Day 1**: *First Voice* badge unlocked.
    * **Day 2**: `+50 Bonus XP` automatically awarded.
    * **Day 3**: `+1 Scholar's Seal (Streak Shield)` automatically awarded.
* **Scholar's Seal (Streak Freeze / Loss Aversion)**:
  * Scholars hold seals (default 1) that automatically protect active streaks if a calendar day is missed. Additional seals can be redeemed for `150 XP`.
* **Dual-Hue Activity Heatmaps & Streak Calendar (`StreakCalendarModal.tsx`, `/analytics`)**:
  * Clickable streak indicator opens the full interactive Streak Calendar Modal.
  * Both the Streak Calendar and 52-week Analytics Heatmap distinguish activity types via semantic color coding:
    * **Wine Red (`var(--terra)`)**: Deep Research & Vocal Challenge completed.
    * **Forest Olive (`var(--olive)`)**: Parlor Game completed (Trivia, Mathletics, Articulate).
    * **Diagonal Split Gradient**: Both Research and Parlor Games completed on the same day.

---

### 3.2. Solo Feynman Sprints & Sourced Research Loop (`/session/[id]`)
* **Stage 1: Deep Research & In-App Sourced Research Pack (10–30 min)**:
  * **Grounded Multi-Source Research Reader (`POST /api/ai/research`)**:
    * Retrieves real passages from Wikipedia, Europe PMC, and OpenAlex first, then uses Gemini to synthesize three reading layers (**Gist ~100w**, **Summary ~300w**, **Deep Dive ≤800w**) with inline `[S#]` citations.
    * Only verified cited sources with real URLs/DOIs are displayed. Cached locally per topic (`fey-research-v1:<topicId>`).
  * **Highlight-to-Speaking-Cue Selection**:
    * Users highlight any text in the research reader and click `Add as cue` (up to 500 words total across cues).
    * Optional per-cue `Save to notes` checkbox inserts selected cues live into the TipTap editor.
  * **2-Minute Active Study Gate & 30-Word Synthesis Gate**:
    * Encourages genuine engagement before advancing to the microphone, while requiring at least 30 words of the user's own synthesis notes in the distraction-free TipTap editor.
* **Stage 2: Vocal Synthesis & In-Sprint Speaking Scaffolding (45–180 sec)**:
  * Real browser microphone capture via `MediaRecorder` API with live waveform visualization.
  * **Opening Sentence Starter**: Displayed during the 3-2-1 countdown and first 15 seconds of recording to eliminate blank-mic hesitation.
  * **3-Stage Timed Speaking Scaffold**: Dynamically transitions beneath the live waveform as elapsed time progresses:
    1. *Step 1 (0–40%)*: Plain Definition
    2. *Step 2 (40–75%)*: Real-World Analogy
    3. *Step 3 (75–100%)*: Why It Matters
  * **Fading Retrieval Cues**: User-selected cues display during speaking and gently fade after 20 seconds (with a manual Show/Hide toggle) so cues kickstart speech without becoming a verbatim script.
  * **Exit-Intent 45s Downsell Nudge**: If a user attempts to leave mid-session, an exit-intent modal highlights endowed progress and offers a 1-click downsell to a `45s Quick Summary` to preserve their daily habit.
  * **In-Sprint Review & Retry**: Users can listen back immediately and re-record before submitting.
* **Stage 3: Reflection & Socratic Self-Scoring**:
  * Qualitative reflection prompts (*Most fascinating takeaway*, *Hardest part to explain simply*, *How to explain to a 10-year-old next time*) plus 1–5 ratings on Confidence, Comprehension, and Vocal Delivery.
* **Stage 4: Celebration, Recall Verification & Next-Day Lock-In**:
  * **Post-Session 3-Question Recall Check (`ResearchQuizCard.tsx`)**: Non-blocking comprehension quiz generated from the research sources, awarding `+15 XP` per correct answer plus `+15 XP` Perfect Recall bonus (`+60 XP` max, single-claim locked per session).
  * **Next-Day Schedule Prompt**: Lets the scholar lock in tomorrow's topic on the spot.
  * **1-Click Public Note URL & HTML5 Canvas Proof Card**: Instant shareable link (`/note/[code]`) and 1200x630 PNG clipboard export.

---

### 3.3. Library & 7-Day Study Schedule (`/library`)
* **Completed Sessions Archive**: Full playback of recorded Base64 vocal syntheses, written research notes, clarity ratings, and 1-click sharing.
* **7-Day Study Schedule (`X/7` Planner Tab)**:
  * Interactive 7-day calendar strip covering the next 7 calendar days (`getNext7ScheduleDays()`, capped at 7 scheduled topics).
  * **Topic Finder Modal**: Filter uncompleted topics by study tier (`Novice`, `Scholar`, `Expert`), topic category, or search query to assign or swap topics for any upcoming day.

---

### 3.4. The Parlor: Social & Multiplayer Games (`/games`)

#### A. The Podium: Party Presentation Studio (`/podium`)
* **Split-Panel Manual Studio + Optional AI Co-Pilot**:
  * Decoupled from mandatory AI waits: users can author, reorder, and customize 5-slide decks manually or use Gemini (`POST /api/ai/generate-slides`) as an instant co-pilot across 3 styles (`bold`, `minimal`, `academic-chaos`) and 7 color palettes.
* **60+ Curated Hot Takes & Custom Topics**:
  * 6 categories (Hot Take, Culture, Social, Pseudo-Science, Economics, Pop Culture) plus custom topic creation.
* **Photo & Meme Canvas Compression**:
  * Client-side HTML5 canvas resizes uploaded images/memes to max 800px (0.78 JPEG) so full 5-slide decks compress cleanly into zero-database `lz-string` URLs (`/podium/slides/[code]`).
* **Fullscreen Presenter Mode**: Keyboard-driven slide deck transitions (`Space`, `ArrowRight`, `ArrowLeft`).

#### B. Online Articulate: Live Multiplayer Word Description (`/play`)
* **Local & Online Multiplayer Modes**:
  * Real-time multi-device rooms synchronized via Supabase with adaptive fluid-compute polling and version handshakes (`ETag`).
* **Cristian's Clock Synchronization & Pre-Warmed Web Audio Singleton**:
  * Synchronizes countdown timers to the millisecond across iOS, Android, and desktop devices so the round-end buzzer fires simultaneously for all players.
* **Bonus Round Countdown & Prompts**:
  * Dedicated host countdown and player prompt transitions for high-stakes bonus rounds.
* **Maker-Checker Post-Round Consensus Dispute Model**:
  * After each 60s turn, teams review passed/claimed words in a structured dispute stage before points commit to the scoreboard.
* **Append-Only Articulate Match Ledger (`articulate_matches`)**:
  * Persists every completed match (and captures matches prior to `Play Again` room resets) to track cumulative community **Player Hours** and **Game Hours** toward platform milestones (100 → 250 → 500 → 1,000 hrs).

#### C. Naija Trivia Arcade & Friendship Leagues (`/games/trivia`)
* **1,000+ Curated Questions**: Covering Nigerian History, Pop Culture, Music, Literature, Sports, Governance, and Global General Knowledge.
* **Episodic Friendship Leagues (`/games/trivia/league/[code]`)**:
  * Multi-day group tournaments where Daily Drops unlock sequentially at midnight (with host controls for Extra Drops or Unlimited party mode).
* **Dismissible Live Arena Custom Challenges (`ActiveArenasShowcase.tsx`, `TriviaChallengeLounge.tsx`)**:
  * Curated 10-question thematic challenges including *The Founding Fathers & First Republic*, *Nollywood, Afrobeats & Golden Age Culture*, *Super Eagles, Falcons & Olympic Glory* (Sports), and *Ancient Kingdoms, Rebels & Democratic Icons* (History).
  * Players can dismiss/close completed challenges (`X` / `Close` / `Close Completed`) from the Live Arenas showcase (`fey_dismissed_challenges_v1`), automatically rotating unplayed custom challenges into view while keeping all challenges accessible in the `Challenges` tab.
* **Sub-Second AI Answer Contest Referee (`POST /api/trivia/contest`)**:
  * Uses Gemini with `thinkingBudget: 0` (<450ms response) to adjudicate player answer disputes with cultural and phonetic awareness.
* **1-Shot Capped Redemption & Game-to-Voice Cross-Pollination**:
  * On the results screen, players can run a single **1-Shot Redemption** pass on missed questions (`0.5x` recovery weight, hard-capped at `85%` to protect first-attempt leaderboard integrity, `+2 Recovery XP` per redeemed answer).
  * **Turn a Missed Question into Mastery (+50 Bonus XP)**: Converts any missed trivia concept and its historical explanation directly into a 60-second Impromptu Voice Challenge (`/session/[id]`).

#### D. Mathletics: Mental Math & Quantitative Reasoning (`/games/mathletics`)
* **300-Question Bank with Quantitative Reasoning**:
  * Spans arithmetic velocity, percentages, algebra, probability, pattern sequences, and Nigerian Quantitative Reasoning puzzles across Easy, Medium, and Hard tiers.
* **Configurable Turn Duration (25-Second Minimum Floor)**:
  * Selectable question timers (`25s` Blitz, `45s` Standard, `60s` Deliberate, `90s` Extended) enforced with a strict `25s` minimum floor (`Math.max(25, timer)`). Velocity bonuses and critical visual urgency scale proportionally with the chosen timer.
* **Unified Sprint Duels (1-Day) & Marathon Leagues (3–14 Days) (`/games/mathletics/league/[code]`)**:
  * **Instant 1v1 / Group Sprint Duels**: Launching a duel from a completed solo sprint pre-seeds the exact 10 questions just solved and locks in the creator's score.
  * **Multi-Day Marathon Leagues**: Uses deterministic seeded RNG per league code and day index so every participant receives identical daily question sets.
* **Resilient Dual-Table Cloud Sync & Local Auto-Heal (`lib/mathletics-db.ts`)**:
  * Queries dedicated `mathletics_leagues` / `mathletics_scores` tables with automatic transparent fallback to `friendship_leagues` / `league_scores` if unmigrated (`42P01`), auto-upserts URL-shared leagues to satisfy foreign keys, backfills local scores on mount, and polls live standings on window focus.

---

### 3.5. Community Research Salons (`/community`) & Constellation Graph (`/constellation`)
* **Decentralized Community Salons (`/community/room/[roomId]`)**:
  * Shareable room links (`?code=...&r=...`) with auth-gate preservation, multi-field topic search, custom topic creation, and in-room peer audio playback with animated waveforms.
* **Knowledge Constellation Graph (`/constellation`)**:
  * Interactive ReactFlow 2D canvas with cluster orbit scaling (`xN`) that visualizes disciplinary depth and recommends adjacent unexplored fields.

---

### 3.6. Admin Console & Platform Telemetry (`/admin`)
* **Server-Signed HMAC Authentication (`lib/admin-auth.ts`, `/api/admin/session`)**:
  * Timing-safe passcode verification issuing an `httpOnly` HMAC-signed session cookie validated by `isAdminAuthorized()` across all admin API endpoints.
* **Cross-Game Engagement & Milestone Tracking (`lib/admin-engagement.ts`)**:
  * Tracks cumulative Player Hours, Game Hours, session counts, 14-day activity trends, and period-over-period deltas (`7d` / `30d` / `all`) across Articulate, Naija Trivia, Mathletics, and Feynman Sprints.
  * Dedicated **Articulate Milestone Progress Card** (100 → 250 → 500 → 1,000 hours).
* **Unified Top Scholars Leaderboard**:
  * Deduplicates activity across `user_id`, `device_id`, and normalized `username` to surface the platform's most active scholars across all study and game modes.
* **Safety Desk & Anti-Abuse Controls**:
  * Multi-tier bot filtering (`%VU%` sanitizers, sub-200ms answer rejection, session XP caps) and 1-click admin score/report management.

---

## 4. Brand Identity & Design Engineering System

Full specification in [`docs/BRAND_IDENTITY.md`](./BRAND_IDENTITY.md):
1. **Archival Chalk & Hard-Border Editorial Aesthetic**:
   * Warm archival chalk canvas (`--bg-base: #F7F5F0`, `--text: #16190D`) with physical paper micro-stipple texture and crisp 1px/2px solid structural borders (`--border-strong: #2E341E`), avoiding fuzzy AI drop shadows.
   * Academic serif typography (`Lora` / Georgia) for headlines paired with clean sans-serif UI controls.
2. **Strict Color Semantics**:
   * `--terra` (`#7A1C2E` / Wine Red): Primary CTAs, active focal anchors, and Deep Research heatmap cells ONLY.
   * `--olive` (`#444E2C` / Forest Olive): Structural framing, badges, active states, and Parlor Game heatmap cells.
   * `--gold` (`#A67C1E` / Bronze Gold): Earned XP, streaks, Scholar's Seals, and achievements ONLY.
   * `--red` (`#B53A3A`): Critical timer urgency and error states ONLY.
3. **Anti-Jargon Lexicon & Universal No-Emoji UI Rule**:
   * Plain, dignified copy (*Challenge* instead of *Gauntlet*, *Topic Categories* instead of *Intellectual Pillars*, *Speaking Time* instead of *Speaking Sprint Duration*).
   * Zero raw system emojis in UI controls, timers, or action buttons; uses bespoke 1.5px vector line icons (`CategoryIcon.tsx`, Lucide) and Roman numeral tiers.
4. **Tactile Spring Motion (`.agents/skills/ui-motion/SKILL.md`)**:
   * GPU-composited Framer Motion sliding pill tabs (`layoutId`, `stiffness: 450, damping: 32`) and physical press feedback (`active:scale-[0.98]`).

---

## 5. Technical Specifications & Architecture

### 5.1. Tech Stack Overview
| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **State Management** | Zustand 5 with `persist` middleware (Store Migration v8) |
| **Database & Cloud Sync** | Supabase (PostgreSQL, Row-Level Security, hybrid local-first + cloud sync) |
| **Styling & Design System** | Tailwind CSS v4, CSS Custom Properties (`--terra`, `--olive`, `--gold`), Google Font `Lora` |
| **Animation Engine** | Framer Motion (spring pill tabs, variant cascades, animated counters) |
| **Rich Text Editor** | TipTap (StarterKit, TaskList, TaskItem, Link, Placeholder) |
| **Graph Visuals** | ReactFlow (Constellation knowledge graph with cluster orbit scaling) |
| **Audio Engine** | Browser `MediaRecorder` API + Pre-warmed Web Audio API Singleton |
| **AI Backend** | Google Gemini (`gemini-3.8-flash`) via Next.js server route handlers |
| **Compression & Sharing** | `lz-string` URI-safe payload compression + HTML5 Canvas 2D Context |

### 5.2. API Endpoint Architecture
| Route | Function |
| :--- | :--- |
| `POST /api/ai/research` | Retrieves real passages (Wikipedia, Europe PMC, OpenAlex) and generates a cited 3-layer reading pack (`[S#]`) + 3-question recall quiz. |
| `POST /api/ai/generate-slides` | Converts topic/notes into a structured 5-slide Podium deck with layout mixing and palette injection. |
| `POST /api/ai/podium-topic` | Generates culturally aware hot-take presentation topics with seed bullets. |
| `POST /api/ai/validate` | Evaluates word descriptions in *Online Articulate* (`thinkingBudget: 0`). |
| `POST /api/ai/check-violation` | Referees taboo word violations in party games. |
| `POST /api/ai/pronunciation-coach` | Provides vocal critique and feedback on articulation. |
| `POST /api/trivia/contest` | Sub-second (<450ms) AI referee for contested trivia answers (`thinkingBudget: 0`). |
| `GET/POST /api/mathletics/league` | Manages Mathletics Sprint Duels and Marathon Leagues with dual-table fallback and URL auto-restoration. |
| `GET/POST /api/admin/*` | HMAC-cookie-authenticated admin endpoints (`/session`, `/overview`, `/users`, `/features`). |

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

### 6.1. Habit & Learning Metrics
* **D1 / D3 / D7 / D30 Retention**: Measured across the 3-Day Habit Momentum Track and 7-Day Study Schedule return rates.
* **Daily Vow Completion Rate**: Target >45% of daily active scholars completing at least 2 of 3 daily quests.
* **Post-Session Recall Accuracy**: Percentage of scholars completing the 3-question recall check and achieving Perfect Recall (`3/3`).
* **Game-to-Voice Conversion Rate**: Percentage of Trivia players converting a missed trivia explanation into a 60-second vocal synthesis sprint.

### 6.2. Multiplayer & Viral Distribution Metrics
* **Cumulative Community Play Hours**: Tracked via `articulate_matches` and cross-game telemetry toward the 500-hour and 1,000-hour milestones.
* **Viral Coefficient ($K$)**:
  $$K = i \times c$$
  *(where $i$ = dispatches, duel links, or challenges shared per active user, and $c$ = conversion rate of recipients who complete a round or record a rebuttal sprint).*
* **Lossless Guest Conversion Rate**: Percentage of anonymous guest players who convert to registered accounts via `convert_guest_account` while retaining their accumulated streaks and league scores.

---

## 7. Future Horizons & Roadmap

| Horizon | Phase | Target Capabilities |
| :--- | :--- | :--- |
| **Phase 3 (Audio CDN)** | Near-term | Cloudflare R2 / AWS S3 pre-signed storage for long-form vocal recordings exceeding browser storage quotas. |
| **Phase 4 (Live Voice Salons)** | Mid-term | Live synchronized WebRTC / LiveKit audio rooms for real-time multi-speaker Feynman debate salons. |
| **Phase 5 (AI Socratic Critique)** | Mid-term | Full speech-to-text transcription paired with line-by-line Gemini Socratic feedback on filler words, jargon density, and explanatory clarity. |

---

*Fey — Think Deeper, Articulate Clearly.*  
*Maintained by Lokin Labs.*
