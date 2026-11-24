import { gsap, ScrollTrigger, SplitText, reduced, lenis, SINK } from './motion';

const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const LATE = ['.hero__lede', '.hero__card', '.hero__ruler', '.hero__hint'];

/** One clock for the whole hero entrance: every tween starts at 0 and lasts D, so all of it starts and ends together. */
const D = 1.4;

/**
 * Hero entrance, built paused with its start states applied immediately,
 * so nothing is ever visible in its final state before the loader reveals it.
 */
function buildIntro() {
  const letters = gsap.utils.toArray<SVGGElement>('.hero__l');
  const label = q('[data-sink]');
  const line = q('.hero__ruler i');
  const hint = q('.hero__hint-line');
  const chars = SplitText.create('.hero__hint-t', { type: 'chars' }).chars;
  const v = { s: 0 };
  const sink = () => { if (scrollY > 2) return; // the scroll scene owns the ruler once the user scrolls
    label.textContent = v.s.toFixed(1); line.style.setProperty('--sink', `${v.s * 12}px`); };
  // the scroll cue's idle pulse starts after the entrance (it is a loop, not part of the reveal)
  const pulse = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.4 })
    .fromTo(hint, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.7, ease: 'power2.inOut' })
    .set(hint, { transformOrigin: '50% 100%' })
    .to(hint, { scaleY: 0, duration: 0.7, ease: 'power2.inOut' });
  gsap.set(hint, { scaleY: 0 });
  // CSS centres these with translateX(-50%); hand that to GSAP so scale/y compose cleanly.
  gsap.set(['.hero__sofa', '.hero__shadow', '.hero__word'], { xPercent: -50, x: 0 });

  return gsap.timeline({ paused: true, defaults: { ease: SINK, duration: D }, onComplete: () => { pulse.play(); } })
    .fromTo('.hero__plane', { scale: 1.12 }, { scale: 1 }, 0)
    .fromTo(letters, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0)
    .fromTo('.hero__sofa img', { y: -70, scale: 0.92 }, { y: 0, scale: 1 }, 0) // the sofa drops in and settles
    .fromTo('.hero__shadow', { opacity: 0, scaleX: 0.55 }, { opacity: 1, scaleX: 1 }, 0)
    // nav: opacity on the bar + lift on its children (the bar's own transform belongs to the hide-on-scroll CSS;
    // never transform .nav__nav: it would become the containing block of the absolute mobile Menu button)
    .fromTo('.nav', { opacity: 0 }, { opacity: 1, ease: 'power2.out' }, 0)
    .fromTo(['.nav__logo', '.nav__menu', '.nav__links', '.nav > .btn'], { y: -16 }, { y: 0, clearProps: 'transform' }, 0)
    // ruler: line draws top→bottom while labels arrive; one calibration swing 0 → 9 → 0 cm
    .fromTo('.hero__ruler > span', { opacity: 0, y: -10 }, { opacity: 1, y: 0, ease: 'power3.out' }, 0)
    .fromTo(line, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, ease: 'power3.inOut' }, 0)
    .fromTo('.hero__ruler > b', { opacity: 0, y: 10 }, { opacity: 1, y: 0, ease: 'power3.out' }, 0)
    .to(v, { keyframes: { s: [0, 9, 0] }, ease: 'power2.inOut', onUpdate: sink }, 0)
    // lede: tag pops, lines wipe in from the left
    .fromTo('.hero__lede .tag', { scale: 0, opacity: 0, transformOrigin: '0% 50%' }, { scale: 1, opacity: 1, ease: 'back.out(2)' }, 0)
    .fromTo('.hero__lede-l', { clipPath: 'inset(0% 100% 0% 0%)', x: -28 }, { clipPath: 'inset(0% 0% 0% 0%)', x: 0, ease: 'expo.out' }, 0)
    // card: pops from its corner; contents fade up with it
    .fromTo('.hero__card', { opacity: 0, y: 50, scale: 0.86, transformOrigin: '100% 100%' }, { opacity: 1, y: 0, scale: 1, ease: 'back.out(1.4)' }, 0)
    .fromTo('.hero__card > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, ease: 'power3.out' }, 0)
    // scroll hint: letters resolve
    .fromTo(chars, { opacity: 0, y: 8 }, { opacity: 1, y: 0, ease: 'power2.out' }, 0);
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const within = (p: Promise<unknown>, ms: number) => Promise.race([p.catch(() => {}), new Promise((r) => setTimeout(r, ms))]);

/**
 * Loader plays on every load. All heavy work is scheduled into moments where nothing moves,
 * so no animation ever drops frames:
 *  1. fonts settle (the font swap re-lays out the page) — before the ring starts drawing
 *  2. ring draws while the hero image decodes and the page `load` event fires
 *  3. `setup()` builds every scroll scene + one refresh — while the finished ring holds still
 *  4. loader lifts and the hero intro plays on an idle main thread
 */
export async function runLoader(setup: () => void): Promise<void> {
  const loader = q('.loader');
  if (reduced) { loader.remove(); setup(); return; }
  lenis?.stop();
  await within(document.fonts.ready, 900);
  await frame();

  const img = q<HTMLImageElement>('.hero__sofa img');
  const count = q('.loader__count');
  const o = { p: 0 };
  performance.mark('loader:fill');
  const fill = gsap.timeline()
    .to('.loader__mark', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(o, { p: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(o.p)).padStart(3, '0')) }, 0);
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
  await Promise.all([within(img.decode(), 2000), within(loaded, 2500), fill.then()]);

  performance.mark('loader:setup');
  setup();
  ScrollTrigger.refresh();
  // built after the scroll scenes: their refresh renders opacity 1 on the lede/card/hint, so the intro's
  // start states must be applied last or those elements would flash in before the reveal
  const intro = buildIntro();
  await frame(); // let the setup's layout/paint land before anything moves again

  performance.mark('loader:exit');
  await new Promise<void>((done) => {
    gsap.timeline({ onComplete: done })
      .to(['.loader__mark', '.loader__count'], { yPercent: -60, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 0.15)
      .add(() => { intro.play(); }, 0.6); // hero starts moving as the loader edge passes mid-screen
  });
  performance.mark('loader:done');
  loader.style.display = 'none'; // hide, don't remove: no DOM mutation while the intro is still running
  lenis?.start();
}

/** "The Sink" scroll scene, then the film card slides over the dimming hero. */
export function initHero() {
  const letters = gsap.utils.toArray<SVGGElement>('.hero__l');
  const sinkLabel = q('[data-sink]');
  const ruler = q('.hero__ruler i');
  const film = q('.film');
  if (reduced) { sinkLabel.textContent = '9.0'; ruler.style.setProperty('--sink', '108px'); return; }

  const mm = gsap.matchMedia();
  mm.add({ wide: '(min-width: 901px)', narrow: '(max-width: 900px)' }, (ctx) => {
    const wide = ctx.conditions!.wide;
    const sinkLen = wide ? 0.6 : 0.5; // viewport heights spent on the sink: enough to read it, short enough not to stall
    const stack = 1 / sinkLen; // the film overlap lasts exactly one viewport
    const spread = wide ? [-24, -12, 0, 12, 24] : [-30, -15, 0, 15, 30];
    const o = { s: 0 };
    // The film starts one viewport early so it slides over the still-pinned hero.
    const overlap = () => { film.style.marginTop = `-${innerHeight}px`; };
    overlap();
    ScrollTrigger.addEventListener('refreshInit', overlap);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.hero', start: 'top top', end: () => `+=${innerHeight * (sinkLen + 1)}`, pin: '.hero__stage', scrub: 0.6, invalidateOnRefresh: true },
    });
    // depth layers move at different speeds (L0 0.2 → L4 1.3)
    tl.to('.hero__plane', { yPercent: -6, duration: 1 }, 0)
      .to('.hero__word', { y: () => -innerHeight * 0.1, duration: 1 }, 0)
      .to(letters, { x: (i: number) => (spread[i] * innerWidth) / 100 * (557 / Math.min(innerWidth * 0.86, 1420)), duration: 1 }, 0)
      .to(letters[2], { scaleY: 0.55, transformOrigin: '50% 100%', duration: 0.6, ease: 'power2.inOut' }, 0.4) // the middle U gets sat on
      .to('.hero__sofa', { scale: wide ? 1.16 : 1.1, duration: 0.5, ease: 'power1.out' }, 0)
      .to('.hero__sofa', { y: () => innerHeight * 0.07, duration: 0.5, ease: 'power2.inOut' }, 0.5)
      .to('.hero__shadow', { scaleX: 1.25, scaleY: 1.4, duration: 1 }, 0)
      .to(o, { s: 9, duration: 0.5, ease: 'power2.inOut', onUpdate: () => { sinkLabel.textContent = o.s.toFixed(1); ruler.style.setProperty('--sink', `${o.s * 12}px`); } }, 0.5)
      .fromTo(LATE.filter((s) => s !== '.hero__ruler'), { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.25, immediateRender: false }, 0)
      // hand-off: hero recedes and darkens while the film card covers it
      .to('.hero__inner', { scale: 0.9, yPercent: -5, borderRadius: 44, duration: stack, ease: 'power1.in' }, 1)
      .to('.hero__dim', { opacity: 0.6, duration: stack, ease: 'power1.in' }, 1);

    return () => { ScrollTrigger.removeEventListener('refreshInit', overlap); film.style.marginTop = ''; };
  });
}
