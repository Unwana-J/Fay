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
3. **`puzzle`** — Interactive Quantitative Reasoning / Quant / Naija Trivia hook card.
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

## 2. Motion Videos (`video/scripts/render-videos.mjs` & `render-spotlights.mjs`)

All compositions live in `video/src/Root.tsx` and render to `video/out/`:
- **Flagship 65s Launch Film:** `FeyBeta` (`16:9`) · `FeyBetaVertical` (`9:16`) → `video/out/fey-beta-*.mp4`
- **15s Brand Soft-Launch Film:** `FeyTeaser` (`16:9`) · `FeyTeaserVertical` (`9:16`) → `video/out/fey-teaser-15s-*.mp4`
- **5-Film Feature Spotlight Series (20s each, `16:9` + `9:16`)** → `video/out/spotlights/`:
  - `FeySpotStudy` / `FeySpotStudyVertical` (Daily Study loop — Music & Memory)
  - `FeySpotArticulate` / `FeySpotArticulateVertical` (3 fun word cards + live moving snake-order race board)
  - `FeySpotPodium` / `FeySpotPodiumVertical` (Spinner + 5-slide presenter deck: *Owambe Is the Peak of Human Social Engineering*)
  - `FeySpotTrivia` / `FeySpotTriviaVertical` (Live Drop 3 + mocked Friendship League with animated #3 → #1 climb)
  - `FeySpotMathletics` / `FeySpotMathleticsVertical` (25s Quantitative Reasoning `(3, 4 → 15)` + 1v1 Sprint Duel card)

```bash
# Re-render 65s launch films & 15s soft-launch teasers (pass --teasers for 15s only)
node video/scripts/render-videos.mjs

# Re-render all 5 Feature Spotlights (or pass --only study,articulate,podium,trivia,mathletics)
node video/scripts/render-spotlights.mjs
```

---

## 3. Editorial & Brand Guardrails (Mandatory)
- Follow `docs/BRAND_IDENTITY.md` and `docs/BRAND_CALENDAR.md`.
- **Keep the January Launch Vault Fresh:** Do NOT repeat the 65s Launch Film's exact signature lines or puzzles in pre-launch cards/teasers (reserve *"1,000 posts read"*, *"Feeling informed isn't the same as knowing."*, *"What I cannot create, I do not understand."*, `[2, 3, 4 → 20]`, Hakeem 1994, and *"Nigerian Customer Service is a Spiritual Test"* for the main launch film — draw fresh questions from `lib/mathletics-questions.ts` and fresh stories from `docs/DECISIONS_LOG.md`!).
- **Zero emojis** in card copy, tags, timers, or buttons.
- **Plainspoken Anti-Jargon copy** — clear, dignified, conversational.
- **Always visually inspect** generated PNGs with `read_file` after rendering to verify zero text clipping, balanced line breaks, and clean contrast before presenting them to the user.
