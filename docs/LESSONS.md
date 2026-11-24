# Lessons — six things that broke

Every one of these was found by watching a screen recording or a performance trace, not by guessing. Each has the symptom, the cause and the rule it left behind.

## 1 · "The animation freezes midway"
**Symptom.** The hero intro stuttered right after the loader lifted.
**Cause.** Every scroll scene and a full `ScrollTrigger.refresh()` ran *as* the loader lifted: one 190 ms task in the middle of the intro. A font swap also stalled the loader ring.
**Fix.** Do the heavy work *behind* the finished loader ring. Wait for fonts, build every scene, wait two frames, then lift. Worst frame fell from 189 ms to 11.6 ms.
**Rule.** Never build scroll scenes while something is animating.

## 2 · "The turntable hitches on first scroll"
**Symptom.** About 1 second of jank when scrolling into the 360° sofa.
**Cause.** Frames were turned into bitmaps from `<img>` elements, on the main thread.
**Fix.** Fetch each frame as a blob and call `createImageBitmap(blob)`, which decodes off-thread. Four in flight, preloaded in idle time. Worst frame fell from ~1000 ms to 20 ms.
**Rule.** Decode images where the main thread isn't.

## 3 · "Ghosts on the turntable"
**Symptom.** Cross-fading between neighbouring frames left faint double edges.
**Fix.** Draw the nearest frame only and double the frame count (61 → 121). Rotation is linear, the needle moves by `transform`, and the degree label updates only when it changes.
**Rule.** More frames beat clever blending.

## 4 · "The intro doesn't feel like one thing"
**Symptom.** Letters, sofa, ruler and card arrived at slightly different moments.
**Fix.** One paused timeline: every tween at position 0, duration 1.4 s, no staggers. Play it once, from one trigger.
**Rule.** If it should feel like one gesture, build it as one timeline.

## 5 · "A flash of the finished hero"
**Symptom.** The card and lede appeared for one frame under the loader.
**Cause.** The intro was built *before* the scroll-scene refresh, which reset them to opacity 1.
**Fix.** Build the intro *after* the scroll scenes exist.
**Rule.** Order of construction is part of the design.

## 6 · "The page curtain ends on screen"
**Symptom.** Page transitions finished with the curtain still covering the page.
**Cause.** GSAP kept a CSS `translateY(100%)` as pixels.
**Fix.** Let GSAP own the transform completely (`yPercent`), never CSS and GSAP together.
**Rule.** One owner per transform.

---

### The numbers it ended on
- Scroll: **0 frames over 33 ms** in Chrome at 1× and 4× CPU throttle.
- Lighthouse: 95–98 performance (mobile), 100 accessibility, 100 best practices, 100 SEO.
- Weight: turntable 2.8 MB desktop / 1.3 MB mobile; hero film 820 KB / 233 KB, loaded only near view.
- Runs in Chrome, Firefox and WebKit. With `prefers-reduced-motion`, everything shows and nothing moves.
