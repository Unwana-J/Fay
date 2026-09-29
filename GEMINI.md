# Project Memory & Architecture Context: Fey

This file serves as the permanent persistent context and memory for AI assistants working on **Fey**. It captures the product vision, core architecture, key design decisions, and rules established throughout development.

For the full specification, refer to [`docs/PRD.md`](./docs/PRD.md).

---

## 1. Product Vision & Philosophy

**Fey** (*"Think Deeper, Articulate Clearly"*) is an intellectual learning and vocal articulation platform built around the **Feynman Technique**:
- True understanding is proven when you can articulate a concept simply and concisely in your own voice under time constraints.
- Counteracts the "illusion of explanatory depth" created by passive reading or video watching.
- Classical, editorial, distraction-free aesthetic (forest olive, terracotta burgundy, antique gold, sage).

---

## 2. Key Product Decisions & Implemented Conventions

### 2.1. Topic Personalization & Preferences
- **Strict Isolation**: The daily suggested topic and roulette strictly draw from the user's selected interests (`favoriteCategories` and `enabledCategories`).
- **Store Migration v5**: Legacy unselected categories (like Psychology if not chosen during onboarding) are purged upon store hydration.
- **Focus Modal**: Users can click the Fey butterfly on the dashboard to trigger `FocusCategoryModal`, allowing targeted spinning on specific disciplines or navigating directly to `/discover`.

### 2.2. Audio Capture & Review Flow
- **Real Microphone Capture**: Both solo sprints (`/session/[id]`) and community salons (`/community/room/[roomId]`) use real browser microphone input via `navigator.mediaDevices.getUserMedia` and `MediaRecorder`.
- **In-Room Review & Retry**: Users can listen back to their recorded speech immediately after finishing and re-record before submitting.
- **Peer Playback**: In voting and closed salon phases, peer audio recordings are playable directly with animated waveform bars.
- **Persistence**: Audio clips are serialized to Base64 in Zustand local stores (`useAppStore`, `useCommunityStore`) and available in the user's `/library`.

### 2.3. Community Salons & Auth Flow
- **Decentralized URL Sharing**: Community rooms can be shared instantly via URL with base64-encoded state (`?code=...&r=...`), requiring zero database configuration to collaborate.
- **Auth Gate Experience**: If an unauthenticated or new user opens a room link, they are prompted to create their scholarly identity / login, and immediately redirected back into the active room without state loss.
- **Multi-Field Topic Search**: The `CreateRoomModal` supports fuzzy matching across title, category, and tags, as well as on-the-fly **Custom Topic** entry.

### 2.4. Games & The Parlor
- **The Podium (`/podium`)**: Party slide presentation game. Generates bold 5-slide decks with Gemini 3.8 Flash from 60+ hot-takes or custom topics. Features split-panel inline slide editing, photo/meme uploads with client canvas compression, presenter mode, and zero-database shareable deck links (`/podium/slides/[code]`).
- **Constellation Graph (`/constellation`)**: Interactive ReactFlow canvas showing topical proximity and recommending adjacent disciplines based on completed sessions.
- **Trivia Arcade (`/games/trivia`)**: 1,000+ curated questions with countdown timers, scoring multipliers, detailed explanations, and local deduplication.
- **Word Description Party Game (`/play`)**: Local multiplayer team game with speech recognition and Google Gemini AI referee (`/api/ai/validate`).
- **Dashboard Parlor Launcher**: 3-card quick-access parlor section on the dashboard for instant game play.

### 2.5. Habit Formation & Retention Mechanics
- **Impromptu Articulation (Two-Minute Rule)**: Direct-to-speech sprint option on the daily suggested topic that bypasses research for users who want to prove their existing understanding in 90 seconds.
- **Daily Vows (3 Daily Quests)**: Deterministic daily micro-quests resetting at midnight (Daily Voice, Sustained Articulation, Conviction & Clarity) with claimable XP bonuses.
- **Loss Aversion (Scholar's Seal / Streak Freeze)**: Users hold seals (default 1) that automatically protect active streaks if they miss a single day. Additional seals can be acquired for 150 XP.
- **Store Migration v7**: Seamlessly hydrates user profiles with streak shields, quest tracking, and difficulty mode preferences.

### 2.6. Viral Growth Loops & Social Proof
- **Portable URL State**: Notes and slide decks are compressed via `lz-string` directly into the URL (`/note/[code]`, `/podium/slides/[code]`), allowing instant public sharing without database dependencies.
- **Dynamic Server-Side OG Metadata**: Both notes and podium slides run through Next.js server components with `generateMetadata`, generating rich previews on WhatsApp, iMessage, Twitter/X, and LinkedIn.
- **Highlight-to-Tweet Tooltip**: Medium/Substack-style floating action pill on public dispatches; readers highlight any quote to tweet it formatted with attribution and source URL.
- **The Feynman Rebuttal Challenge**: High-converting contextual CTA replacing generic sign-up banners on shared notes and slides ("Disagree? Articulate your take in 90 seconds"), launching visitors straight into a 90s sprint on the same topic.
- **HTML5 Canvas Proof Card Generator (`lib/feynman-card-canvas.ts`)**: 1-click clipboard export of an aesthetic 1200x630 broadside proof card PNG for native image posting on social media.

---

## 3. Tech Stack & State Management
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, CSS Custom Properties (`var(--fey-...)`), Framer Motion, Lucide icons
- **State Stores**:
  - `store/useAppStore.ts`: `useAppStore` (profile, daily topic, solo sessions, library, streak, daily quests, trivia stats, v7)
  - `store/usePodiumStore.ts`: `usePodiumStore` (phase state machine, slide editor, custom hot takes, saved decks)
  - `lib/community-store.ts`: `useCommunityStore` (rooms, room history, followed scholars)
  - `lib/game-store.ts`: `useGameStore` (party game state)
- **AI Endpoints**: Next.js App Router API handlers (`/api/ai/*`) using Google Gemini (`gemini-3.8-flash`)
- **Brand & Domain**: Fey under Lokin Labs (`fey.lokinlabs.com.ng`)

---

## 4. Current Architecture State & Next Horizons

| Layer | Current Status (Phase 1) | Target Next Status (Phase 2 & 3) |
| :--- | :--- | :--- |
| **Data Storage** | Local-First (`localStorage` via Zustand v7) | Supabase / PostgreSQL cloud synchronization |
| **Audio Storage** | Base64 in LocalStorage | Cloudflare R2 / AWS S3 pre-signed storage |
| **Room Real-time** | URL Payload + Poll/Refresh | WebSockets / LiveKit live synchronized salons |
| **Speech Review** | Self-rating (1–5) | Whisper transcription + Gemini Socratic critique |
