# Product Requirements Document (PRD): Fey

**Document Version:** 2.0.0  
**Status:** Active & Implemented  
**Last Updated:** September 2026  
**Platform Vision:** *Fey — Think Deeper, Articulate Clearly.*  
**Live Deployment:** `https://fey-eight-liard.vercel.app` (Custom domain: `fey.lokinlabs.com.ng`)

---

## 1. Executive Summary & Product Philosophy

**Fey** is an intellectual learning, vocal articulation, and social presentation platform engineered around the **Feynman Technique**:
> *"If you want to master something, teach it simply in your own voice."*

### 1.1. The Problem Space
Digital learning in the 2020s suffers from the **illusion of explanatory depth**:
* People bookmark hundreds of articles, watch hours of video essays, and skim newsletters, feeling informed.
* Yet when asked to explain even basic concepts aloud without notes, understanding breaks down immediately.
* Passive consumption produces neither retention, conviction, nor communication clarity.

### 1.2. The Solution
Fey solves this through a closed-loop active learning system:
1. **Timeboxed Research Sprints**: 10–15 minutes of structured reading and distillation in a focused editor.
2. **Vocal Articulation Under Pressure**: Real browser microphone capture enforcing a strict 60–180 second vocal explanation.
3. **Honest Self-Reflection & Growth**: Structured scoring on understanding, clarity, and communication, rewarded with XP and constellation nodes.
4. **Party & Parlor Social Games**: Turning intellectual articulation into a fun social experience through fast-paced party presentation generation (*The Podium*), live word description (*Online Articulate*), and cultural trivia (*Naija Trivia*).
5. **A Viral Distribution Engine**: Zero-database URL-portable dispatches, Substack-style quotation tools, contextual rebuttal challenges, and high-res social proof cards.

---

## 2. Target User Personas

| Persona | Core Motivation | Behavioral Traits | Fey Feature Fit |
| :--- | :--- | :--- | :--- |
| **1. The Self-Directed Polymath** *(e.g. Nana, 26, Product Builder)* | Wants to systematically master diverse disciplines (AI, economics, philosophy, history) and build a daily thinking habit. | Reads newsletters, hoards bookmarks, values personal intellectual growth, wants tangible proof of daily progress. | Deterministic Daily Topic, TipTap Research Editor, Activity Heatmap, ReactFlow Constellation, Daily Vows & Quests. |
| **2. The Verbal Articulator & Orator** *(e.g. Tunde, 31, Tech Lead & Speaker)* | Wants to eliminate filler words, speak with authority, and articulate complex technical ideas simply without jargon. | Prepares for conference talks, investor pitches, or team updates; struggles with rambling explanations under pressure. | Vocal Synthesis timer (90s limit), Audio Playback & Re-recording, Impromptu Speech Mode (Two-Minute Rule), Reflection Log. |
| **3. The Hot-Take Presenter & Party Host** *(e.g. Amara, 24, Creator & Host)* | Loves unhinged debates, dinner-party slide nights, and sharing spicy cultural opinions with friends. | Active on X/Twitter and TikTok; creates slideshows for fun; loves comedic storytelling and group banter. | **The Podium (`/podium`)**: Instant AI slide generation from spicy topics, slide editing with photo/meme uploads, presenter mode, portable URL sharing. |
| **4. The Social Scholar & Peer Learner** *(e.g. David, 22, University Student)* | Enjoys group study, intellectual camaraderie, and competing/collaborating with friends. | Studies in Discord/WhatsApp groups; motivated by peer validation, streaks, and community leaderboards. | Community Research Salons (`/community`), Decentralized URL rooms, In-room peer audio voting, Online Articulate (`/play`). |
| **5. The Curious Lurker (Acquisition Target)** *(e.g. Sarah, 28, Casual Twitter/LinkedIn user)* | Stumbles upon a shared slide deck or note snippet on X or WhatsApp; intrigued by a counter-intuitive opinion. | Skims feeds quickly; sceptical of traditional ed-tech; easily hooked by bold statements, debate, or interactive quotes. | Public Broadside Viewer (`/note/[code]`), Slides Viewer (`/podium/slides/[code]`), **The Rebuttal Challenge**, Highlight-to-Tweet quotes. |

---

## 3. Product Features & Functionalities Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               FEY DASHBOARD                                 │
│  Daily Dispatch ── Focus Roulette ── Suggested Sprint ── Quests ── Ledger   │
└──────────────┬───────────────────────────────┬──────────────────────────────┘
               │                               │
       ┌───────▼────────┐             ┌────────▼────────┐
       │  SOLO SPRINTS  │             │   PARLOR GAMES  │
       │ Research (15m) │             │ The Podium (🎤) │
       │ Vocal (90s)    │             │ Articulate (🎭) │
       │ Reflection     │             │ Trivia (🇳🇬)     │
       └───────┬────────┘             └────────┬────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
                ┌──────────────▼──────────────┐
                │    VIRAL SHARING & LOOPS    │
                │ Portable URLs (LZ-String)   │
                │ Rebuttal Challenge (90s)    │
                │ Highlight-to-Tweet Tooltip  │
                │ HTML5 Canvas Proof Cards    │
                │ Dynamic Server-Side OG      │
                └─────────────────────────────┘
```

---

### 3.1. Dashboard & Habit Formation (`/`)
* **Daily Dispatch Header**: Displays current date, active scholar rank, streak count with flame status, and rotating philosophical wisdom quotes (Copernicus, Feynman, Plutarch, da Vinci).
* **Suggested Topic Card**:
  * Deterministic daily topic seed (rotates midnight local time) strictly drawn from user's `enabledCategories`.
  * Multi-tag metadata: Category color badge, Difficulty badge (Novice, Scholar, Expert), and scaled XP reward (+100 to +200 XP).
  * Direct Actions:
    * `Begin Research (15m)`: Standard structured sprint.
    * `⚡ Impromptu Speech (90s)`: Direct-to-mic sprint for users who already know the concept (Two-Minute Habit Rule).
    * `🔀 Next Topic`: Cycles to another topic within user preferences.
    * `🎮 Games`: Direct link to parlor games hub.
* **Focus Category Modal**:
  * Triggered by clicking the animated Fey logo butterfly.
  * Displays discipline cards with active topic counts.
  * Allows selective spinning within a chosen category (e.g., Philosophy only) or resetting to all disciplines.
* **The Parlor & Games Showcase**:
  * Prominent 3-card quick-launcher on the dashboard directing users to *The Podium*, *Online Articulate*, and *Naija Trivia*.
* **Daily Vows & Quests Engine (Store v7)**:
  * 3 deterministic daily micro-quests resetting at midnight:
    1. *The Daily Voice*: Record at least one vocal Feynman articulation (+40 XP).
    2. *Sustained Articulation*: Speak for at least 45 seconds during vocal synthesis (+50 XP).
    3. *Conviction & Clarity*: Complete a sprint scoring 4 or higher on confidence (+60 XP).
  * Claimable XP mechanics with visual completion badges.
* **Consolidated Scholar Ledger**:
  * Displays: Completed Sprints, Deep Research Time, Vocal Synthesis Minutes, and Scholarly XP.
* **Activity & Mastery Visualizations**:
  * 52-week GitHub-style activity contribution heatmap.
  * Weekly sprint volume bar charts.
  * Scholar's Seal (Streak Freeze): Automatic shield against missed days, replenishment for 150 XP.

---

### 3.2. Solo Feynman Sprints (`/session/[id]`)
* **Stage 1: Deep Research (10–30 min)**:
  * Distraction-free TipTap rich text editor with headings, checklists, task items, and bullet points.
  * Visual countdown timer with pause/resume and low-time visual alerts.
  * Starter hints and core analogy suggestions.
* **Stage 2: Vocal Synthesis (60–180 sec)**:
  * Real browser microphone audio capture via `MediaRecorder` API.
  * Live animated waveform visualizer indicating input audio levels.
  * In-Sprint Review & Retry: Presenter can listen back to their recorded audio immediately, inspect timing, and re-record before final submission.
  * Base64 serialization saved in Zustand local store and accessible in the library.
* **Stage 3: Reflection & Socratic Self-Scoring**:
  * Three qualitative prompts:
    * *What was the most fascinating takeaway?*
    * *What was hardest to explain simply?*
    * *How would you explain this to a 10-year-old next time?*
  * 1–5 star ratings on Confidence, Comprehension, and Vocal Delivery.
* **Stage 4: Celebration & Social Proof**:
  * XP award animation with count-up numbers.
  * Constellation star unlocked notification.
  * 1-Click Broadside Note sharing modal.
  * **HTML5 Canvas Proof Card Copy & Download**: 1-click clipboard export of a 1200x630 social card.

---

### 3.3. The Podium: Party Presentation Engine (`/podium`)
* **Concept**: Transform intellectual ideas and spicy opinions into high-energy, comedic, or academic slide presentations for house parties, team meetings, or social feeds.
* **Topic Selection**:
  * 60+ curated hot takes across 6 vibes:
    * `🔥 Hot Take` (e.g. *The System Needs Poor People to Function*)
    * `🇳🇬 Culture` (e.g. *Owambe Is the Peak of Human Social Engineering*)
    * `💅 Social` (e.g. *Situationships Are Just Failed Negotiations*)
    * `🧠 Pseudo-Science` (e.g. *Introverts Are Just Extroverts Out of Battery*)
    * `💰 Economics` (e.g. *The Gig Economy is Feudalism with an App*)
    * `🎭 Pop Culture` (e.g. *Drake vs Kendrick Was the Trial of the Century*)
  * Randomizer wheel with de-duplication tracking.
  * Custom Topic creator with subtitle generator.
* **Timed Note Jotting**:
  * Optional 120s timer with starter arguments/angles that can be clicked to prefill notes.
  * Option to skip notes and let AI freestyle from the topic text.
* **Slide Styles**:
  * `bold`: Punchy, declarative, roast-comedy TED talk style.
  * `minimal`: Sparse, gallery aesthetic, clean whitespace.
  * `academic-chaos`: Ridiculous academic phrasing with fake citations *(Okafor et al., 2019)*.
* **Slide Builder AI Route (`/api/ai/generate-slides`)**:
  * Powered by Google Gemini (`gemini-3.8-flash`).
  * Generates exactly 5 structured slides mixing layouts:
    * Slide 1: `title-only` (Title card with deck subtitle).
    * Slides 2–4: `title-body`, `title-bullets`, or `quote`.
    * Slide 5: `closing` (Mic-drop statement).
  * Color palette injection: midnight, vivid-sky, forest-fire, terracotta, chalk, naija-green, burnt-amber.
* **Full In-Preview Slide Editor**:
  * Split-panel interface in Preview phase.
  * Layout-aware inputs:
    * Title & Subtitle editing.
    * Body text textarea.
    * Editable bullet point list with **+ Add bullet** and **🗑 Delete** per item.
    * Quote text and attribution input.
  * **Image & Meme Uploader**:
    * Client-side HTML5 canvas compression (auto-resizes to max 800px, 0.78 JPEG) keeping URL payload lightweight.
    * Paste image URL option (Giphy, Unsplash, web images).
    * Photo frame mounting with drop shadows and white mat borders.
  * Live mini-preview strip updates instantly as the user types.
* **Fullscreen Presenter Mode**:
  * Keyboard navigation (`Space`, `ArrowRight`, `ArrowLeft`).
  * Animated slide transitions (`framer-motion`).
  * Progress dot indicators.
* **Zero-Database URL Sharing (`/podium/slides/[code]`)**:
  * Entire 5-slide deck compressed via `lz-string` into the URL hash/param.
  * Anyone can view, click through slides, and present without logging in.

---

### 3.4. Community Research Salons (`/community`)
* **Collaborative Room Creation**:
  * Public vs. Private rooms with customizable research and speaking limits.
  * Multi-field search across titles, categories, and custom tags.
* **Zero-Config Room URLs**:
  * Encoded URL state (`?code=...&r=...`) allowing instant peer invites via WhatsApp/Discord without database requirements.
* **In-Room Voice Recording & Playback**:
  * Peer playback of recorded audio files in voting and closed salon phases.
  * Live audio waveform visualization.
* **Scholar Following Network**:
  * Follow peers, inspect profiles, and track community dispatches.

---

### 3.5. Knowledge Constellation Graph (`/constellation`)
* Interactive ReactFlow 2D canvas showing intellectual proximity.
* Clusters nodes by academic categories.
* Suggests adjacent unexplored topics based on graph edge density.

---

### 3.6. Games Hub (`/games`, `/play`, `/games/trivia`)
* **Online Articulate (`/play`)**:
  * Local multiplayer party game.
  * Speech recognition transcribes descriptions in real time.
  * Google Gemini AI referee validates word guesses and penalizes taboo rule violations.
* **Naija Trivia (`/games/trivia`)**:
  * 1,000+ curated questions across Culture, History, and Pop Culture.
  * Countdown timers, scoring streaks, and historical explanations.

---

## 4. Viral Growth Loops & Retention Architecture

Fey's growth model relies on **Product-Led Viral Loops** rather than paid marketing. Every learning sprint and slide deck created naturally produces shareable artifacts.

```
                    ┌─────────────────────────┐
                    │    Scholar Completes    │
                    │   Sprint or Slide Deck  │
                    └────────────┬────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │                           │
          [Visual Proof Card]         [Public Note / Slide URL]
          • 1200x630 Canvas Image     • Zero-DB LZ-String URL
          • Posted to X / LinkedIn    • Shared in WhatsApp / DMs
                   │                           │
                   └─────────────┬─────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │    Visitor Lands on Fey   │
                   │    (Non-User Lurker)      │
                   └─────────────┬─────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
  [Read Synthesis]      [Highlight Quote]      [Contextual Challenge]
  • Broadside layout    • Floating tooltip     • "Articulate Your Take"
  • Reading estimate    • 1-click quote tweet  • "Present Counter-Take"
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │ Frictionless Conversion   │
                   │ • Pre-filled 90s Sprint   │
                   │ • Onboarding Modal        │
                   │ • Becomes New Scholar     │
                   └───────────────────────────┘
```

---

### 4.1. Loop Mechanism 1: The Contextual Rebuttal Challenge
* **Trigger**: A non-user visits a shared note (`/note/[code]`) or slide deck (`/podium/slides/[code]`).
* **Hook**: Instead of a generic *"Sign Up for an Account"* banner, the reader sees:
  > **🎙️ The Feynman Rebuttal Challenge**  
  > *“Disagree with this take or have a simpler way to explain it? Articulate your thesis in 90 seconds.”*  
  > `[Record Take →]`
* **Conversion Action**:
  * Clicking the button grabs the exact topic they just read.
  * Pre-populates the topic and launches directly into an impromptu 90-second vocal sprint.
  * The friction of deciding *"What should I learn?"* is completely eliminated.

---

### 4.2. Loop Mechanism 2: Substack / Medium-Style Highlight-to-Tweet
* **Trigger**: Reader selects or highlights any sentence in a shared manuscript (`/note/[code]`).
* **UI Response**: A sleek floating action pill appears above the selection:
  `[𝕏 Share Quote]  [📋 Copy]`
* **Viral Output**: Pre-formats a tweet ready to publish:
  > *“{selected quote}”*  
  > — from Scholar Nana's synthesis on "What is cloud computing?" on @FeyPlatform:  
  > https://fey.lokinlabs.com.ng/note/ey...
* **Why it drives virality**:
  * Users rarely tweet whole articles; they tweet 1–2 provocative lines.
  * Quotes attract engagement from mutuals who click the source link to see context.

---

### 4.3. Loop Mechanism 3: HTML5 Canvas Proof Card Image Export
* **Problem Solved**: Social algorithms (X, LinkedIn, Threads, Instagram) throttle posts with raw external links. Posts with attached images receive **300%–500% more impressions**.
* **Mechanism**:
  * Built inside `lib/feynman-card-canvas.ts` using zero-dependency HTML5 Canvas.
  * Generates a 1200x630px high-contrast broadside card:
    * Deep charcoal/onyx background with terracotta inner border.
    * Gold foil header: `FEY · PROOF OF INTELLECT`.
    * Category & difficulty pill.
    * Vocal synthesis badge: `🎙️ 90s VOCAL SYNTHESIS`.
    * Big Georgia serif topic title.
    * Excerpt quote block with quotation marks.
    * Scholar byline & date.
  * **1-Click Clipboard Copy**: Writes direct PNG binary to clipboard (`navigator.clipboard.write([new ClipboardItem(...)])`).
  * User pastes the image directly into their tweet or LinkedIn post with their note link.

---

### 4.4. Loop Mechanism 4: Dynamic Server-Side Open Graph (OG) Unfurls
* **The Problem**: Raw URLs pasted into WhatsApp group chats, iMessage, Slack, or Twitter look like spam if they don't unfurl rich previews.
* **Mechanism**:
  * Next.js App Router server components with `generateMetadata`:
    * `app/note/[code]/page.tsx`
    * `app/podium/slides/[code]/page.tsx`
  * Decodes payload on the server before sending HTML.
  * Injects dynamic tags:
    * `og:title`: `"{Topic Title}" · Scholar Dispatch — Fey` / `Party Slide Deck — The Podium`
    * `og:description`: 220-character cleaned note snippet or slide count + author byline.
    * `twitter:card`: `summary_large_image`.
  * WhatsApp, iMessage, and Twitter render a rich card with preview text.

---

### 4.5. Loop Mechanism 5: Zero-Database URL Portability
* All shared state is compressed via `lz-string` into URL-safe strings:
  * Notes: `/note/[code]`
  * Presentations: `/podium/slides/[code]`
  * Salons: `/community/room/[roomId]?code=...`
* **Advantage**:
  * Zero server database costs for public sharing.
  * Links never expire or depend on cloud database availability.
  * State cannot be deleted by server migrations.

---

## 5. Technical Specifications & Architecture

### 5.1. Tech Stack Overview
| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16.2 (App Router), React 19, TypeScript 5 |
| **State Management** | Zustand 5 with `persist` middleware (local-first storage) |
| **Styling & Design System** | Tailwind CSS v4, CSS Custom Properties (`--fey-*`, `--terra`, `--gold`, `--olive`) |
| **Animation Engine** | Framer Motion (page transitions, spring modals, animated counters) |
| **Rich Text Editor** | TipTap (StarterKit, TaskList, TaskItem, Link, Placeholder) |
| **Graph Visuals** | ReactFlow (Constellation knowledge graph) |
| **Audio Capture** | Browser `navigator.mediaDevices.getUserMedia` + `MediaRecorder` API |
| **AI Backend** | Google Gemini (`gemini-3.8-flash`) via Next.js server route handlers |
| **Compression** | `lz-string` (URI-safe compression) |
| **Canvas Export** | Native HTML5 Canvas 2D Context |

---

### 5.2. Store Architecture & Local Persistence
Fey operates on a **Local-First** architecture. All user data, completed sessions, custom topics, streak shields, and party decks are maintained in client stores:

```
┌─────────────────────────────────────────────────────────────┐
│                       ZUSTAND STORES                        │
├──────────────────────────────┬──────────────────────────────┤
│ useAppStore (v7)             │ • Profile (username, avatar) │
│                              │ • Completed sessions & audio │
│                              │ • Streak & Shield protection │
│                              │ • Daily quests & claimed XP  │
│                              │ • Enabled & fav disciplines  │
│                              │ • Constellation nodes        │
├──────────────────────────────┼──────────────────────────────┤
│ usePodiumStore               │ • Phase state machine        │
│                              │ • Active & saved decks       │
│                              │ • Slide editor state         │
│                              │ • Custom hot-takes           │
├──────────────────────────────┼──────────────────────────────┤
│ useCommunityStore            │ • Active rooms               │
│                              │ • Peer audio submissions     │
│                              │ • Followed scholars          │
├──────────────────────────────┼──────────────────────────────┤
│ useGameStore                 │ • Party game team scores     │
│                              │ • Active turn & AI referee   │
└──────────────────────────────┴──────────────────────────────┘
```

---

### 5.3. API Endpoint Architecture
All AI capabilities run through Next.js server routes with API keys kept secure server-side:

| Route | Model | Function |
| :--- | :--- | :--- |
| `POST /api/ai/generate-slides` | `gemini-3.8-flash` | Converts user notes into a structured 5-slide party deck with layout mixing and palette injection. |
| `POST /api/ai/podium-topic` | `gemini-3.8-flash` | Generates controversial, funny, or culturally aware presentation topics with seed bullets. |
| `POST /api/ai/validate` | `gemini-3.8-flash` | Evaluates player word descriptions in *Online Articulate* with semantic and phonetic leniency. |
| `POST /api/ai/check-violation` | `gemini-3.8-flash` | Referees taboo word violations in party games. |
| `POST /api/ai/pronunciation-coach` | `gemini-3.8-flash` | Provides vocal critique and feedback on articulation. |

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

### 6.1. Habit & Retention Metrics
* **D1 / D7 / D30 Retention**: Percentage of scholars returning to record a vocal sprint.
* **Daily Vow Completion Rate**: Target >45% of daily active users fulfilling at least 2 of 3 daily quests.
* **Streak Shield Usage**: Monitored via XP spent on shields (loss aversion indicator).

### 6.2. Viral K-Factor & Distribution Metrics
* **Viral Coefficient ($K$)**: 
  $$K = i \times c$$
  *(where $i$ = dispatches shared per active user, $c$ = conversion rate of readers who record a rebuttal sprint).*
* **Card Image Copies vs. Raw Link Shares**: Ratio of users copying canvas image cards vs raw text URLs.
* **Highlight-to-Tweet Activation**: Number of quote tweets generated via the text selection tooltip.
* **Rebuttal Challenge Conversion**: Click-through rate from `/note/[code]` into `/session/[id]` impromptu sprints.

### 6.3. Content & Articulation Quality
* **Average Vocal Duration**: Target between 60s and 90s per sprint.
* **Presentation Completion Rate**: Percentage of users who enter `/podium` and generate a 5-slide deck.

---

## 7. Future Horizons & Roadmap

| Horizon | Phase | Target Capabilities |
| :--- | :--- | :--- |
| **Phase 2 (Cloud Sync)** | Near-term | Optional Supabase / PostgreSQL cloud synchronization to preserve streaks across devices. |
| **Phase 3 (Audio CDN)** | Near-term | Cloudflare R2 / AWS S3 pre-signed storage for audio clips exceeding localStorage quotas. |
| **Phase 4 (Live Salons)** | Mid-term | Live synchronized WebSockets / LiveKit audio rooms for real-time Fey debate salons. |
| **Phase 5 (AI Socratic Critique)** | Mid-term | Whisper speech-to-text transcription paired with Gemini Socratic feedback on clarity, filler words, and explanatory depth. |

---

*Fey — Think Deeper, Articulate Clearly.*  
*Maintained by Lokin Labs.*
