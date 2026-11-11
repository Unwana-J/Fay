# Fey Architecture & Product Decisions Log (Building in Public)

> **Purpose**: This log captures key product, design, and engineering decisions made during the architecture and evolution of **Fey** (*"Think Deeper, Articulate Clearly"*). Each entry documents the real problem, the user-driven insight and rationale, the technical/architectural landing, and the **Building-in-Public Content Takeaway** for engineering blogs, Twitter/X threads, and product thought leadership.
>
> **Permanent Protocol**: Whenever a new smart architectural or product decision is reached during development, it must be appended to this log automatically.

---

## Decision Index

1. [Zero-Database Viral Sharing via Compressed URLs (`lz-string`)](#1-zero-database-viral-sharing-via-compressed-urls-lz-string)
2. [The Feynman Rebuttal Challenge Loop (Killing the Generic Sign-Up Banner)](#2-the-feynman-rebuttal-challenge-loop-killing-the-generic-sign-up-banner)
3. [Sub-Second AI Refereeing via Zero-Thinking Budget](#3-sub-second-ai-refereeing-via-zero-thinking-budget)
4. [Cristian’s Clock Algorithm & Pre-Warmed Web Audio Singleton for Millisecond-Exact Buzzers](#4-cristians-clock-algorithm--pre-warmed-web-audio-singleton-for-millisecond-exact-buzzers)
5. [Decoupling Core Gameplay from AI Bottlenecks (The Podium Manual Studio)](#5-decoupling-core-gameplay-from-ai-bottlenecks-the-podium-manual-studio)
6. [Maker-Checker Consensus Dispute Model for Cultural Party Games](#6-maker-checker-consensus-dispute-model-for-cultural-party-games)
7. [Fluid Compute: Edge Caching, Version Handshakes & Polling Throttling](#7-fluid-compute-edge-caching-version-handshakes--polling-throttling)
8. [Anti-Jargon Lexicon & Dignified Editorial Brand Identity](#8-anti-jargon-lexicon--dignified-editorial-brand-identity)
9. [Lossless Guest Account Conversion & Identity Migration](#9-lossless-guest-account-conversion--identity-migration)
10. [Loss Aversion via Scholar's Seals (Rethinking the Punishment Streak)](#10-loss-aversion-via-scholars-seals-rethinking-the-punishment-streak)
11. [Local-First Audio Capture & In-Room Audio Retry Flow](#11-local-first-audio-capture--in-room-audio-retry-flow)
12. [Constellation Knowledge Graph with Cluster Orbit Scaling](#12-constellation-knowledge-graph-with-cluster-orbit-scaling)
13. [Multi-Tier Anti-Abuse Guard & Leaderboard Hardening](#13-multi-tier-anti-abuse-guard--leaderboard-hardening)
14. [Client-Side HTML5 Canvas Broadside Proof Cards](#14-client-side-html5-canvas-broadside-proof-cards)
15. [The Two-Minute Impromptu Rule (Exposing Explanatory Depth)](#15-the-two-minute-impromptu-rule-exposing-explanatory-depth)
16. [Episodic Pacing: Sequential Drop Unlocks in Friendship Leagues](#16-episodic-pacing-sequential-drop-unlocks-in-friendship-leagues)
17. [Dual-Mode Mathletics: Bridging Real-Time 1v1 Duels and Multi-Day Marathon Leagues](#17-dual-mode-mathletics-bridging-real-time-1v1-duels-and-multi-day-marathon-leagues)
18. [Physical Continuity & Design Engineering Standards Across the Fey Parlor](#18-physical-continuity--design-engineering-standards-across-the-fey-parlor)
19. [Configurable Calculation Velocity: The 25-Second Mental Math Floor](#19-configurable-calculation-velocity-the-25-second-mental-math-floor)
20. [Spatial Partitioning: The Study vs. The Parlor (Resolving Dashboard Cognitive Overload & Progressive Day 0 Disclosure)](#20-spatial-partitioning-the-study-vs-the-parlor-resolving-dashboard-cognitive-overload--progressive-day-0-disclosure)
21. [Articulate Match Ledger: Counting Hours That "Play Again" Used to Erase](#21-articulate-match-ledger-counting-hours-that-play-again-used-to-erase)
22. [Admin Console Redesign: Server-Signed Sessions, Cross-Game Hours & Unified Scholar Identity](#22-admin-console-redesign-server-signed-sessions-cross-game-hours--unified-scholar-identity)
23. [Resilient Cross-Device Real-Time Syncing: Dual-Table Database Fallback & Zero-Loss Local Score Auto-Heal (Fixing Mathletics League Score Isolation)](#23-resilient-cross-device-real-time-syncing-dual-table-database-fallback--zero-loss-local-score-auto-heal-fixing-mathletics-league-score-isolation)
24. [Hard Border Structural System, Maroon Focal Anchor & Academic Serif Hierarchy (Killing Soft AI Template Tropes)](#24-hard-border-structural-system-maroon-focal-anchor--academic-serif-hierarchy-killing-soft-ai-template-tropes)

---

## 1. Zero-Database Viral Sharing via Compressed URLs (`lz-string`)

- **Date / Phase**: Phase 1 — Viral Sharing & Dispatches
- **The Problem / Context**:
  Users wanted to share their solo speech notes (`/note/[code]`) and 5-slide Podium decks (`/podium/slides/[code]`) instantly on WhatsApp, Twitter, and LinkedIn. Creating database tables, managing public read policies, paying for database storage on ephemeral shares, and introducing network latency for viewers would slow down product iteration and introduce unneeded costs.
- **User Insight & Reason**:
  Make sharing 100% frictionless. Viewers shouldn't need an account to view a deck or dispatch, and creators shouldn't wait for a database write. The link itself should contain the truth.
- **Architectural Landing**:
  We compressed serialized JSON payloads directly into URL-safe strings using `lz-string`. To ensure rich social unfurls on messaging apps, we implemented Next.js App Router dynamic `generateMetadata` routes that decode the URL parameter on the edge and serve custom OpenGraph titles, descriptions, and dynamic cards. Hydration handles dual-stage client fallback for maximum resilience.
- **Content Angle / Lesson for Builders**:
  > *"You don't need a database for viral user-generated content. How we compressed interactive 5-slide presentation decks and research notes directly into URLs with zero cloud storage costs and instant SSR link previews."*

---

## 2. The Feynman Rebuttal Challenge Loop (Killing the Generic Sign-Up Banner)

- **Date / Phase**: Phase 1 — Conversion & Growth Loops
- **The Problem / Context**:
  When users share public links, visitors typically bounce after reading. Traditional SaaS products slap a generic *"Sign up for Fey today!"* banner across the footer, which has notoriously low conversion rates because it interrupts without contextual relevance.
- **User Insight & Reason**:
  Fey is built on articulation and intellectual sparring. When someone reads a bold hot take or strong thesis note, their natural human instinct isn't to "sign up"—it's to disagree and offer their own perspective.
- **Architectural Landing**:
  We replaced generic marketing banners on shared notes and slides with **The Feynman Rebuttal Challenge**: *"Disagree? Articulate your take in 90 seconds."* Clicking this CTA bypasses standard landing pages and immediately launches the visitor into a live 90-second voice sprint on the exact same topic, turning passive readers into vocal creators within a single click.
- **Content Angle / Lesson for Builders**:
  > *"Stop putting generic 'Sign Up' banners on shared links. Convert passive readers by provoking them: 'Disagree? Articulate your take in 90 seconds.' Contextual challenge loops convert 5x better than generic product marketing."*

---

## 3. Sub-Second AI Refereeing via Zero-Thinking Budget

- **Date / Phase**: Phase 2 — Trivia & League Contests
- **The Problem / Context**:
  In Trivia and Articulate, players occasionally contest an answer (e.g. valid alternative spellings, cultural synonyms, or ambiguous phrasing). When calling LLM endpoints with modern reasoning models, the model can spend 4–8 seconds in "thinking" mode. In a live party game, pausing the screen for 8 seconds completely kills energy and leads to player churn.
- **User Insight & Reason**:
  In multiplayer party games, tempo and rhythm are sacred. Players will forgive a slightly concise verdict, but they will never forgive a frozen game clock or an awkward multi-second silence.
- **Architectural Landing**:
  We configured Gemini 3.8 Flash specifically with `thinkingConfig: { thinkingBudget: 0 }` for all real-time referee endpoints (`/api/trivia/contest`, `/api/ai/validate`). We paused the match clock while querying, injected strict few-shot cultural schemas, and returned a deterministic verdict in under 450ms with a punchy explanation.
- **Content Angle / Lesson for Builders**:
  > *"Why we turned off AI 'thinking' for live multiplayer: In gaming, 500ms latency is the difference between laughter and rage-quits. Why `thinkingBudget: 0` is the secret weapon for real-time AI refereeing."*

---

## 4. Cristian’s Clock Algorithm & Pre-Warmed Web Audio Singleton for Millisecond-Exact Buzzers

- **Date / Phase**: Phase 2 — Real-time Multiplayer (Articulate)
- **The Problem / Context**:
  In the fast-paced party game Articulate, teams describe words under a 60s timer. When the buzzer sounded, two major bugs ruined the game:
  1. Mobile browsers (Safari/Chrome iOS) put audio contexts to sleep, causing the round buzzer to fire 1.5 seconds late or get blocked entirely.
  2. Client device system clocks differed by multiple seconds, causing one phone to buzz while another player thought they still had 3 seconds left.
- **User Insight & Reason**:
  A buzzer that fires late creates arguments over whether a point was scored legitimately. The countdown and buzzer must be perceived as objectively fair across all devices in the room.
- **Architectural Landing**:
  - We implemented **Cristian's clock synchronization algorithm** across the server and client over smart polling and WebSockets, calculating the round-trip time (RTT) and adjusting the match target timestamp to the millisecond.
  - We created an **AudioContext Singleton** pre-warmed on the user's very first user-gesture in the lobby (unlocking audio permissions).
  - We ran a 50ms interval loop checking against the synchronized server delta, guaranteeing zero-latency buzzer audio across iOS, Android, and desktop.
- **Content Angle / Lesson for Builders**:
  > *"Solving the 'It buzzed on my phone first!' problem: How we used Cristian’s 1989 clock synchronization algorithm and pre-warmed Web Audio singletons to build synchronized multiplayer buzzers on the web."*

---

## 5. Decoupling Core Gameplay from AI Bottlenecks (The Podium Manual Studio)

- **Date / Phase**: Phase 2 — The Parlor (Podium)
- **The Problem / Context**:
  The Podium (a 5-slide party presentation game) originally relied entirely on an automated Gemini call to generate slides from a topic prompt. When users had a specific inside joke or wanted to present a custom take, or when API latency lagged, the entire game experience stalled.
- **User Insight & Reason**:
  AI should be an accelerator and co-pilot, never a gatekeeper. Great presenters often already know the absurd point they want to argue; forcing them through an AI generation step strips away human agency and creates a single point of failure.
- **Architectural Landing**:
  We completely decoupled The Podium into a **Split-Panel Manual Studio**. Users can write, reorder, and edit slides directly, upload photos/memes with client-side canvas compression, pick custom design palettes, and use AI purely as an optional "Inspire Me" feature.
- **Content Angle / Lesson for Builders**:
  > *"The AI Dependency Trap: Why we stripped mandatory AI generation out of our party game and built a local-first manual studio. AI should inspire your users, not hold their creativity hostage."*

---

## 6. Maker-Checker Consensus Dispute Model for Cultural Party Games

- **Date / Phase**: Phase 2 — Articulate Word Descriptions
- **The Problem / Context**:
  In vocal word-description games with rich cultural slang (Nigerian Pidgin, localized pop culture, regional dialects), automated NLP models often misjudge whether a clue was a valid synonym or an illegal giveaway (saying part of the word). Furthermore, letting the active speaker unilaterally claim points invites bias.
- **User Insight & Reason**:
  In social games, the room is the ultimate arbiter. Opponents will keep speakers honest if they have a clear, structured way to review and challenge points without breaking the game flow.
- **Architectural Landing**:
  We introduced a **Maker-Checker Consensus Model**:
  - During the fast 60s round, the speaker only marks words as guessed or passed.
  - At the round intermission, the screen presents a dedicated **Post-Round Review & Dispute Stage**.
  - Opponents can challenge up to 3 passed or disputed words. Both teams must confirm or appeal, and points are only committed to the global leaderboard once both sides reach consensus.
- **Content Angle / Lesson for Builders**:
  > *"Don't force AI where human social dynamics shine: How we used the banking 'Maker-Checker' consensus model to solve dispute resolution and cheating in online party games."*

---

## 7. Fluid Compute: Edge Caching, Version Handshakes & Polling Throttling

- **Date / Phase**: Phase 3 — Performance & Scale
- **The Problem / Context**:
  With hundreds of active players in Friendship Leagues, live trivia rooms, and leaderboard tracking, frequent unthrottled client polling against Supabase/PostgreSQL threatened to trigger serverless concurrency limits and inflate operational costs.
- **User Insight & Reason**:
  Multiplayer experiences must feel instantaneous and alive (60fps UI responsiveness), but the backend architecture must remain ultra-lean and cost-effective.
- **Architectural Landing**:
  We engineered **Fluid Compute**:
  - Implemented an edge caching layer using Next.js route handlers with state hash headers (`ETag` / version handshakes).
  - Clients send lightweight version checks; if the room state hasn't changed, the edge responds with `304 Not Modified` without querying the primary database.
  - Polling intervals adapt dynamically: 1s during active turns, throttling down to 10s during idle/intermission periods. Database queries dropped by over 72%.
- **Content Angle / Lesson for Builders**:
  > *"Scaling real-time multiplayer without paying for dedicated WebSocket clusters: How edge caching, version handshakes, and adaptive polling cut our database reads by 72% while preserving 60fps responsiveness."*

---

## 8. Anti-Jargon Lexicon & Dignified Editorial Brand Identity

- **Date / Phase**: Phase 2 — Brand Identity & Design System
- **The Problem / Context**:
  Early iterations accumulated intimidating pseudo-academic phrasing (*"Gauntlet"*, *"Intellectual Pillars"*, *"Review Cadence"*) and UI buttons cluttered with emoji sandwiches (`⚡ Start Gauntlet 🚀`). This gave the product a conflicting vibe—part intimidating academic lecture hall, part cheap gamified casino.
- **User Insight & Reason**:
  True intellectual mastery means speaking with simplicity, elegance, and clarity. Fey must feel like an editorial literary salon—warm cream parchment, forest olive, deep wine red—where scholars feel respected, not patronized with emojis.
- **Architectural Landing**:
  - Established a strict **Anti-Jargon Lexicon** in [`docs/BRAND_IDENTITY.md`](./BRAND_IDENTITY.md) and [`GEMINI.md`](../GEMINI.md):
    - *Challenge* instead of *Gauntlet*.
    - *Topic Categories* instead of *Intellectual Pillars*.
    - *When Answers Are Shown* instead of *Review Cadence*.
    - *Speaking Time* instead of *Speaking Sprint Duration*.
  - Enforced a **No-Emoji Rule for UI Controls**, replacing raw emojis with clean Lucide vector icons (`<Crown />`, `<Users />`, `<Flame />`).
  - Restricted color tokens strictly to semantic roles: `--terra` (Wine Red) for primary action CTAs only, `--olive` for framing/badges, `--gold` for earned XP/streaks only.
- **Content Angle / Lesson for Builders**:
  > *"The Anti-Jargon UX Manifesto: Why we banned pseudo-academic words and emoji clutter to build a dignified intellectual product that users take seriously."*

---

## 9. Lossless Guest Account Conversion & Identity Migration

- **Date / Phase**: Phase 2 — Authentication & Retention
- **The Problem / Context**:
  Forcing a user to create an account before playing a game or joining a friend's trivia drop causes 60%+ drop-off. But if guests play as an anonymous user, signing up later often wipes their accumulated streak, XP, and league match history, or creates duplicate player cards on the leaderboard.
- **User Insight & Reason**:
  Never interrupt the fun with a login wall, but never throw away a guest's achievements when they decide to commit. The transition from curious guest to registered scholar must be seamless.
- **Architectural Landing**:
  - Guests receive a persistent deterministic local UUID upon landing. All games, streaks, and XP accumulate in local Zustand storage.
  - When the user triggers an authenticated action (or accepts the "Save Your Progress" prompt), our Supabase auth handler runs a lossless reconciliation pipeline (`track_streak_flow`, `convert_guest_account`).
  - Guest records in Supabase tables (`trivia_scores`, `league_participants`) are atomically updated to the new user ID, preventing duplicate records and preserving historical data.
- **Content Angle / Lesson for Builders**:
  > *"The Zero-Friction Funnel: How to let users play immediately as guests without losing their streaks, scores, or league history when they finally sign up."*

---

## 10. Loss Aversion via Scholar's Seals (Rethinking the Punishment Streak)

- **Date / Phase**: Phase 1 & 2 — Habit Formation & Retention
- **The Problem / Context**:
  Traditional streak mechanics (e.g. Duolingo's strict daily reset) rely heavily on anxiety and guilt. When a busy user inevitably misses a day due to an emergency, losing a 45-day streak causes demotivation and immediate app abandonment.
- **User Insight & Reason**:
  Fey represents thoughtful, lifelong learning. A streak should reflect dedication and intellectual merit, not algorithmic punishment. If someone has worked hard, their progress should be protected.
- **Architectural Landing**:
  We introduced **Scholar's Seals** (Streak Freezes):
  - Every scholar starts with 1 default seal that automatically protects an active streak if they miss a single day.
  - Instead of forcing cash micro-transactions to buy streak repairs, users earn replacement seals by maintaining clarity ratings or by redeeming accumulated merit XP (150 XP).
  - The store hydration pipeline (Migration v8) automatically reconciles missed calendar days against active seals without requiring server roundtrips.
- **Content Angle / Lesson for Builders**:
  > *"Rethinking the streak: Why anxiety-driven gamification causes churn, and how we used earned 'Scholar's Seals' to replace streak anxiety with dignified retention."*

---

## 11. Local-First Audio Capture & In-Room Audio Retry Flow

- **Date / Phase**: Phase 1 — Feynman Sprints & Audio Engine
- **The Problem / Context**:
  Vocal articulation requires real microphone capture. Uploading raw audio blobs to S3/Cloudflare R2 on every 90s trial recording creates massive storage bloat, latency, and privacy anxiety for users who don't want imperfect speech recordings stored in the cloud.
- **User Insight & Reason**:
  People are naturally self-conscious about speaking aloud. They need a safe, private space to record, listen back, evaluate their clarity, cringe, and re-record until they are proud of their articulation—before anything leaves their device.
- **Architectural Landing**:
  - We built an entirely client-side audio pipeline using browser `navigator.mediaDevices.getUserMedia` and `MediaRecorder`.
  - Recordings are encoded directly into Base64 within Zustand and persisted in `localStorage`.
  - The UI provides an immediate **In-Room Review & Retry** interface with animated waveform bars. Only when a user explicitly chooses to publish a dispatch to the community salon does the client serialize the audio for peer sharing.
- **Content Angle / Lesson for Builders**:
  > *"Designing for speech anxiety: Why local-first browser audio capture and instant self-review transformed user confidence in our voice-first learning app."*

---

## 12. Constellation Knowledge Graph with Cluster Orbit Scaling

- **Date / Phase**: Phase 2 — Discover & Knowledge Exploration
- **The Problem / Context**:
  Standard learning apps display progress as linear checklists or boring category grids. These fail to convey intellectual breadth or show how different disciplines (Philosophy, Economics, Computer Science, Literature) interconnect.
- **User Insight & Reason**:
  An educated mind is not a checklist; it's a constellation of interconnected ideas. Users should feel like they are charting an intellectual galaxy where every completed session illuminates adjacent territories.
- **Architectural Landing**:
  - We built an interactive **Constellation Graph** using ReactFlow and custom celestial physics.
  - Multi-session depth is represented with **Cluster Grouping (`xN`)** and dynamic multi-ring orbit scaling, where deeply explored disciplines expand in gravitational pull.
  - Connected orbital nodes highlight unexplored adjacent disciplines, guiding the user toward intellectual balance.
- **Content Angle / Lesson for Builders**:
  > *"Stop building progress bars: How we used ReactFlow and celestial orbit mechanics to visualize intellectual growth as an interactive knowledge constellation."*

---

## 13. Multi-Tier Anti-Abuse Guard & Leaderboard Hardening

- **Date / Phase**: Phase 2 — Security & Integrity
- **The Problem / Context**:
  As soon as competitive Trivia and Friendship Leagues went public, automated scraping bots and script injections (specifically patterns like `Crash-VU` and `%VU%`) began posting impossible scores (e.g., 100 questions answered in 2 seconds) and polluting community leaderboards.
- **User Insight & Reason**:
  A competitive intellectual leaderboard loses 100% of its value the second users believe the top ranks are cheated. Leaderboard integrity is a core product trust pillar.
- **Architectural Landing**:
  We implemented a layered security posture:
  1. Edge middleware filtering suspicious headless browser user agents and known bot signatures.
  2. SQL regex sanitizers catching bot aliases (`%VU%`) at the query level.
  3. Strict server-side verification: timestamps between question presentation and answer submission are checked against physical reading speed thresholds (rejecting sub-200ms submissions).
  4. Max XP caps per session and an automated safety desk with one-click admin purge controls.
- **Content Angle / Lesson for Builders**:
  > *"When the bots hit our leaderboard: 4 architectural defenses we deployed in 24 hours to protect competitive multiplayer integrity without harming real user latency."*

---

## 14. Client-Side HTML5 Canvas Broadside Proof Cards

- **Date / Phase**: Phase 1 & 2 — Social Growth & Proof of Work
- **The Problem / Context**:
  Users love bragging about a 10/10 trivia score, a debate victory, or an eloquent speech session on Twitter/X or WhatsApp. However, relying on users to take raw phone screenshots yields inconsistent, ugly crops, low contrast, and cut-off UI elements.
- **User Insight & Reason**:
  Give users an aesthetic artifact they are proud to frame and post—reminiscent of a historic 18th-century broadside proclamation with elegant typography, parchment textures, and earned scholarly seals.
- **Architectural Landing**:
  We built a dedicated client-side HTML5 Canvas generator (`lib/feynman-card-canvas.ts`):
  - In a single click, it renders a pixel-perfect 1200x630 high-DPI image in memory.
  - Embeds authentic serif typography, golden laurel borders, user credentials, and score breakdowns.
  - Writes directly to the system clipboard as a PNG (`navigator.clipboard.write`) for instant paste into social apps, bypassing server image rendering costs.
- **Content Angle / Lesson for Builders**:
  > *"Why we built an in-browser HTML5 Canvas generator instead of server-side OG rendering for user share cards: 0ms latency, zero server compute bills, and 1-click clipboard pasting."*

---

## 15. The Two-Minute Impromptu Rule (Exposing Explanatory Depth)

- **Date / Phase**: Phase 1 — Feynman Core
- **The Problem / Context**:
  When prompted with a complex intellectual topic, users instinctively retreat into "research mode"—reading Wikipedia articles and taking notes for 20 minutes before speaking. This perpetuates the very problem Fey was built to solve: the *Illusion of Explanatory Depth*.
- **User Insight & Reason**:
  You only know what you actually understand when forced to articulate it off the cuff without notes. We needed an uncompromised sprint mode for scholars who want to test their real vocal clarity under pressure.
- **Architectural Landing**:
  We introduced the **Two-Minute Impromptu Sprint**:
  - Completely bypasses research and note-taking interfaces.
  - Presents a randomized thought-provoking topic with an instant 3-second countdown directly into a 90-second recording sprint.
  - Immediately plays back the unedited audio recording for self-evaluation on a 1–5 clarity scale.
- **Content Angle / Lesson for Builders**:
  > *"The Illusion of Explanatory Depth: How our 'Two-Minute Impromptu Rule' forces users to stop passive reading and prove true understanding through constrained vocal delivery."*

---

## 16. Episodic Pacing: Sequential Drop Unlocks in Friendship Leagues

- **Date / Phase**: Phase 2 — Retention & Social Play
- **The Problem / Context**:
  When multi-round trivia tournaments unlocked all questions immediately, over-eager players would binge the entire tournament in one evening, leaving slower friends behind and killing ongoing group conversation in the WhatsApp chat.
- **User Insight & Reason**:
  The magic of friendship leagues is the shared water-cooler discussion each day ("Did you get question 4 on the Berlin Conference?"). Pacing creates shared cultural rituals.
- **Architectural Landing**:
  - We restructured Friendship Leagues into **Episodic Daily Drops**:
    - Each drop unlocks sequentially at midnight, accompanied by a synchronized countdown timer.
    - Added creator flexibility: League hosts can trigger "Creator Extra Drops" or toggle "Unlimited Mode" for weekend party gatherings.
    - Synchronized daily drop schedules across devices via Supabase with automatic local hydration fallback.
- **Content Angle / Lesson for Builders**:
  > *"Why bingeable content kills social retention: How sequential daily drops turned one-off trivia games into a sustained multi-week ritual for groups of friends."*

---

## 17. Unified Mathletics Leagues: Instant Sprint Duels & Multi-Day Marathons

- **Date / Phase**: Phase 2 — Social Play & Mathematical Agility
- **The Problem / Context**:
  Mathletics previously only offered 1v1 challenge links that were fire-and-forget: once a friend opened the link, their score stayed locked in their local browser. Neither friend could view a combined scoreboard, see who had answered, or benchmark against other peers who received the same link. Furthermore, users wanted both instant 5-minute party duels and multi-day group tournaments without managing two distinct products.
- **User Insight & Reason**:
  When you finish a math sprint, your competitive drive is at its peak. You want to immediately duel your friends on the exact same 10 questions you just solved, and you want a persistent live leaderboard showing everyone who accepted the challenge. For study groups, having a multi-day marathon with daily drops keeps the group active over weeks.
- **Architectural Landing**:
  We built a single unified architecture supporting both formats seamlessly:
  1. **Dual Format Model (`MathleticsLeague`)**: `durationDays: 1` acts as a **Sprint Duel** (one round, single attempt locked per player), while `durationDays >= 3` acts as a **Marathon Tournament** (daily drops with cumulative agility scores).
  2. **Pre-Seeded Question Inheritance**: Launching "Create Friend Duel" straight from a finished sprint auto-seeds `day_1` with the exact 10 questions the creator just completed, auto-submits their existing score, and generates a shareable league URL.
  3. **Deterministic Seeded RNG**: Marathon leagues deterministically generate identical question sets per day from the league code seed, ensuring absolute mathematical fairness across all participants without central server coordination during gameplay.
  4. **Agility Scoring Integration**: Velocity multipliers (+50 pts for <4s answers, +30 for <8s, +15 for <12s) are preserved as canonical `agility_score` in dedicated Supabase tables (`mathletics_leagues`, `mathletics_scores`), with resilient local storage hydration for zero-backend environments.
- **Content Angle / Lesson for Builders**:
  > *"Why build two separate games when 1 data model can power both? How combining instant 1v1 duels and multi-day tournaments into one deterministic architecture gave our math game a live viral growth loop."*

---

## 18. Physical Continuity & Design Engineering Standards Across the Fey Parlor

- **Date / Phase**: Phase 2 — UX Polish & Tactile Motion
- **The Problem / Context**:
  As games were added to the Fey Parlor (Articulate, Naija Trivia, Mathletics, The Podium), their interactive segmented controls, tab switchers, and game cards suffered from inconsistent feedback. Navigation tabs were swapping with jarring CSS color cuts, while the Games Hub contained raw emojis that broke the classical editorial design system.
- **User Insight & Reason**:
  A platform built on rigor and intellectual dignity should feel tactile, grounded, and physically cohesive. High-taste software uses motion to communicate state transitions and spatial continuity, ensuring users never feel disoriented when switching modes.
- **Architectural Landing**:
  We adopted modern design engineering specifications (codified into `.agents/skills/ui-motion/SKILL.md`):
  1. **Sliding Spring Indicators (`layoutId`)**: Navigation tabs across Naija Trivia (`activeTriviaTabPill`), Mathletics (`activeMathleticsTab`), and Articulate (`articulateModePill`) were upgraded with Framer Motion spring physics (`stiffness: 450, damping: 32`), creating a unified, continuous gliding pill.
  2. **Preserving Rich Parlor Game Visuals**: Retained the high-fidelity 3D Apple-style emoji illustrations and floating momentum graphics on the Games Hub (`/games`), while refining segmented tab controls and mode toggles across game setup screens.
  3. **Compositor-Only Performance**: Enforced strict GPU-composited animations (`transform` and `opacity` only) with tactile press-down states (`active:scale-[0.98]`).
- **Content Angle / Lesson for Builders**:
  > *"From janky tab cuts to physical glass: How codifying a design engineering motion skill transformed 4 disconnected web games into an interconnected, tactile parlor experience."*

---

## 19. Configurable Calculation Velocity: The 25-Second Mental Math Floor

- **Date / Phase**: Phase 2 — Mathematical Agility & Pacing Customization
- **The Problem / Context**:
  A uniform 25-second countdown timer for all mental math challenges was exhilarating for speed demons but alienating for participants tackling multi-step algebra, probability, or geometry problems requiring structured scratch-free reasoning. Conversely, removing the clock entirely destroyed the Feynman sprint principle that forces rapid intuitive estimation over brute-force calculation.
- **User Insight & Reason**:
  Scholars and study groups have varying calculation cadences. Users requested the flexibility to pick question duration, but with a strict floor (25s shortest) so that the game never loses its core sprint tension or allows tab-switching / calculator abuse.
- **Architectural Landing**:
  We introduced **Turn Duration Customization** with a hard minimum floor:
  1. **Canonical Duration Presets**: `25s` (Blitz), `45s` (Standard), `60s` (Deliberate), `90s` (Extended) with a strict validator (`Math.max(25, Number(timer) || 25)`).
  2. **End-to-End Pacing Propagation**: Configurable across Solo Sprints, League Creation (`CreateMathleticsLeagueModal`), deterministic League State (`questionTimerSeconds`), API routes (`/api/mathletics/league`), and portable URL share parameters (`tim=45`).
  3. **Adaptive Velocity Bonuses & Critical Urgency**: Speed bonuses scale proportionally with the selected turn duration (`timeLeft / questionTimerSeconds`), and visual countdown urgency (forest olive shifting to crimson pulse) dynamically activates when `timeLeft <= min(7, round(questionTimerSeconds * 0.25))`.
- **Content Angle / Lesson for Builders**:
  > *"Give users agency without sacrificing your product's core constraint: How establishing a 25-second minimum floor let players customize pacing while preserving genuine mental math velocity."*

---

## 20. Spatial Partitioning: The Study vs. The Parlor (Resolving Dashboard Cognitive Overload & Progressive Day 0 Disclosure)

- **Date / Phase**: Phase 2 — UX Architecture & First-Time User Experience
- **The Problem / Context**:
  Early user feedback revealed that first-time visitors felt intimidated and overwhelmed upon onboarding. A newcomer with 0 sessions was greeted by a dense dashboard presenting a multi-control topic card, 4 flashy multiplayer game showcases (The Podium, Articulate, Naija Trivia, Mathletics), 3 unstarted daily quests, an empty ledger displaying 0s across the board, and 9 locked achievement icons. The actual explanation of the Feynman ritual (*01 Read 15m → 02 Speak 90s → 03 Review*) was buried at the bottom below the games. As a result, the app's primary purpose was lost to the arcade games.
- **User Insight & Reason**:
  Virality and community games are crucial growth engines (bringing groups to Fey), but they must not compromise or overshadow the product's core identity: deep intellectual inquiry and vocal articulation. A new user needs crystal-clear spatial hierarchy: **The Study** for daily personal habit formation, and **The Parlor** for social sparring and party play.
- **Architectural Landing**:
  1. **Spatial Separation via Fluid Spring Tabbed Navigation**: Introduced a high-taste segmented switcher (`layoutId="active-dashboard-tab"`, `SPRING_PILL`) cleanly partitioning the dashboard into **`Daily Practice & Study`** (accented with wine red `--terra` and `Feynman Sprint` badge) and **`The Parlor & Games`** (accented with bronze gold `--gold` and live indicator `● 4 Games`).
  2. **Day 0 Welcome & Progressive Disclosure**: For scholars with 0 completed sessions, an animated orientation banner delivers human, welcoming copy: *"Ready to find your voice? Pick today's topic and explain it in your own words."*
  3. **Elevated Feynman Ritual Orientation**: The 3-step walkthrough (*01 Deep Research → 02 Vocal Synthesis → 03 Reflect & Expand*) was elevated directly beneath Today's Question, giving newcomers immediate clarity on the loop before any scrolling.
  4. **De-Cluttered Daily Inquiry Card**: Purged the redundant `Games` button from the inquiry action bar, centering the user on two clear CTAs: `Begin Research (15m)` or `Quick Test: Impromptu (90s)`.
  5. **Framer Motion Variant Cascade**: Created `tabContentVariants` with named variants (`hidden`, `visible`, `exit`) to ensure smooth staggered transition across tab switches without blocking Framer Motion variant inheritance down to child cards.
- **Content Angle / Lesson for Builders**:
  > *"When your product combines a solo daily habit with viral multiplayer games, don't sandwich them on one page. How spatial partitioning ('The Study' vs. 'The Parlor') and progressive Day 0 onboarding cut cognitive overload without sacrificing viral community growth."*




---

## 21. Articulate Match Ledger: Counting Hours That "Play Again" Used to Erase

- **Date / Phase**: Phase 2 — Admin Analytics & Milestones
- **The Problem / Context**:
  We wanted to celebrate a "500 hours played on Articulate" milestone, but couldn't trust any number. `articulate_rooms` holds one mutable row per room, and the `reset_game` ("Play Again") action wiped `active_play_seconds`. A group that played five back-to-back matches in one room counted as one, so naively summing room rows would always undercount.
- **User Insight & Guiding Philosophy**:
  Milestones are a community story ("Scholars have spent 500 hours on Articulate"), so the number has to be both durable and generous in the right way. *Player hours* (match time × players) is the headline metric games use to celebrate; *game hours* (wall-clock match time) is kept alongside it for honesty.
- **Architectural & Product Landing**:
  1. **Append-only `articulate_matches` ledger**, upserted on `(room_code, started_at)` when a match finishes *and* just before "Play Again" resets the room, so retries and double triggers never double count.
  2. **No migration needed for the past**: totals = logged matches + any match still living inside a room row (in progress, abandoned, or finished before the ledger existed), reusing the existing `calculateMatchPlayTime` with its 10-minute idle cap.
  3. **Server-only table** (RLS on, no public policies, written with the service role) so players can't inflate the milestone.
  4. **Admin milestone card** with a progress bar to the next milestone ladder step (100 → 250 → 500 → 1000 hrs) and a visible data-quality note (logged vs. estimated matches).
- **"Building in Public" Content Takeaway**:
  > *"If your game has a 'Play Again' button, check what it deletes. Ours silently erased the history we needed to celebrate our first big milestone — the fix was a 30-line append-only ledger."*

---

## 23. Resilient Cross-Device Real-Time Syncing: Dual-Table Database Fallback & Zero-Loss Local Score Auto-Heal (Fixing Mathletics League Score Isolation)

- **Date / Phase**: Phase 2 — Multiplayer Infrastructure & Distributed State Syncing
- **The Problem / Context**:
  When two scholars played a Mathletics League tournament (e.g. Wana_Bee on desktop vs Sage on mobile via share URL `.../games/mathletics/league/RUZSNQ?...`), scores were completely isolated: Wana_Bee only saw their own score (821 pts, "1 Scholars Contending") and Sage only saw their own score (685 pts, "1 Scholars Contending").
  Root causes identified:
  1. **Missing Database Table in Production**: The dedicated tables (`mathletics_leagues` / `mathletics_scores`) added in the latest schema had not yet been executed in production Supabase, causing score insertions to silently fail (`stored: false`) and fall back to local device storage.
  2. **Foreign Key Lockout**: Even if a score was submitted, foreign key references to `mathletics_leagues(code)` failed because decentralized URL-generated leagues weren't pre-persisted in the database.
  3. **No Client Revalidation / Polling**: `MathleticsLeagueClient` only read from `localStorage` once on mount and never polled `/api/mathletics/league?code=...` for updates.
- **User Insight & Guiding Philosophy**:
  Multiplayer competition requires instant, reliable trust. Players must see each other's live standings without ever losing a completed round to database errors, missing schema migrations, or network partitions.
- **Architectural & Product Landing**:
  1. **Dual-Table Resilient Storage (`lib/mathletics-db.ts`)**: Designed a zero-dependency database layer that tries dedicated `mathletics_leagues`/`mathletics_scores` first, and if PostgreSQL returns error `42P01` (table does not exist), automatically and transparently falls back to the existing, battle-tested `friendship_leagues` and `league_scores` tables.
  2. **Auto-Restoration from URL Metadata**: If a league code was shared via URL parameters (`?t=...&c=...&d=...`), the API automatically upserts the league row in the database on first score submission or fetch, satisfying foreign keys and allowing zero-database shareable tournaments to sync instantly.
  3. **Self-Healing Local Score Backfill**: When `MathleticsLeagueClient` mounts, it inspects local storage for completed rounds not yet confirmed in the cloud and automatically background-syncs them to the API. This guarantees Wana_Bee and Sage's existing completed scores are immediately published to the live leaderboard without requiring a replay.
  4. **Active Polling & Window Focus Sync**: Added background polling (every 15s when not answering) plus instant re-fetch on window `focus` and tab `visibilitychange`.
- **"Building in Public" Content Takeaway**:
  > *"Never let an unapplied database migration break a live multiplayer game. How dual-table database fallback and client-side score auto-healing saved our real-time tournament leaderboard from silent data silos."*


- **Date / Phase**: Phase 2 — Admin Security, Engagement Analytics & Brand Polish
- **The Problem / Context**:
  1. **Security**: Admin API routes (`/api/admin/users`, `/api/admin/features`, `/api/admin/overview`, `/api/feedback`, `/api/safety/report`) had no server-side authentication checks, and the passcodes (`fey2026`, `admin`) were checked in client-side JS.
  2. **Fragmented Game Hours & Identity**: Sprints, Trivia Leagues, Solo Trivia, Mathletics, and Articulate lived in separate tables keyed by a mix of `user_id`, `device_id`, and `username`. There was no single view of hours played per game or who the top scholars were across games.
  3. **Overview Clutter & Jargon**: Half of the Overview tab was a static PostHog placeholder with hardcoded event rows, user counts disagreed between cards and tabs, and copy/colors violated the anti-jargon and color-semantics rules.
- **User Insight & Guiding Philosophy**:
  An admin console should answer the founder's real daily questions at a glance: *How many hours are people spending in each game? How close is Articulate to 500 hours? Who are our most dedicated scholars across the whole platform, and are they happy?*
- **Architectural & Product Landing**:
  1. **HMAC-Signed `httpOnly` Session Cookie (`lib/admin-auth.ts`, `/api/admin/session`)**: Replaced client-side passcode checks with timing-safe server verification and an `httpOnly` cookie enforced by `isAdminAuthorized()` across all admin endpoints.
  2. **Cross-Game Engagement & Scholar Deduplication (`lib/admin-engagement.ts`, `lib/play-sessions.ts`)**: Aggregates hours, sessions, 14-day activity trends, and period-over-period deltas (`7d` / `30d` / `all`) across Articulate, Trivia, Mathletics, and Feynman Sprints, resolving player identities by `user_id`/`device_id` and normalized `username` into a unified **Top Scholars** ranking.
  3. **Overview & Brand Cleanup (`components/admin/*`)**: Replaced the static PostHog box with live game engagement, Top Scholars, and the 3 newest feedback comments; added sample-size indicators (`n = X`), CSV export, ISO timestamp sorting, and native `<dialog closedby="any">` light-dismiss modals.
- **"Building in Public" Content Takeaway**:
  > *"Replace vanity placeholders in your admin dashboard with the two things that actually drive community momentum: cumulative hours played per game toward your next public milestone, and a unified leaderboard of the power users carrying your platform."*

---

## 24. Hard Border Structural System, Maroon Focal Anchor & Academic Serif Hierarchy (Killing Soft AI Template Tropes)

- **Date / Phase**: Phase 2 — Editorial UI Integrity & Anti-AI Template Refresh
- **The Problem / Context**:
  1. **Fuzzy Soft AI Shadows**: Default LLM generation templates rely excessively on washed-out, low-contrast drop shadows (`shadow-sm`, `shadow-xl`) and invisible hairline boundaries (`rgba(68,78,44,0.08)`). This created floating, unanchored cards that looked AI-generated rather than deliberately crafted.
  2. **Timid Accent Usage**: The brand's signature maroon (`--terra`, `#7A1C2E`) was being diluted as faint 6% opacity background tints and subtle badges rather than commanding attention as a high-impact action block.
  3. **Generic Monospaced LLM Micro-Labels**: Uppercase monospaced gray tracker labels (`DAILY DISPATCH - WEDNESDAY, NOVEMBER 4`) screamed default LLM component output.
  4. **Rigid Card Monotony**: Every single card shared an identical cream background (`#FDFCFA`), uniform padding, and flat hierarchy, making the study dashboard feel like a static list rather than an active, breathing intellectual workspace.
- **User Insight & Guiding Philosophy**:
  Fey is a scholarly editorial publication, not a generic SaaS utility. A bespoke study app should feel tactile and printed: sharp, deliberate solid borders, bold focal action points that immediately direct human intent, distinct visual weight for active tasks, and academic serif headers paired with clean sans-serif body text.
- **Architectural & Product Landing**:
  1. **Hard Border Structure (`app/globals.css`)**: Replaced fuzzy card shadows with sharp, deliberate 1px and 2px solid structural borders (`rgba(44, 49, 28, 0.26)` and `--border-strong: #2E341E`). Cards now look built with architectural integrity rather than softly rendered.
  2. **Signature Maroon Anchor Block (`.btn-terra`)**: Hardened `.btn-terra` into a confident, solid wine-red block (`#7A1C2E`) with a tactile 3D bevel bottom border (`#58101E`) and high-contrast white text. Purged faint maroon gradient washes that diluted brand contrast.
  3. **Elevated Academic Serif Typography**:
     - Connected Google Font `Lora` directly into Tailwind CSS v4 via `@theme { --font-serif: var(--font-serif), 'Lora', Georgia, serif; }`.
     - Elevated the main feature heading (`"You started. Don't stop."`) into a commanding editorial serif headline.
     - Ditched uppercase monospaced gray tracker micro-labels in favor of a clean, high-contrast publication masthead (`Daily Dispatch / Wednesday, November 4`) and dignified section headers across ledgers and quests.
  4. **Asymmetric Workspace Elevation (`.surface-hero`)**:
     - Elevated the active primary inquiry card with a bold 4px solid maroon top accent line (`border-top: 4px solid var(--terra)`), crisp `#FFFFFF` workspace surface, and an "Active Articulation Workspace" structural eyebrow bar.
     - Subordinated secondary cards (Daily Vows, Feynman Ritual, Consistency Ledger) with distinct warm tints (`bg-[var(--bg-panel)]/35`) and varied internal padding (`p-5` vs `p-7`), breaking rigid symmetry and giving the page a natural, dynamic visual rhythm.
  5. **Purging the "Claude Beige" Canvas & Universal Emoji Eradication**:
     - **Canvas Tone Shift**: Replaced Claude's ubiquitous `#F4EFE6` peach-beige with an authentic archival chalk canvas (`--bg-base: #F7F5F0`, `--text: #16190D`), layered with an ultra-faint physical paper micro-stipple overlay (`body::before`) that feels like heavy letterpress book stock rather than flat digital hex.
     - **Total Emoji Purge**: Eradicated all system emojis (`🤖`, `🔥`, `🛡️`, `📜`, `🎮`, `🎤`, `🎭`, `🇳🇬`, `📐`, `🎙️`, `🌌`, `🎯`, `🌱`) from the interface in favor of bespoke 1.5px vector line icons (`CategoryIcon.tsx`, Lucide) and Roman numeral study tiers (`I · Novice`, `II · Scholar`, `III · Master`).
- **"Building in Public" Content Takeaway**:
  > *"Every AI-generated app defaults to the same flat Claude beige and sprinkles emojis across every button. Shifting to an archival chalk canvas with tactile micro-grain and replacing emojis with razor-sharp vector line art is the single fastest way to take your product from 'LLM prototype' to bespoke editorial software."*

---

## 25. Desktop Companion as a Technical PM Scribe: Mid-Meeting Side-Notes, Active Document Insertion & Task Tracker Templates

- **Date / Phase**: Phase 2 — Desktop Companion (Ollie Native Architecture)
- **The Problem / Context**:
  1. **Binary Meeting Mode**: Previously, clicking or talking to Ollie during a live meeting abruptly aborted the meeting, stopped audio capture, and generated early notes. A Product Manager in an ongoing sprint planning or architectural review could not capture technical debt or assign action items in real time without destroying the active recording.
  2. **Unsolicited Screen Vision & Drafting**: Automatic screenshotting on every ambient audio trigger caused false ticket drafting into random windows when the PM was merely typing or conversing.
  3. **Rigid Single-Artifact Assumption**: AI desktop assistants typically assume all PM work is Jira ticket creation. In reality, PMs maintain custom task trackers (in Superhuman, Obsidian, Notion, Google Docs) and need formatted tech-debt bullets (`Component`, `Impact`, `Remediation`) inserted directly at their active cursor position.
- **User Insight & Guiding Philosophy**:
  A true executive assistant doesn't force you to choose between continuous meeting transcription and capturing mid-meeting epiphanies. When a technical debt item or critical bug is spotted mid-call, a PM should be able to tap their desktop companion, dictate the note, see it formatted and pasted directly into their open Superhuman draft or Obsidian ledger, and have the companion seamlessly resume meeting transcription in the background.
- **Architectural & Product Landing**:
  1. **Dual-Recorder Architecture & Mid-Meeting State Machine (`macos-overlay.m`)**:
     - Separated continuous background meeting capture (`meetingRecorder`) from conversational interaction capture (`recorder`).
     - Tapping Ollie mid-meeting triggers `isMidMeetingSideNote`, cleanly pausing `meetingRecorder` without terminating the session or resetting the audio buffer.
     - Once the user's side-note is transcribed, synthesized, pasted via native Quartz HID events into the frontmost document, and verbally confirmed, `onFinishedSpeakingTurn` automatically calls `[meetingRecorder record]` and restores the visual meeting state (`🫒📝`).
  2. **PM Technical Scribe Intelligence (`sysPrompt`)**:
     - Added specialized structured synthesis for **Technical Debt** (`[Tech Debt] **Title**: Flaw | **Impact**: Risk | **Remediation**: Fix`), **Action Items** (`[Action Item] **Owner**: Task (Due: Date)`), and **Decisions**.
     - Injected a customizable `~/Documents/Ollie Templates/task-tracker-format.md` template into the LLM context alongside the Jira ticket template.
     - Added explicit negative constraints prohibiting unsolicited ticket drafting unless explicitly commanded.
  3. **Strict Tap-to-Talk Default & Privacy Boundary**:
     - Microphone is completely halted and closed by default in idle mode (`handsFreeWakeEnabled = NO`), eliminating phantom audio triggers and orange mic indicators.
     - Hands-free wake is strictly opt-in with a recalibrated close-proximity vocal threshold (`-28 dB`).
- **"Building in Public" Content Takeaway**:
  > *"Desktop AI assistants fail when they treat meetings as a monolith. Real product managers need mid-meeting side-channel logging: pause continuous recording, synthesize a structured technical debt bullet into your active Superhuman draft, and resume listening to the call without dropping a single beat."*

---

## 26. Behavioral Nudges, In-Sprint Speaking Scaffolding & Next-Day Return Loops

- **Date / Phase**: Phase 2 — Behavioral Growth, Retention Mechanics & Cross-Pollination
- **The Problem / Context**:
  1. **Blank-Mic Anxiety & Mid-Sprint Bailouts**: Speaking aloud into a live microphone has the highest activation energy in the app. Users often hesitated during the 3-2-1 countdown, froze mid-recording around the 30-second mark, or clicked `Leave session` before completing their Daily Voice quest.
  2. **Games as Isolated Silos**: Casual game players on Naija Trivia completed rounds and either left or replayed in isolation without ever crossing over into Fey's core vocal articulation loop.
  3. **Post-Completion Dead End**: The `StageComplete` screen rewarded users with XP and share cards, but ended with a dead-end `Back to Dashboard` button—missing the peak dopamine moment to lock in a commitment for Day 2 and Day 3.
- **User Insight & Guiding Philosophy**:
  Completion screens should never be a full stop; they should be a bridge to the next habit loop. By reducing microphone cold-start friction during the sprint, offering a low-friction 45-second downsell on exit intent, cross-pollinating missed trivia concepts into 60-second voice challenges, and letting users lock in tomorrow's topic before leaving, we turn isolated sessions into a compounding multi-day habit.
- **Architectural & Product Landing**:
  1. **In-Sprint Speaking Scaffolding (`app/session/[id]/page.tsx`)**:
     - Added a dynamic **Opening Sentence Starter** (`getFirstSentenceStarter`) displayed during the 3-2-1 countdown and first 15 seconds of recording to eliminate blank-mic hesitation.
     - Added a 3-stage **Timed Speaking Scaffold** (`getSpeakingScaffoldStep`) below the live waveform that smoothly transitions across elapsed time: *Step 1: Plain Definition (0–40%)* → *Step 2: Real-World Analogy (40–75%)* → *Step 3: Why It Matters (75–100%)*.
  2. **Exit-Intent Downsell Nudge (`app/session/[id]/page.tsx` & `store/useAppStore.ts`)**:
     - Intercepted `Leave session` / `Abandon` during active research or speaking with a dignified modal that highlights endowed progress (*"1 Step Away from Daily Voice"*) and offers a 1-click downsell (`Switch to 45s Quick Summary` via `speakingDurationSec: 45`), preserving the user's daily streak instead of letting them churn.
  3. **Game-to-Voice Cross-Pollination & 1-Shot Capped Redemption (`app/games/trivia/TriviaGameClient.tsx`)**:
     - Added a dual-action **Next-Tier Nudge** on Trivia Results:
       - **1-Shot Redemption (`Retry X Missed · Capped 85%`)**: Allows a single redemption pass on missed questions only (`hasUsedRedemption`), with recovery weighted at `0.5x` and hard-capped at `85%` (preventing 100% perfection via retries and preserving first-attempt leaderboard integrity while awarding `+2 Recovery XP` per redeemed answer).
       - **Play Fresh Deck**: Launches a brand-new unseen question deck immediately.
     - Added a **Turn a Missed Question into Mastery (+50 Bonus XP)** card that converts a missed trivia question (and its explanation) directly into a 60-second Impromptu Voice Challenge (`/session/[id]`).
  4. **3-Day Habit Momentum Track & 7-Day Study Schedule (`store/useAppStore.ts`, `app/library/page.tsx`, `app/session/[id]/page.tsx`, `app/page.tsx`)**:
     - Built a functional **3-Day Habit Momentum Track** rewarding the critical Day 1 → Day 2 → Day 3 retention cliff: Day 1 (`First Voice`), Day 2 (`+50 Bonus XP` automatically awarded in `completeSession`), and Day 3 (`+1 Streak Shield` automatically awarded in `completeSession`).
     - Upgraded the single-topic queue into a **7-Day Study Schedule** (`scheduledTopics` capped at 7 days, 1 topic per day across the next 7 calendar days via `getNext7ScheduleDays()`).
     - Added a dedicated **7-Day Schedule (`X/7`)** tab in `/library` (`app/library/page.tsx`) where users can view all 7 upcoming day slots, filter uncompleted topics by difficulty level (`Novice` / `Scholar` / `Expert`) and discipline in the Topic Finder Modal, and assign, swap, or launch scheduled topics.
     - On each calendar day (`date <= todayStr()`), the Dashboard (`app/page.tsx`) automatically promotes that day's scheduled topic into the Hero Workspace and triggers a **Welcome-Back Login Reminder Modal** (`Scheduled for Today · Ready`) with 1-click `Start Scheduled Topic (15m)` and `Impromptu (90s)` CTAs.
- **"Building in Public" Content Takeaway**:
  > *"Don't treat your completion screen or library as passive archives. Turn your Library into a 7-day study planner where learners lock in level-matched inquiries for the week ahead—and greet them each morning with the exact promise they made to themselves."*


## 27. In-App Sourced Research Pack & Speaking Cues

- **Date / Phase**: Phase 2 — Closing the Feynman Loop
- **The Problem / Context**: Research meant leaving Fey for Google, which broke flow and lost users before they returned to speak. Naive fix (ask Gemini to "summarize published works") risks hallucinated facts and fake citations, which would destroy trust in an app about real understanding.
- **User Insight & Guiding Philosophy**: Do the research for the learner, but keep it grounded and keep the learner active. Users choose their own highlights as retrieval cues; cues kickstart speech but must never become a script.
- **Architectural & Product Landing**:
  1. `POST /api/ai/research` retrieves real passages (Wikipedia, Europe PMC, OpenAlex), then Gemini summarizes ONLY that material with inline `[S#]` citations. Only cited sources are returned, each linking to a real URL/DOI. No sources found → graceful fallback to self-research.
  2. Three reading layers (Gist ~100w, Summary ~300w, Deep Dive ≤800w) plus sources. Cached per topic in localStorage (`fey-research-v1:<topicId>`).
  3. Text selection → "Add as cue". Cap: 500 words total across cues (no per-cue cap; over-limit selections are flagged, not truncated). Cues show during speaking, fade at 20s, with a Hide/Show toggle.
  4. Per-cue "Save to notes" checkbox (no interrupting prompt); saved cues insert live into the editor.
  5. The 30-word own-notes gate remains, so reading never replaces writing. Rules copy changed from "No AI summaries" to sourced reading pack.
  6. **Post-Session 3-Question Recall Check (`components/research/ResearchQuizCard.tsx`)**: Generated inside the same `/api/ai/research` call (with a deterministic source-sentence fallback when Gemini times out). Shown on `Session Complete` as a non-blocking bonus card awarding `+15 XP` per correct answer plus `+15 XP` Perfect Recall bonus (`+60 XP` max), locked to one claim per session (`fey-research-quiz-claimed:<sessionId>`).
- **"Building in Public" Content Takeaway**:
  > *"Don't let an LLM write your citations. Retrieve first, summarize second, and only show sources the summary actually used."*
