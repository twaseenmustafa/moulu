import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const SINK = 'expo.out';
export let lenis: Lenis | null = null;

export function initScroll() {
  if (reduced) return;
  scrollTo(0, 0); // every load starts at the top, so the loader → hero sequence always plays
  ScrollTrigger.config({ ignoreMobileResize: true });
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 1, touchMultiplier: 1.4, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // In-page anchors go through Lenis so pinned sections stay in sync.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href')!);
    if (!target) return;
    e.preventDefault();
    lenis!.scrollTo(target as HTMLElement, { offset: 0, duration: 1.4 });
    (target as HTMLElement).setAttribute('tabindex', '-1');
    (target as HTMLElement).focus({ preventScroll: true });
  });
}

/** Line-mask headlines, fade-rise blocks, parallax images, counters. */
export function initReveals() {
  if (reduced) return;
  document.querySelectorAll<HTMLElement>('.reveal-lines').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => {
        gsap.set(el, { opacity: 1 });
        return gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: SINK, stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      },
    });
  });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: SINK, stagger: 0.07 }),
  });
  document.querySelectorAll<HTMLElement>('.parallax').forEach((fig) => {
    const s = parseFloat(fig.dataset.speed || '0.1');
    const img = fig.querySelector('img')!;
    gsap.set(img, { scale: 1 + Math.abs(s) * 1.6 });
    gsap.fromTo(img, { yPercent: -s * 50 }, { yPercent: s * 50, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
  });
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const n = +el.dataset.count!;
    const o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: n, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(o.v))), scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
}

/** Magnetic pull on fine pointers only. */
export function initMagnetic() {
  if (reduced || !finePointer) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

/** Hide nav while scrolling down, reveal on scroll up. */
export function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]')!;
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-hidden', y > 200 && y > last && !nav.contains(document.activeElement));
    last = y;
  }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  // Mobile menu: toggles the same link list; closes on link choice or Escape.
  const btn = nav.querySelector<HTMLButtonElement>('.nav__menu')!;
  const setOpen = (open: boolean) => { nav.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Close' : 'Menu'; };
  btn.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); } });
}

/** Curtain page transition for links marked data-transition. */
export function initTransitions() {
  const curtain = document.querySelector<HTMLElement>('.curtain');
  if (!curtain) return;
  if (sessionStorage.getItem('moulu-curtain') && !reduced) {
    sessionStorage.removeItem('moulu-curtain');
    gsap.fromTo(curtain, { yPercent: 0 }, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.1 });
  }
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-transition]');
    if (!a || reduced || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    sessionStorage.setItem('moulu-curtain', '1');
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.in', onComplete: () => { location.href = a.href; } });
  });
}

/** Film section: load the right video only when near, pause off-screen. */
export function initFilm() {
  const v = document.querySelector<HTMLVideoElement>('.film__video');
  if (!v) return;
  const mobile = matchMedia('(max-width: 700px)').matches;
  v.poster = mobile ? '/media/hero-mobile-poster.jpg' : '/media/room-1600.webp';
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (reduced || saveData) return; // poster only
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      if (!v.src) v.src = mobile ? v.dataset.srcMobile! : v.dataset.srcDesktop!;
      v.play().catch(() => {});
    } else v.pause();
  }, { rootMargin: '200px' }).observe(v);
  if (!reduced) gsap.fromTo(v, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.film', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

export { gsap, ScrollTrigger };
