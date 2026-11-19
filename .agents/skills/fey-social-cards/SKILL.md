---
name: fey-social-cards
description: Generate Fey-branded editorial social media cards (PNG) and launch/teaser motion videos (MP4) for LinkedIn, WhatsApp Status, Instagram, TikTok, and X using Remotion inside `video/`. Trigger whenever the user asks to create, generate, design, or update Fey social posts, quote cards, Feynman chalkboard graphics, Quantitative Reasoning puzzle cards, building-in-public visual cards, or Fey promo/teaser videos.
---

# Fey Social Card & Motion Studio (`video/`)

Use this skill to generate crisp, on-brand Fey visual assets without leaving the repository. Every asset uses Fey's exact semantic colors (`#F7F5F0` archival cream, `#444E2C` forest olive, `#7A1C2E` wine red, `#A67C1E` bronze gold), bundled local fonts (`Lora`, `Space Grotesk`, `Inter`), zero emojis, and the quiet Fey butterfly colophon.

---

## 1. Generating Branded Social Cards (`video/scripts/make-card.mjs`)

Output directory: `video/out/cards/`

### Formats (`--format`, comma-separated for multi-format export)
- `linkedin` (`1200×1500`, 4:5 portrait — primary LinkedIn & Instagram feed format)
- `status` (`1080×1920`, 9:16 vertical — native WhatsApp Status, IG Stories & TikTok)
- `landscape` (`1600×900`, 16:9 wide — X/Twitter, LinkedIn links, article covers)
- `square` (`1080×1080`, 1:1 universal)

### Available Templates (`--template`)
Wrap any phrase inside `--headline` with `*asterisks*` to accent it in italicized wine-red (or antique gold on `chalkboard`). Use `\n` for deliberate line breaks.

1. **`broadside`** — Warm archival cream quote or founder thesis card.
   - Props: `--tag`, `--headline`, `--body`, `--attribution`, `--footer`, `--beta` (`true`/`false`)
2. **`chalkboard`** — Deep forest-olive Richard Feynman chalkboard with subtle Feynman-diagram chalk accents and antique gold highlights.
   - Props: `--tag`, `--headline`, `--attribution`, `--body`, `--beta`
3. **`puzzle`** — Interactive Quantitative Reasoning / Mathletics / Naija Trivia hook card.
   - Props: `--tag`, `--headline`, `--timer` (e.g. `"25s · No calculator"`), `--samples` (`|`-separated, e.g. `"[2, 3, 4 → 20]|[3, 4, 5 → 35]"`), `--prompt` (e.g. `"[4, 5, 6 → ?]"`), `--options` (`|`-separated, e.g. `"46|50|52|54"`), `--body`, `--footer`
4. **`receipt`** — Numbered 3-row editorial list card (e.g., `"1,000 posts read"`, 3 holiday games, or 3 key lessons).
   - Props: `--tag`, `--headline`, `--items` (`|`-separated `num:label` pairs, e.g. `"01:Articulate|02:The Podium|03:Naija Trivia"`), `--body`
5. **`lesson`** — Structured Building-in-Public / founder note with left-accented pull quote.
   - Props: `--tag`, `--headline`, `--body`, `--callout`

### Commands

> Note: Rendering uses local headless Google Chrome via Remotion, so run with `BypassSandbox: true` if sandbox blocks local DevTools sockets.

**Single or multi-format card via CLI:**
```bash
node video/scripts/make-card.mjs \
  --template broadside \
  --format linkedin,status \
  --tag "THINKING & LEARNING" \
  --headline "Feeling informed isn't the same as *knowing.*" \
  --body "True understanding begins when you explain an idea out loud." \
  --out my-card-name
```

**Batch deck via JSON (`--batch`):**
Write a temporary JSON array (e.g. in scratch or `video/out/batch.json`) of `{ name, formats: ["linkedin", "status"], props: { template, tag, headline, ... } }` and run:
```bash
node video/scripts/make-card.mjs --batch path/to/cards.json
```

**Built-in starter pack:**
```bash
node video/scripts/make-card.mjs --preset starter-pack
```

---

## 2. Motion Videos (`video/scripts/render-videos.mjs`)

All 4 compositions live in `video/src/Root.tsx` and render to `video/out/`:
- `FeyBeta` (`1920×1080`, 65s) → `video/out/fey-beta-16x9.mp4`
- `FeyBetaVertical` (`1080×1920`, 65s) → `video/out/fey-beta-9x16.mp4`
- `FeyTeaser` (`1920×1080`, 15s) → `video/out/fey-teaser-15s-16x9.mp4`
- `FeyTeaserVertical` (`1080×1920`, 15s) → `video/out/fey-teaser-15s-9x16.mp4`

Before the January Public Beta launch, update the `80` scholar counter in `video/src/scenes/Act5ProofBeta.tsx` (and `video/src/FeyTeaserVideo.tsx`) to the current user count and re-run:
```bash
node video/scripts/render-videos.mjs
```

---

## 3. Editorial & Brand Guardrails (Mandatory)
- Follow `docs/BRAND_IDENTITY.md` and `docs/BRAND_CALENDAR.md`.
- **Keep the January Launch Vault Fresh:** Do NOT repeat the 65s Launch Film's exact signature lines or puzzles in pre-launch cards/teasers (reserve *"1,000 posts read"*, *"Feeling informed isn't the same as knowing."*, *"What I cannot create, I do not understand."*, `[2, 3, 4 → 20]`, Hakeem 1994, and *"Nigerian Customer Service is a Spiritual Test"* for the main launch film — draw fresh questions from `lib/mathletics-questions.ts` and fresh stories from `docs/DECISIONS_LOG.md`!).
- **Zero emojis** in card copy, tags, timers, or buttons.
- **Plainspoken Anti-Jargon copy** — clear, dignified, conversational.
- **Always visually inspect** generated PNGs with `read_file` after rendering to verify zero text clipping, balanced line breaks, and clean contrast before presenting them to the user.
