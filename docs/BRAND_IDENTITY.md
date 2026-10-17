# Fey Brand Identity & Design System Manual

> **"Think Deeper, Articulate Clearly."**  
> *The official style, voice, visual identity, and UI standards for Fey.*

---

## 1. Brand Philosophy & Essence

Fey is an intellectual learning, vocal articulation, and social parlor platform rooted in the **Feynman Technique**:
> *"If you want to master something, explain it simply in your own voice."*

Passive consumption (bookmarking, skimming, endless video watching) produces an **illusion of explanatory depth**. Fey replaces passive consumption with structured distillation, timeboxed vocal articulation, and social parlor games.

### 1.1. Core Brand Tenets
1. **Intellectual Dignity Without Pretension**: We celebrate deep thinking, philosophy, African and world history, sciences, and culture—without ever sounding elitist, exclusionary, or pompous.
2. **Plainspoken Clarity**: If a concept cannot be explained in simple words, it is not yet understood. We practice what we preach: zero buzzwords, zero pseudo-academic jargon, and zero needless acronyms.
3. **Bookish Editorial Print Aesthetic**: Fey looks and feels like a beautifully printed literary broadside, an independent quarterly journal, or an intellectual salon—never a generic, neon-lit SaaS dashboard.
4. **Calm, Distraction-Free Focus**: We respect human attention. Generous whitespace, warm cream paper canvas, thoughtful typography, and zero notification spam.

---

## 2. Voice & Editorial Tone

The voice of Fey is **erudite, warm, direct, and conversational**. Think of a trusted professor, a sharp salon moderator, or a brilliant peer at a library table.

### 2.1. The Anti-Jargon Lexicon
We explicitly ban pseudo-academic or unnecessarily combative jargon in user-facing copy. Always choose the plain, natural equivalent:

| Avoid (Too Complex / Intimidating / Jargon) | Preferred in Fey (Plain, Dignified, Clear) | Context |
| :--- | :--- | :--- |
| **Gauntlet / Invitational Gauntlet** | **Challenge / 1v1 & Group Challenge** | Trivia & Arena |
| **Tournament Pacing & Drops Mode** | **Quiz Schedule** | Leagues |
| **Sequential / Daily 24h Paced Cohort** | **Self-Paced / Daily (24h)** | League schedule |
| **Review Cadence** | **When Answers Are Shown** | Trivia solo setup |
| **Speaking Sprint Duration** | **Speaking Time / Turn Duration** | Articulate party setup |
| **Winning Target Score** | **Score to Win** | Game rules |
| **Intellectual Pillars** | **Topic Categories** | Trivia categories |
| **Broadside Proof Cards** | **Shareable Score Cards** | Social sharing cards |
| **Convene a Challenge / Gauntlet** | **Create a Challenge** | Actions & buttons |
| **Loremasters** | **Trivia buffs / Curious scholars** | Difficulty copy |
| **Drop locks / Round locks** | **Unlocks after Drop [X]** | Cards & status |
| **Contenders / Contender Pool** | **Players / Scholars** | Multiplayer & lobby |

### 2.2. Copywriting Guidelines
- **Clear Over Clever**: Buttons must say exactly what happens when tapped (`Start Solo Quiz`, `Create Room`, `Play Drop 3`, `Copy Link`).
- **Encourage, Don't Preach**: Celebrate progress with dignity (`"150 pts earned"`, `"Streak protected"`, `"3 of 5 questions explored"`).
- **Concise Form Labels**: Use `Match Title (Optional)` instead of `Match / Group Title (Optional)`; use `Turn Duration` instead of `Speaking Sprint Duration`.
- **Friendly Empty States**: When a list is empty, explain what to do simply (`"No challenges created yet. Create a challenge to invite friends!"`).

---

## 3. Color Palette & Visual Semantics

Fey adheres to a strict, disciplined semantic color system inspired by vintage book printing, natural linen, terracotta burgundy, and forest flora.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FEY SEMANTIC PALETTE                            │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│    CANVAS       │   ACTION ONLY   │  STRUCTURAL/NAV  │   REWARDS ONLY  │
│    #F4EFE6      │     #7A1C2E     │     #444E2C      │     #A67C1E     │
│   Warm Cream    │   Terracotta    │   Forest Olive   │   Bronze Gold   │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

### 3.1. Color Tokens & Rules

| Token | Hex / Value | Semantic Purpose & Usage Rule |
| :--- | :--- | :--- |
| `--bg-base` | `#F4EFE6` | **Canvas Base**: Warm cream vintage book paper canvas. |
| `--bg-panel` | `#EBE5DA` | **Panel Surface**: Warm sand sidebar, navigation strip, sticky footers. |
| `--bg-card` | `#FDFCFA` | **Card Surface**: High-contrast, clean printed card surfaces. |
| `--bg-input` | `#DCD5C9` | **Input / Accent Surface**: Soft sand for form inputs, inactive pills, borders. |
| `--terra` | `#7A1C2E` | **Primary Action ONLY**: Main CTAs, submit buttons, record triggers, active tabs. Never used for decorative backgrounds or arbitrary icons. |
| `--olive` | `#444E2C` | **Structural & Informational**: Section headers, border strokes, neutral tags, metadata icons, category accents. |
| `--olive-br` | `#5C6A36` | **Secondary Structural**: Hover states for olive borders and accents. |
| `--gold` | `#A67C1E` | **Rewards & Milestones ONLY**: XP earned, streak badges, achievements, star ratings, leaderboards. Never used for basic action buttons. |
| `--red` | `#B53A3A` | **Urgency & Errors ONLY**: Timer under 10 seconds, validation errors, destructive actions (discard match). |
| `--text` | `#1E2211` | **Primary Text**: High-contrast, deep forest black-brown. |
| `--text-dim` | `#525645` | **Secondary Text**: Explanatory copy, subtitles, helper text. |
| `--text-mute` | `#828574` | **Tertiary Text**: Form labels, timestamps, disabled indicators. |
| `--border` | `rgba(68,78,44,0.18)` | **Hairline Border**: Clean, crisp borders on primary cards and modals. |
| `--border-dim`| `rgba(68,78,44,0.08)` | **Subtle Divider**: Subtle dividers between list items and tabs. |

---

## 4. Typography Hierarchy

Fey pairs a literary editorial serif with a crisp geometric sans and a neutral UI sans to balance classical bookish elegance with modern digital legibility.

```
Headline (Serif / Lora)      → "Think Deeper, Articulate Clearly"
Section Heading (Space Grotesk) → "Naija Trivia Challenges & Arena"
Body & Form (Inter)         → "Answer 15 curated questions under time pressure."
Metric / Score (Space Grotesk)  → "450 pts · Rank #1"
```

### 4.1. Font Roles
* **Editorial Serif (`Lora`, `var(--font-serif)`)**:
  * Used for: Platform vision statements, quote attributions, essay headers, dispatch titles, literary accents.
  * Style: `font-serif`, tracking normal, generous line-height (`leading-relaxed`).
* **Display Sans (`Space Grotesk`, `var(--font-space)`)**:
  * Used for: Component headers, metric figures, card labels, interactive counters, navigation labels, scholar usernames.
  * Style: `font-space font-bold` or `font-extrabold`.
* **Interface Body (`Inter`, `var(--font-inter)`)**:
  * Used for: All explanatory body copy, descriptions, input placeholders, list items, guide texts.
  * Style: `font-sans`, regular to medium weights (`font-normal` or `font-medium`), clean readability.

---

## 5. Iconography & Visual Cleanliness Rules

Fey's aesthetic is clean and editorial. Visual noise, arbitrary emojis, and icon clutter destroy this feeling. Follow these strict rules across all features:

### 5.1. Strict No-Emoji Rule for UI Controls
- **Never embed raw emojis into action buttons, form pills, or navigation tabs**:
  - ❌ `⚡ 30s`, `🎯 45s`, `⏱️ 60s` $\rightarrow$ ✅ `30s`, `45s`, `60s`
  - ❌ `👑 Host`, `👥 Team Scholar` $\rightarrow$ ✅ `<Crown size={10} /> Host`, `<Users size={10} /> Team Scholar`
  - ❌ `🔥 3 day streak` $\rightarrow$ ✅ `<Flame size={15} /> 3 day streak`
  - ❌ `🛡️ Track Streak` $\rightarrow$ ✅ `<ShieldCheck size={13} /> Track Streak` or clean text `Track Streak`
  - ❌ `🥇`, `🥈`, `🥉` $\rightarrow$ ✅ Vector `RankTrophyBadge` discs with rank numbers `#1`, `#2`, `#3`
- **Only exception for emojis**: Content-level illustrations (e.g., Nigerian flag `🇳🇬`, category cover artwork, or meme images on podium slides).

### 5.2. Clean Action Buttons (No Icon Sandwiches)
- Avoid placing both a leading icon and a trailing arrow on standard action buttons:
  - ❌ `<Sparkles size={14} /> Start Drop 3 <ArrowRight size={14} />`
  - ✅ `Start Drop 3` or `Play Drop 3`
- Action buttons must be **clean, dignified, and legible**:
  - `Track Streak →` (clean arrow in string or no icon)
  - `Enter Room` (clean text)
  - `Create & Launch Challenge`

### 5.3. Single Source of Truth for Card Status
- Never repeat the same status message twice in a single card:
  - ❌ Top badge: `✓ Score Locked` AND Bottom footer: `✓ Score Locked`
  - ✅ Top badge: `Completed` AND Body: `Score: 2/5 · +300 pts` (no duplicate footer)
  - ❌ Top badge: `🔒 Locked · Complete Drop 3 first` AND Bottom footer: `Complete Drop 3 to unlock`
  - ✅ Top badge: `Locked` AND Body: `Unlocks after Drop 3`

### 5.4. Uniform Card Heights & Grid Alignment
- Grid cards (e.g., League Drops, Solo Sprint modes, Parlor games) must use consistent vertical boundaries (`min-h-[145px]`) so items in the same row do not jump or visually stagger.

---

## 6. Component Patterns & Anatomy

### 6.1. Primary Action Button (`.btn-terra`)
```tsx
<button className="btn-terra px-5 py-2.5 rounded-xl text-xs font-space font-bold cursor-pointer transition-all shadow-xs">
  Start Solo Quiz
</button>
```
* **Background**: `--terra` (`#7A1C2E`)
* **Text**: Pure white (`#FFFFFF`), `font-space font-bold`
* **Border Radius**: `rounded-xl` (12px) to `rounded-2xl` (16px)
* **Shadow**: Subtle crisp contact shadow (`shadow-xs`), never blurry SaaS glow

### 6.2. Status Badge / Pill
```tsx
// Active / Up Next
<span className="text-[10px] font-mono font-bold text-[var(--terra)] bg-[var(--terra)]/15 px-2.5 py-0.5 rounded-full border border-[var(--terra)]/30">
  Ready to Play
</span>

// Completed
<span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
  <CheckCircle2 size={11} /> Completed
</span>

// Locked
<span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-mute)] bg-[var(--bg-input)] px-2.5 py-0.5 rounded-full border border-[var(--border-dim)]">
  <Lock size={10} /> Locked
</span>
```

### 6.3. Surface Card (`.surface`)
```tsx
<div className="surface rounded-2xl p-5 border border-[var(--border-dim)] space-y-3">
  {/* Content */}
</div>
```
* **Background**: Warm linen card surface (`--bg-card: #FDFCFA`)
* **Border**: Subtle hairline stroke (`--border-dim: rgba(68,78,44,0.08)`)
* **No SaaS drop shadows**: Flat printed paper feel

---

## 7. Review Checklist for New Features & Pull Requests

Before shipping any new view, modal, or feature, verify each item:

- [ ] **Color Check**: Is `--terra` restricted strictly to primary interactive actions? Is `--gold` used only for XP, streaks, and achievements?
- [ ] **Icon Check**: Are all emojis removed from buttons, tabs, and tags in favor of minimal Lucide icons or clean text?
- [ ] **Button Check**: Are buttons free of duplicate icon sandwiches (`<Icon /> Text <Arrow />`)?
- [ ] **Copy Check**: Is the text free of pseudo-academic jargon (*gauntlet*, *review cadence*, *tournament pacing*, *speaking sprint duration*)?
- [ ] **Card Check**: Does each card have a single, non-redundant status indicator? Are grid card heights aligned?
- [ ] **Type Check**: Does the build pass `npx tsc --noEmit` with **0 errors**?
