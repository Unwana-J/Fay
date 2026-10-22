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
