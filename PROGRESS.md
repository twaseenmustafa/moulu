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
