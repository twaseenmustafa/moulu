import { gsap, ScrollTrigger, reduced } from './motion';

const FRAMES = 121; // every source frame: neighbours are 1.5° apart, so the blend never ghosts
const DEGREES = 180;

/**
 * Scroll-scrubbed turntable on a canvas. Smoothness comes from three things:
 * frames pre-decoded to ImageBitmaps (no decode stalls mid-scroll), dense frames
 * (121 over 180°, nearest drawn), and an eased scrub.
 */
export function initTurntable() {
  const canvas = document.querySelector<HTMLCanvasElement>('.turn__canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const notes = [...document.querySelectorAll<HTMLElement>('.turn__notes li')];
  const deg = document.querySelector<HTMLElement>('[data-deg]')!;
  const needle = document.querySelector<HTMLElement>('.dial__needle');
  const ticks = document.querySelector<HTMLElement>('.dial__ticks');
  let span = 0; // needle travel in px, measured on refresh so the per-frame update is transform-only
  let lastDeg = -1;
  const set = innerWidth < 800 ? 's' : 'l';
  const frames: (CanvasImageSource | undefined)[] = new Array(FRAMES);
  let loading = false;
  let last = -1;
  let progress = 0;

  // Nearest decoded frame to i (frames arrive out of order while loading).
  const near = (i: number) => {
    for (let d = 0; d < FRAMES; d++) { const f = frames[i - d] ?? frames[i + d]; if (f) return f; }
    return undefined;
  };

  const draw = (p: number, force = false) => {
    const f = p * (FRAMES - 1);
    if (!force && Math.abs(f - last) < 0.01) return;
    const i = Math.round(f); // nearest frame, no cross-fade: blending neighbours ghosted fast-moving edges
    if (!force && i === Math.round(last)) { last = f; return; }
    const a = near(i);
    if (!a) return;
    const w = (a as ImageBitmap).width;
    if (canvas.width !== w) { canvas.width = w; canvas.height = (a as ImageBitmap).height; }
    ctx.drawImage(a, 0, 0);
    last = f;
  };

  // Frames are fetched as blobs and decoded with createImageBitmap(blob): Chrome decodes those
  // off the main thread (bitmaps made from <img> elements decode/copy on it and caused scroll hitches).
  // At most 4 in flight, so the queue never floods the network or the decoder.
  const url = (i: number) => `${import.meta.env.BASE_URL}media/frames/${set}/${String(i + 1).padStart(3, '0')}.webp`;
  const decodeOne = async (i: number): Promise<CanvasImageSource> => {
    if ('createImageBitmap' in window) return createImageBitmap(await (await fetch(url(i))).blob());
    const img = new Image();
    img.src = url(i);
    await img.decode();
    return img;
  };
  const load = () => {
    if (loading) return;
    loading = true;
    let next = 0;
    const worker = async (): Promise<void> => {
      while (next < FRAMES) {
        const i = next++;
        try {
          frames[i] = await decodeOne(i);
          if (last < 0 || Math.abs(i - progress * (FRAMES - 1)) < 1.5) draw(progress, true);
        } catch { /* a missing frame falls back to its nearest neighbour */ }
      }
    };
    for (let k = 0; k < 4; k++) worker();
  };


  const update = (p: number) => {
    progress = p;
    draw(p);
    const d = Math.round(p * DEGREES);
    if (d !== lastDeg) { deg.textContent = String(d); lastDeg = d; } // text changes cost layout: only when the number changes
    if (needle) needle.style.transform = `translate3d(${p * span}px,0,0)`;
    notes.forEach((n) => { const at = +n.dataset.at!; n.classList.toggle('is-on', p >= at && p < at + 0.26); });
  };

  const measure = () => { span = ticks?.clientWidth ?? 0; update(progress); };
  ScrollTrigger.addEventListener('refresh', measure);
  measure();

  // Preload in idle time once the hero intro has settled; the scroll trigger is a backup for fast scrollers.
  const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 200));
  setTimeout(() => idle(load), 3500);
  ScrollTrigger.create({ trigger: '.turn', start: 'top bottom+=100%', once: true, onEnter: load });

  if (reduced) {
    // No pin, no scrub: an explicit slider rotates the sofa instead.
    load();
    const label = document.createElement('label');
    label.className = 'turn__slider mono';
    label.innerHTML = 'Rotate <input type="range" min="0" max="1" step="0.005" value="0" />';
    canvas.parentElement!.after(label);
    label.querySelector('input')!.addEventListener('input', (e) => update(+(e.target as HTMLInputElement).value));
    notes.forEach((n) => n.classList.add('is-on'));
    return;
  }

  // The rotation is a tween on a proxy, so scrub's easing smooths the frame index itself.
  const rot = { p: 0 };
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.turn', start: 'top top', end: () => `+=${innerHeight * (innerWidth < 800 ? 1.1 : 1.4)}`, pin: '.turn__stage', scrub: 0.8, invalidateOnRefresh: true } })
    .fromTo('.turn__canvas-wrap', { scale: 0.92 }, { scale: 1, ease: 'power2.out', duration: 0.12 }, 0)
    .to(rot, { p: 1, duration: 0.88, onUpdate: () => update(rot.p) }, 0.08) // linear: constant turn speed per scroll px
    .to({}, { duration: 0.04 });
}
