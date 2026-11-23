import { gsap, ScrollTrigger, reduced } from './motion';

const FRAMES = 61;
const DEGREES = 180;

/**
 * Scroll-scrubbed turntable on a canvas. Smoothness comes from three things:
 * frames pre-decoded to ImageBitmaps (no decode stalls mid-scroll), a cross-fade
 * between neighbouring frames (no visible stepping), and an eased scrub.
 */
export function initTurntable() {
  const canvas = document.querySelector<HTMLCanvasElement>('.turn__canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const notes = [...document.querySelectorAll<HTMLElement>('.turn__notes li')];
  const deg = document.querySelector<HTMLElement>('[data-deg]')!;
  const dial = document.querySelector<HTMLElement>('.dial');
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
    const i = Math.floor(f), t = f - i;
    const a = near(i);
    if (!a) return;
    const w = (a as ImageBitmap).width;
    if (canvas.width !== w) { canvas.width = w; canvas.height = (a as ImageBitmap).height; }
    ctx.globalAlpha = 1;
    ctx.drawImage(a, 0, 0);
    const b = t > 0.02 ? frames[i + 1] : undefined;
    if (b) { ctx.globalAlpha = t; ctx.drawImage(b, 0, 0); }
    last = f;
  };

  const load = () => {
    if (loading) return;
    loading = true;
    for (let i = 0; i < FRAMES; i++) {
      const img = new Image();
      img.src = `/media/frames/${set}/${String(i + 1).padStart(3, '0')}.webp`;
      img.decode()
        .then((): Promise<CanvasImageSource> | CanvasImageSource => ('createImageBitmap' in window ? createImageBitmap(img) : img))
        .then((bmp) => { frames[i] = bmp; draw(progress, true); })
        .catch(() => {});
    }
  };

  const update = (p: number) => {
    progress = p;
    draw(p);
    deg.textContent = String(Math.round(p * DEGREES));
    dial?.style.setProperty('--p', p.toFixed(4));
    notes.forEach((n) => { const at = +n.dataset.at!; n.classList.toggle('is-on', p >= at && p < at + 0.26); });
  };

  // Start fetching + decoding a screen before the section arrives.
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
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.turn', start: 'top top', end: () => `+=${innerHeight * (innerWidth < 800 ? 1.4 : 1.9)}`, pin: '.turn__stage', scrub: 1.2, invalidateOnRefresh: true } })
    .fromTo('.turn__canvas-wrap', { scale: 0.92 }, { scale: 1, ease: 'power2.out', duration: 0.12 }, 0)
    .to(rot, { p: 1, duration: 0.88, ease: 'power1.inOut', onUpdate: () => update(rot.p) }, 0.08)
    .to({}, { duration: 0.04 });
}
