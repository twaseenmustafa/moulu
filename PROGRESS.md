# PROGRESS

| Phase | Status | Notes |
|---|---|---|
| 1 Study | done | ANALYSIS.md, Playwright + Chrome frames in research/wiemer |
| 2 Brand + design | done | Moulu — BRAND.md, DESIGN.md |
| 3 Visuals | done | 51.25 / 100 credits (CREDITS.md) |
| 4 Build | done | site/ — Vite + TS + GSAP + Lenis |
| 5 Review | done (2 passes) | exit conditions met |

## Decisions / assumptions
- Market placeholder empty → EU, EUR, free delivery DE/AT/NL/BE/FR, waitlist + free reservation (no payment).
- Stack placeholder empty; disk had 2.8 GB free and the npm-cache drive was full → Vite + TypeScript instead of Next.js (104 MB vs ~500 MB node_modules). No Three.js: scrubbed video frames give the 360 look at 1.6 MB.
- Fonts self-hosted (GDPR: no Google Fonts calls). No cookies → no cookie banner.
- Reservations stored in localStorage only (no backend) — stated on the page.

## Review scores (honest, own rubric)
| Review | Pass 1 | Pass 2 |
|---|---|---|
| Award: Design (40%) | 7.5 | 8.0 |
| Award: Usability (30%) | 8.0 | 8.5 |
| Award: Creativity (20%) | 8.0 | 8.0 |
| Award: Content (10%) | 7.5 | 8.0 |
| Weighted | 7.75 | 8.15 |
| Lighthouse mobile P/A/BP/SEO | 93/97/100/92 | 96/100/100/100 |
| Lighthouse desktop P/A/BP/SEO | 99/97/100/92 | 99/100/100/100 |
| Console errors | 0 | 0 |

Pass 1 → 2 fixes: `[hidden]` overridden by `.success{display:grid}`; sofa not overlapping wordmark; tags stretching in grids; contrast (stat units, tabs, error text, Chalk mood glow/lede); LCP delayed by opacity intro; robots.txt; mobile menu added; FAQ added; turntable dial + canvas height; craft layout at 1024; film gradient over sofa; turntable poster; mobile logo/menu collision.

## Open issues (non-critical)
- Cross-browser: verified only in Chrome (Playwright Chromium channel). Firefox/Safari not installed (disk space). Uses `:has()`, `svh`, mask-composite (prefixed), backdrop-filter (prefixed).
- Same Ember cutout appears in hero, mood stage and Dune card (by design for crossfade, but repetitive).
- Brand story, quote, guarantee, return terms are placeholders (marked on page).

## Pass 3 (user feedback, 2026-11-24): loader, hero hand-off, scroll smoothness
- Loader now plays on every load/refresh (removed session "seen" skip); `scrollRestoration = manual` + scroll to top so a refresh never lands mid-page.
- Hero intro states are set before the loader lifts; the intro starts mid-lift → no flash of the final hero, one continuous sequence.
- Hero → film: film card slides over the still-pinned hero while it scales to 0.9 and dims (stacked hand-off); removed `anticipatePin` (jolted under Lenis); scrub 1.
- Turntable: frames pre-decoded to ImageBitmaps, cross-fade between neighbouring frames, eased scrub (1.2) on a proxy tween, canvas mask replaced by a static overlay. Measured while scrubbing: 399 frames, 0 dropped (>34 ms).
- Global: Lenis lerp 0.075, parallax scrub 0.8, `ignoreMobileResize`.
- Fixed in review: nav intro transform broke mobile Menu position; mobile nav row-gap made the bar 78 px tall.
- Lighthouse: mobile 95/100/100/100, desktop 99/100/100/100; 0 console errors; reduced motion unaffected.

## Pass 4 (2026-11-24): hero scroll length
- Hero sink pin 1.2 → 0.6 viewports (mobile 0.9 → 0.5); scrub 1 → 0.6. Scroll from top to film: desktop 2.2 → 1.6 vh, mobile 1.9 → 1.5 vh (1.0 of that is the normal scroll the film needs anyway).
- Lenis wheelMultiplier 0.85 → 1 (no artificially slowed wheel). Turntable pin 1.9 → 1.4 vh (mobile 1.4 → 1.1).
- Verified: sink still reaches 9.0 cm, 0 console errors.

## Pass 5 (2026-11-24): hero supporting UI entrances
- Ruler: line draws 0→100%, then one calibration swing 0 → 9 → 0 cm. Lede: tag pops (back ease), lines wipe in from the left (clip-path). Card: pops from its corner with overshoot, contents stagger in. Hint: chars resolve from centre, then a looping scroll pulse.
- All four are children of the intro timeline (start 0.5–0.95 s), so they run with the letters/sofa. Calibration yields to the scroll scene if the user scrolls early.

## Pass 6 (2026-11-24): "animation freezes midway" (user screen recording)
- Diagnosis (recording frame-diff + Chrome long-task/LoAF traces, 1x and 4x CPU): (1) all scroll scenes + ScrollTrigger.refresh were built right after the loader lifted → 190 ms task mid-intro; (2) font swap relayout stalled the loader ring; (3) turntable frames turned into bitmaps from <img> → ~1 s main-thread hitch on first scroll.
- Fix: loader waits for fonts before drawing; builds every scroll scene behind the finished ring (after `load`), then 2 frames, then lifts; loader hidden not removed. Turntable frames fetched as blobs → createImageBitmap(blob) (off-main-thread decode), 4 in flight, preloaded in idle time after the intro.
- Result @4x throttle: lift + intro worst frame 11.6 ms (was 189 ms stall); scroll hero→turntable worst frame 20 ms after intro (was ~1000 ms), 90 ms if scrolling mid-intro while frames still load. @1x: 0 frames > 33 ms.

## Pass 7 (2026-11-24): synchronized hero entrance
- All hero entrance tweens (plane, letters, sofa, shadow, nav, ruler, lede, card + contents, hint) now share one paused timeline: every tween at position 0, duration 1.4 s, no staggers or sub-delays; ruler calibration is a single 0-9-0 keyframe tween over the same 1.4 s. Hint pulse loop starts on completion.
- Single trigger unchanged: intro.play() at the loader hand-off (loader edge mid-screen), after content is ready and scroll scenes are built.
- Fixed: intro is now built after the scroll-scene refresh, which had re-rendered the card/lede/hint at opacity 1 under the loader (flash before reveal).
- Verified fresh + reload: all elements start in the same 25 ms sample; all hidden under loader, all visible after; reduced motion shows everything with no loader.

## Pass 8 (2026-11-24): turntable + FAQ + full review
- Turntable: 121 frames (was 61), nearest frame drawn (cross-fade ghosted edges), linear rotation, scrub 0.8, needle moved by transform (was layout-triggering left), degree text only on change. Down/up @1x and @4x: 0 frames >33 ms; @4x down p95 19.9 -> 10.1 ms. Frames 2.8 MB desktop / 1.3 MB mobile, idle-preloaded.
- FAQ: plus drawn from two centred CSS bars in an outlined ring (was a font glyph, off-centre); hover fill, rotates to x when open; smooth open via ::details-content where supported.
- Review (desktop/mobile captures, interactions, widths, reduced motion): no new defects; 1px scrollWidth at 360/768 is the clipped hero bleed (no horizontal scroll).

## Pass 9 (2026-11-24): button hover
- Label roll was broken (overflow:hidden on the moving element clipped the incoming label; outgoing text stayed half-visible in the taller button). Now a fixed 1-line mask + inner span with a text-shadow duplicate sliding up 1.3em. Verified nav + reserve buttons hovered in Ember/Chalk/Cocoa.

## Pass 10 (2026-11-24): Privacy + Imprint pages
- Privacy ("Nothing to keep."): split hero w/ glass 0-cookies chip, 0/0/0/1 stat strip, browser-vs-server data-flow diagram, 4 rights tiles, working clear-my-reservations control (localStorage), contact. Imprint ("Who is behind the sofa."): flat-lay + copper nameplate (company placeholders), contact tiles, type specimens + credits, small print, wordmark back-link. Shared nav/footer, Lenis, reveals, parallax; styles in src/sub.css.
- Fixed while reviewing: curtain transition ended ON screen (GSAP kept CSS translateY(100%) as px) -> every page transition; /#section links from sub pages landed a viewport off (jump now after the loader refresh); invalid <dl> child; noindex removed (SEO 66 -> 100); mobile tile height.
- Verified x3: desktop/mobile section captures, cross-page links + curtain, all 6 landing anchors land at top=0, clear control, widths 360/768/1920 no h-scroll, reduced motion, 0 console errors, scroll 0 frames >33 ms. Lighthouse mobile: privacy 98/100/100/100, imprint 97/100/100/100.
