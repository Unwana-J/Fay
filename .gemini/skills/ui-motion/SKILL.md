---
name: ui-motion
description: |
  Comprehensive design engineering and UI animation skill for crafting polished, tactile, 60fps web interfaces.
  Use when designing, building, reviewing, or polishing UI components, animations, micro-interactions, layout transitions, modals, and design system tokens.
  Covers Framer Motion physics, CSS performance, asymmetric timing, spatial continuity, and accessibility.
---

# UI Motion & Design Engineering

This skill codifies the principles of modern design engineering and animation taste (derived from modern UI craft standards, Emil Kowalski's animation specifications, and `skill-issue.in` agent packages).

Use this guide whenever you create or refine user interfaces, interactive components, gestures, or visual feedback.

---

## 1. Core Motion Philosophy

1. **Animation Serves Comprehension, Not Decoration**:
   - Every movement should clarify spatial origin, state changes, or physical continuity.
   - If an animation makes a user wait to take their next action, it is a defect.
2. **Asymmetric Timing (The Golden Rule)**:
   - **Enter Deliberate** (180ms – 240ms): Give the eye time to register where new content came from.
   - **Exit Snappy** (100ms – 150ms): Clear the screen swiftly so the user can interact with what's underneath.
3. **Interruptibility**:
   - Animations must never freeze user input. Users can click, drag, or close mid-flight without waiting for tweens to finish.
4. **Accessibility First (`prefers-reduced-motion`)**:
   - Always honor user system preferences by falling back to instant opacity cross-fades or zero motion.

---

## 2. Spring Physics vs. CSS Easing Tokens

### Standard Spring Presets (Framer Motion)

```ts
// 1. Snappy Sheet / Modal Reveal (Quick, crisp, no oscillation)
export const SPRING_MODAL = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

// 2. Micro-Interaction / Active Tab Pill / Segmented Control
export const SPRING_PILL = {
  type: "spring",
  stiffness: 500,
  damping: 35,
};

// 3. Floating Tooltip / Popover Dropdown
export const SPRING_POPOVER = {
  type: "spring",
  stiffness: 450,
  damping: 28,
};

// 4. Bouncy Celebration / Badge Earned / Trophy Reveal
export const SPRING_BOUNCE = {
  type: "spring",
  stiffness: 300,
  damping: 18,
};
```

### High-Taste CSS Easing Curves

Never use `transition: all 0.3s ease;` or `linear`. Use deliberate cubic-beziers:

```css
/* Linear/Apple standard snappy ease-out */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

/* Smooth deceleration */
--ease-out-quad: cubic-bezier(0.25, 1, 0.5, 1);

/* Anticipation / spring-like overshoot */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 3. GPU Acceleration & 60fps Performance Rules

### The Non-Negotiable Compositor Rule
**ONLY animate `transform` and `opacity`.**

```tsx
// ❌ WRONG: Triggers layout reflow and paint on every frame (jank & battery drain)
<motion.div animate={{ height: isOpen ? 300 : 0, width: "100%", marginTop: 20 }} />

// ✅ CORRECT: Compositor only (0ms layout reflow)
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: 8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.98, y: -4 }}
  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
/>
```

When an element must animate its dimensions (e.g. accordion or expanding card), use **Framer Motion `layout`** or CSS Grid subgrid transition:

```tsx
// Expanding container with smooth height interpolation
<motion.div
  layout
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
  className="rounded-3xl border surface overflow-hidden"
>
  {content}
</motion.div>
```

---

## 4. Component Micro-Interaction Recipes

### 1. Tactile Button Press (Haptic-Feel Click)
Buttons should feel physically pressed into the glass/surface:

```tsx
<button
  className="px-5 py-2.5 rounded-2xl font-bold text-xs transition-transform active:scale-[0.97] hover:scale-[1.01] cursor-pointer"
>
  {label}
</button>
```

### 2. Floating Sliding Tab Indicator (`layoutId`)
When switching tabs, avoid hard snaps or individual fades. Slide a background pill smoothly under the active label:

```tsx
<div className="flex p-1 rounded-2xl border surface">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActive(tab.id)}
      className="relative px-4 py-1.5 text-xs font-semibold rounded-xl z-10 transition-colors"
    >
      {active === tab.id && (
        <motion.div
          layoutId="activeTabPill"
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
          className="absolute inset-0 rounded-xl bg-[var(--terra)] z-[-1] shadow-xs"
        />
      )}
      <span className={active === tab.id ? "text-white" : "text-[var(--text-dim)]"}>
        {tab.label}
      </span>
    </button>
  ))}
</div>
```

### 3. List Item Staggered Entrance
When rendering ranked leaderboards or card grids, stagger entry by 35ms per item:

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.035 } },
  }}
  className="space-y-2"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
      }}
    >
      <ItemCard item={item} />
    </motion.div>
  ))}
</motion.div>
```

### 4. Live Counter Ticks (Smooth Numeric Rollover)
For scores, streaks, and XP points, smoothly transition the numbers instead of instant jumps:

```tsx
<motion.span
  key={score}
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
  className="font-mono font-bold"
>
  {score}
</motion.span>
```

---

## 5. Fey Design Token Cohesion

Always respect the permanent Fey aesthetic:
- **Wine Red (`--terra` / `#7A1C2E`)**: Reserved exclusively for primary CTAs and active duel banners.
- **Forest Olive (`--olive` / `#444E2C`)**: Structural framing, badges, success states, and secondary pills.
- **Bronze Gold (`--gold` / `#A67C1E`)**: XP, streaks, rank #1 laurels, achievements.
- **Surface Elevation**: Layer cards using `--surface`, `--surface-hover`, and `--border-dim` with subtle glassmorphism rather than heavy drop shadows.
- **Strict Anti-Emoji Rule**: Never embed raw emojis (`⚡`, `🏆`, `🔥`) into interactive buttons or pills. Always use clean Lucide vector icons (`<Zap />`, `<Trophy />`, `<Flame />`, `<Swords />`).
