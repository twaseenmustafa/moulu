# Moulu — launch site

Fictional premium sofa brand (see ../BRAND.md). Vite + TypeScript, GSAP (ScrollTrigger, SplitText), Lenis.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build → dist/
npm run preview    # serve dist on :4173
node scripts/validate.check.ts   # form validator self-check
node scripts/optimize.mjs        # rebuild AVIF/WebP from ../assets-raw (raw PNGs not committed)
```

## Structure
- `index.html` — all content is in the HTML (works without JS); `privacy.html`, `imprint.html` placeholders.
- `src/modules/motion.ts` — Lenis, reveals, parallax, counters, magnetic buttons, nav, page curtain, film video.
- `src/modules/hero.ts` — loader + "The Sink" pinned hero.
- `src/modules/turntable.ts` — 61 frames scrubbed on a canvas (slider fallback for reduced motion).
- `src/modules/mood.ts` — fabric switch recolours the page via `html[data-mood]` tokens.
- `src/modules/form.ts` + `validate.ts` — reservation form, inline errors, success state, localStorage.
- `src/modules/specs.ts` — tabs + elevation drawing generated from product dimensions (`src/data.ts`).

## Notes
- Reduced motion: no smooth scroll, pins, parallax or video; everything visible; turntable becomes a slider.
- Media: hero film 820 KB desktop / 233 KB mobile, loaded only near view; skipped on Save-Data.
- Reservations are not sent anywhere — connect `form.ts` to a real endpoint before launch.
