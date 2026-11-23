# ANALYSIS — wiemer.store + /references

Method: headless Chrome via Playwright (desktop 1440×900, mobile 390×844, touch). Loader sampled every 250 ms; page scrolled with real wheel events in 0.5-viewport steps (700 ms settle); inline `transform`/`opacity` of in-view elements sampled every 450 px; computed styles + loaded scripts read from the DOM. Raw data: `research/wiemer/study.json`, frames + contact sheets in `research/wiemer/`.

## 1. Stack (observed)
Webflow (`meta generator`), `html.lenis` class → Lenis 1.3.17 smooth scroll. GSAP 3.15 + ScrollTrigger, SplitText, ScrambleText, Flip, CustomEase, Observer, Inertia. Swiper 12 + Flickity (draggable marquee), Finsweet attributes. Font: **Neue Montreal 500** everywhere, letter-spacing −0.25px. Body `#fbfbfb` on `#333`. Accent: saturated orange (~`#ff6a1a`).

## 2. Section inventory (in order, observed)
| # | Section | Layout | Motion / trigger / timing (observed) |
|---|---|---|---|
| 1 | Loader | full-screen orange, centred logo, status text bottom ("Seite lädt… → Geladen") + thin progress bar along bottom edge | logo fades in over ~1.8 s; status swaps; loader still mounted at 3.75 s, then wipes to hero. ~3.5–4 s total — long. |
| 2 | Hero | full-bleed `<video>` (desktop `wiemer_desktop.mp4`, mobile `wiemer_mobile.mp4`, shared AVIF poster, autoplay/muted/loop, `preload=auto`); giant wordmark 180px/162px lh at bottom-left; pill CTA card bottom-right (thumbnail + "coming soon" tag + link) | nav transparent → solid swap; `parallax-img` translates −1.6% → +5.5% Y across the viewport (scrubbed). |
| 3 | Intro headline "Hello there, …" | XL left headline, small paragraph right | Lines enter `translate(0, ~110%)→0` with opacity .9→1 (SplitText line mask); paragraph lines reveal progressively (scrubbed, observed partial `translate(0,23%/46%/91%)` simultaneously = staggered scrub). |
| 4 | Component marquee | grey rounded tiles with product parts | Draggable marquee, continuous X drift (−676 → −716 px over one step) + drag/inertia. |
| 5 | Waitlist | "Coming 2027" XL centred, dot-grid background, card with 2 prices (199€/249€), email + consent checkbox, full-width blue submit | headline line reveal; form is plain. |
| 6 | Floating part | perforated plate with screws over white | plate floats/rotates on scroll (parallax). |
| 7 | About / founder | "About" XL, quote paragraph, portrait image | line reveals, parallax image. |
| 8 | Hotspot image | full-bleed lifestyle with `+` hotspots | hover/click tooltips. |
| 9 | Specs | orange panel, "Specs" 64px, pill tabs (product toggle, "bouncy-tabs" opacity crossfade), technical line drawing, two-column spec table with hairlines | tab crossfade ~0.6 s. |
| 10 | Footer | logo, tagline, 3 link columns, sticky mini waitlist card | — |
| 11 | Cookie modal | bottom-right card, blue buttons | slides up `translate3d(0,15rem)→0`, stays across the whole page until answered. |

Mobile: same order, single column; wordmark sits over the bottom of the video with tagline; carousel tiles become 2-up; cookie card covers ~40% of the viewport.

## 3. Motion system (observed)
- Easing tokens: `cubic-bezier(.625,.05,0,1)` (0.6 s, transforms/opacity of reveals) and `cubic-bezier(.38,.005,.215,1)` (0.3 s, buttons). Button label swap: two stacked labels, `.initial`/`.hover` translate Y 0↔−100%.
- Reveal = line mask slide (110% → 0) — the one dominant gesture, reused for every headline.
- Parallax = small (±6%) Y drift on images. No depth layering, no scale, no rotation.
- Video: one hero loop, separate mobile file, poster AVIF. `preload=auto` on both → both are fetched on mobile (waste).

## 4. Typography, colour, spacing
One family, one weight (500). Scale ~20 / 40 / 64 / 180 px. Tight tracking. Lots of white; orange used as a full-panel colour (loader, specs) not as decoration. Spacing generous, 8-pt-ish, large section padding (~160px desktop).

## 5. /references analysis
| Ref | What it does | What we take (pattern, not content) |
|---|---|---|
| 1 Fluz | Giant soft wordmark with objects overlapping letters; bento grid of rounded cards; glossy 3D objects | Giant wordmark *behind* product, rounded bento containers |
| 2 SD card | Dark device frame, orange inset, mono micro-labels, barcode/ticks | Micro-labels in mono, tick rulers, dark framed panels |
| 3 Creatie | Glass chips floating over a photo, tiny handwritten doodles | Glass chips/cards over imagery |
| 4 Helious | Huge light wordmark over a warm cinematic photo, small paragraph + pill CTA | Cinematic warm hero, pill CTA with circular arrow |
| 5 (orange chair) | Product overlaps giant wordmark; copper gradient glass panel; **stat strip** (big number + tiny caption, hairline dividers); dark contrast panel; rounded corners | The palette and the stat strip, copper glass gradient, dark panel rhythm |

Sampled palette (median-cut on the references): `#dc6d30` orange, `#b64319` copper, `#942710` rust, `#3b1111` oxblood, `#f7efed` cream, `#d9bfaf` sand, `#a56343` bronze, `#442c24` cocoa, `#1e1d1c` near-black, `#c5b299` warm parchment (ref 4 text).

Why the references feel premium: (1) one oversized typographic gesture per frame, (2) product breaks the grid by overlapping type, (3) restrained palette with one hot colour, (4) tiny precise micro-type next to huge type (scale contrast ≥ 1:10), (5) hairlines and numbers signal engineering.

## 6. Ranking
**What makes Wiemer feel premium**
1. Single typeface + tight tracking + huge wordmark → confident, quiet.
2. Orange used as whole surfaces (loader, specs), not sprinkles.
3. Consistent line-mask reveal + one custom ease → feels authored.
4. Real product video in a lived-in room; separate mobile cut.
5. Spec table with hairlines + technical drawing → trust.

**Where it is weak / slow / generic**
1. Loader ~3.5–4 s for a page that has nothing to preload — friction before the product.
2. Both hero videos `preload=auto` on mobile; cookie modal covers 40% of mobile viewport for the whole visit.
3. Motion is shallow: ±6% parallax, no depth, no product interaction — the product never *moves*.
4. Waitlist is a generic form with a default blue button that breaks the palette.
5. Duplicate GSAP loaded twice (Webflow CDN + jsDelivr) — ~2× script weight.
6. No way to see the product from more than one angle or in other finishes.
