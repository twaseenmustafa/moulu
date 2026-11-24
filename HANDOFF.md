# HANDOFF — Moulu launch site (read this first in a new chat)

**What it is:** fictional premium sofa brand "Moulu" + award-style launch site. Brand/design docs: BRAND.md, DESIGN.md. Wiemer study: ANALYSIS.md. Full history of decisions, fixes, scores: PROGRESS.md. Higgsfield credit ledger: CREDITS.md.

**Stack:** Vite + TypeScript (vanilla), GSAP (ScrollTrigger, SplitText), Lenis. No Next.js (disk was nearly full). Code in `site/`; run `cd site && npm install && npm run dev` (build: `npm run build`, preview on :4173).

**Pages:** `index.html` (landing), `privacy.html`, `imprint.html` (share `src/legal.ts` + `src/sub.css`).

**Key modules (`site/src/modules/`):** hero.ts (loader + one synchronized 1.4 s intro timeline + scroll "Sink" + hero->film hand-off), turntable.ts (121 frames on canvas, scroll-scrubbed), motion.ts (Lenis, reveals, parallax, nav, curtain transitions), mood.ts (fabric switch recolours page), form.ts + validate.ts (reservation, localStorage only), specs.ts.

**State:** Lighthouse ~96-98 / 100 / 100 / 100 (mobile/desktop). 0 console errors. Tested in Chrome only.

**Gotchas learned:**
- Never transform `.nav` or `.nav__nav` (hide-on-scroll CSS + mobile Menu button depend on it).
- Hero intro must be built AFTER scroll scenes are created (their refresh resets start states).
- Heavy setup runs behind the finished loader ring; turntable frames decode off-thread (createImageBitmap(blob)).
- GSAP owns transforms on `.curtain`, `.hero__sofa/.shadow/.word` (xPercent set in JS).
- Raw Higgsfield PNG/MP4 sources live in `assets-raw/` (git-ignored, not in repo). `site/scripts/optimize.mjs` needs them; optimized media in `site/public/media` IS committed.

**Open items:** connect reservation form to a real backend; real legal text/company details (placeholders in brackets); test Firefox + Safari; brand story/quote/guarantee/returns are placeholders; ruler sits close to last "U" at some desktop widths; Higgsfield budget: 51.25/100 (site) + 4/10 (legal pages) used.

**Credits for Higgsfield MCP:** model gpt_image_2_6 for images, kling3_0 (pro, silent) for video; master sofa job id 9a377c31-cec3-46a5-b2c7-2cf6da7e3bc9 (reference for all sofa images).
