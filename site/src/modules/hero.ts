import { gsap, ScrollTrigger, reduced, lenis, SINK } from './motion';

const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const LATE = ['.hero__lede', '.hero__card', '.hero__ruler', '.hero__hint'];

/**
 * Hero entrance, built paused with its start states applied immediately,
 * so nothing is ever visible in its final state before the loader reveals it.
 */
function buildIntro() {
  const letters = gsap.utils.toArray<SVGGElement>('.hero__l');
  // CSS centres these with translateX(-50%); hand that to GSAP so scale/y compose cleanly.
  gsap.set(['.hero__sofa', '.hero__shadow', '.hero__word'], { xPercent: -50, x: 0 });
  return gsap.timeline({ paused: true, defaults: { ease: SINK } })
    .fromTo('.hero__plane', { scale: 1.12 }, { scale: 1, duration: 1.8 }, 0)
    .fromTo(letters, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.25, stagger: 0.07 }, 0.1)
    // the sofa drops in and settles: the brand's "sink", told once on arrival
    .fromTo('.hero__sofa img', { y: -70, scale: 0.92 }, { y: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, 0.25)
    .fromTo('.hero__shadow', { opacity: 0, scaleX: 0.55 }, { opacity: 1, scaleX: 1, duration: 1.4 }, 0.45)
    // nav: opacity on the bar + lift on its children (the bar's own transform belongs to the hide-on-scroll CSS)
    .fromTo('.nav', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.55)
    // never transform .nav__nav: it would become the containing block of the absolute mobile Menu button
    .fromTo(['.nav__logo', '.nav__menu', '.nav__links', '.nav > .btn'], { y: -16 }, { y: 0, duration: 1.1, stagger: 0.06, clearProps: 'transform' }, 0.55)
    .fromTo(LATE, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.75);
}

/** Loader plays on every load; the hero intro starts while the loader is lifting. */
export async function runLoader(): Promise<void> {
  const loader = q('.loader');
  if (reduced) { loader.remove(); return; }
  const intro = buildIntro();
  lenis?.stop();
  const img = q<HTMLImageElement>('.hero__sofa img');
  const count = q('.loader__count');
  const o = { p: 0 };
  const fill = gsap.timeline()
    .to('.loader__mark', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(o, { p: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(o.p)).padStart(3, '0')) }, 0);
  await Promise.all([
    Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1600))]),
    fill.then(),
  ]);
  await new Promise<void>((done) => {
    gsap.timeline({ onComplete: done })
      .to(['.loader__mark', '.loader__count'], { yPercent: -60, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(loader, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 0.15)
      .add(() => { intro.play(); }, 0.55); // hero starts moving as the loader edge passes mid-screen
  });
  loader.remove();
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
