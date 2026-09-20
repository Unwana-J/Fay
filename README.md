# Fey — Think Deeper, Articulate Clearly

> An intellectual learning and vocal articulation platform built around the **Feynman Technique**: proving true understanding by explaining complex ideas simply, concisely, and out loud under time constraints.

---

## 📖 Product Requirements Document (PRD)

For a complete breakdown of user personas, core features, technical architecture, and our 4-Phase engineering roadmap, please see the [**Product Requirements Document (PRD)**](./docs/PRD.md).

For persistent assistant memory and architectural decisions, see [**GEMINI.md**](./GEMINI.md).

---

## ✨ Key Features

- **Solo Feynman Sprints (`/session/[id]`)**:
  - Timeboxed deep research (10–30m) with structured TipTap rich-text editor.
  - Vocal articulation challenge (60–180s) with native microphone capture (`MediaRecorder`) and in-session audio review/retry.
  - Honest 3-point reflection and multidimensional scoring (Confidence, Understanding, Communication).
- **Interactive Knowledge Constellation (`/constellation`)**:
  - ReactFlow interactive graph clustering mastered topics by disciplinary color and proximity.
  - Automatic recommendation of adjacent ideas based on mastered nodes.
- **Community Research Salons (`/community`)**:
  - Decentralized room creation with multi-field search and custom topic entry.
  - Zero-config sharing via URL payloads (`?r=...`).
  - Peer audio recording playback with animated waveforms during voting phases.
  - Scholar follow network to track peers' intellectual journeys.
- **Tailored Daily Ritual (`/`)**:
  - Deterministic daily topics strictly aligned to your onboarding interests.
  - Interactive Focus Roulette modal allowing single-category deep dives or jumping to `/discover`.
  - 52-week activity heatmap, streaks, and philosophical quote library.
- **Scholarly Games (`/games`)**:
  - **Trivia Arcade**: 1,000+ curated questions across History, Science, Pop Culture, and Philosophy with timer modes, streaks, and deduplication.
  - **Word Description Party Game (`/play`)**: Taboo-style team game with live speech transcription and Google Gemini 2.0 Flash AI referee.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Unwana-J/Fay.git
cd Fay

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using Fey.

---

## 🧱 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Semantic Design System
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) with LocalStorage persistence & schema migrations
- **Audio**: Web Audio API + `MediaRecorder`
- **Visuals**: [ReactFlow](https://reactflow.dev/) & [Framer Motion](https://www.framer.com/motion/)
- **AI**: [Google Gemini 2.0 Flash API](https://ai.google.dev/)