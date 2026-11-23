import { gsap, reduced, lenis, SINK } from './motion';

const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;

/** Loader: waits only for the hero image (max 1.4 s), then lifts away. */
export async function runLoader(): Promise<void> {
  const root = document.documentElement;
  const loader = q('.loader');
  if (reduced || root.classList.contains('seen')) { loader.remove(); return; }
  sessionStorage.setItem('moulu-seen', '1');
  lenis?.stop();
  const img = q<HTMLImageElement>('.hero__sofa img');
  const count = q('.loader__count');
  const o = { p: 0 };
  const tl = gsap.timeline();
  tl.to('.loader__mark', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(o, { p: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(o.p)).padStart(3, '0')) }, 0);
  await Promise.all([
    Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1400))]),
    tl.then(),
  ]);
  await gsap.to(loader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }).then();
  loader.remove();
  lenis?.start();
}

/** Intro + "The Sink" scroll scene. */
export function initHero() {
  const letters = gsap.utils.toArray<SVGGElement>('.hero__l');
  const sinkLabel = q('[data-sink]');
  const ruler = q('.hero__ruler i');
  if (reduced) { sinkLabel.textContent = '9.0'; ruler.style.setProperty('--sink', '108px'); return; }

  // CSS centres these with translateX(-50%); hand that to GSAP so scale/y compose cleanly.
  gsap.set(['.hero__sofa', '.hero__shadow', '.hero__word'], { xPercent: -50, x: 0 });
  gsap.timeline({ defaults: { ease: SINK } })
    .from(letters, { yPercent: 120, opacity: 0, duration: 1.3, stagger: 0.07 })
    .from('.hero__sofa img', { y: 80, opacity: 0, scale: 0.94, duration: 1.5 }, 0.25)
    .from('.hero__shadow', { opacity: 0, duration: 1.5 }, 0.35)
    .from(['.hero__lede', '.hero__card', '.hero__ruler', '.hero__hint'], { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.6);

  const mm = gsap.matchMedia();
  mm.add({ wide: '(min-width: 901px)', narrow: '(max-width: 900px)' }, (ctx) => {
    const wide = ctx.conditions!.wide;
    const spread = wide ? [-24, -12, 0, 12, 24] : [-30, -15, 0, 15, 30];
    const o = { s: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.hero', start: 'top top', end: wide ? '+=120%' : '+=90%', pin: '.hero__stage', scrub: 0.6, anticipatePin: 1 },
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
      .fromTo(['.hero__lede', '.hero__card', '.hero__hint'], { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.25, immediateRender: false }, 0);
  });
}
