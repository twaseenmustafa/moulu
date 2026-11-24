# site/

The Moulu website. Vite + TypeScript, GSAP (ScrollTrigger, SplitText), Lenis. No framework.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build → dist/
npm run preview    # serve dist on :4173
node scripts/validate.check.ts   # reservation validator self-check
node scripts/optimize.mjs        # rebuild AVIF/WebP from ../assets-raw (raw files not in the repo)
```

## Where things live
| | |
|---|---|
| `index.html` | The landing page. All content is in the HTML, so it reads without JS. |
| `privacy.html` · `imprint.html` | The two small pages. Share `src/legal.ts` and `src/sub.css`. |
| `src/modules/hero.ts` | Loader, one 1.4 s intro timeline, the scroll "Sink". |
| `src/modules/turntable.ts` | 121 frames on a canvas, scrubbed by scroll (a slider if motion is reduced). |
| `src/modules/mood.ts` | Fabric switch. Sets `html[data-mood]`, and CSS tokens recolour the page. |
| `src/modules/motion.ts` | Lenis, reveals, parallax, nav, page curtain, hero film. |
| `src/modules/form.ts` · `validate.ts` | Reservation form. Stored in `localStorage` only. |
| `src/data.ts` | Products, fabrics, prices. Specs drawings are generated from it. |
| `public/media/` | Optimised AVIF/WebP, video and turntable frames (committed). |

## Before you change anything
- Never transform `.nav` or `.nav__nav`. The hide-on-scroll CSS and the mobile menu depend on them.
- Build the hero intro **after** the scroll scenes exist.
- GSAP owns transforms on `.curtain` and the hero sofa, shadow and letters.
- The reservation form sends nothing anywhere. Point `form.ts` at a real endpoint before launch.

Why those rules exist: [docs/LESSONS.md](../docs/LESSONS.md).
