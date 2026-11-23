# DESIGN — Moulu launch site

**Concept:** *The sink.* Everything on the page settles downward and softly into place — type, images and the sofa itself — as if the whole site were sitting down.

## Type
- Display: **Bricolage Grotesque** (variable, 200–800, opsz) — wide, soft, slightly quirky; used at 800 for the wordmark-scale headlines, tight tracking (−0.04em).
- Text: **Inter Tight** 400/500.
- Micro: **JetBrains Mono** 500, 11–12 px, uppercase +0.08em (labels, tick rulers, spec keys) — from ref 2.
- Scale (fluid clamp): 12 · 14 · 16 · 20 · 28 · 44 · 72 · 120 · 22vw (wordmark).

## Colour tokens (sampled from /references)
| Token | Hex | Use |
|---|---|---|
| `--ember` | `#dc6d30` | primary accent, CTAs |
| `--copper` | `#b64319` | gradients, hover |
| `--rust` | `#942710` | deep gradient stop |
| `--oxblood` | `#3b1111` | dark panel tint |
| `--cream` | `#f7efed` | page background |
| `--sand` | `#d9bfaf` | cards, rules |
| `--bronze` | `#a56343` | secondary text on cream (AA at ≥18px) |
| `--cocoa` | `#442c24` | body text on cream |
| `--ink` | `#1e1d1c` | dark panels, primary text |
Copper glass: `linear-gradient(160deg, #dc6d30cc, #942710e6)` + 1px `#ffffff26` border + backdrop-blur 18px.
Body text on cream uses `--ink`/`--cocoa` (≥ 9:1). Orange is never used for small text on cream (3.0:1) — only ≥ 24px bold or as fill under ink/cream text.

## Spacing
4-pt base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 144. Section padding `clamp(96px, 12vw, 176px)`. Radii: 14 (chips), 28 (cards), 44 (panels), 999 (pills).

## Motion language
- `--ease-sink: cubic-bezier(.22,1,.36,1)` (settle; reveals, 0.9 s).
- `--ease-press: cubic-bezier(.65,0,.35,1)` (UI, 0.35 s).
- Rules: reveal = rise 40px + fade, then settle (ease-sink overshoot-free), never fly sideways; stagger 60 ms; nothing loops except the hero video; only `transform`/`opacity`; motion never gates content (all text in DOM, visible without JS); `prefers-reduced-motion` → no smooth scroll, no scrub, no parallax, reveals become instant, video replaced by poster.

## Parallax depth plan (hero)
| Layer | Content | Scroll speed (y) / effect |
|---|---|---|
| L0 | warm gradient plane (copper → cream) | 0.2 |
| L1 | giant MOULU wordmark | 0.45, letters spread apart (x ±) |
| L2 | soft contact shadow (CSS radial) | 0.8, scales with sofa |
| L3 | sofa cutout (transparent WebP/AVIF) | 1.0, scale 1 → 1.18 then *sinks* 6vh |
| L4 | floating swatch chips (glass) | 1.3 + slight rotate |

## Signature interactions (Wiemer has none of these)
1. **The Sink (hero):** sofa cutout sits *in front of* the giant wordmark; on scroll it scales and settles downward while the letters part around it — the brand promise acted out. Pinned, scrubbed.
2. **Mood switch:** three fabric swatches (Ember / Chalk / Cocoa) recolour the whole page (CSS custom properties, 600 ms) and crossfade the sofa image to that fabric. Serves the real buying decision: choose your fabric.
3. **Turn it around:** a generated turntable video, extracted to frames, scrubbed on scroll on a canvas — inspect the back and the arm profile before you reserve.
4. **9 cm counter strip:** stat strip (ref 5) whose numbers count up on enter, with a live tick-ruler that physically dips 9 cm-equivalent — the sink, measured.

## Section plan (9)
1. Loader (≤ 1.2 s, skippable, only waits for hero image)
2. Hero — The Sink
3. Manifesto line ("Built backwards from nine centimetres.")
4. Turn it around — scrubbed turntable + spec callouts
5. Craft — layered anatomy (frame / springs / 3 foams / feathers / fabric) on dark panel
6. Stats strip — counters
7. Mood switch + collection (Dune / Pebble / Crumb)
8. Reserve — waitlist with product + fabric choice, validation, success state
9. Story (placeholder) → Specs (tabs + drawing) → Footer (legal links, placeholder imprint)
