import { gsap, ScrollTrigger, reduced } from './motion';

const FRAMES = 61;
const DEGREES = 180;

/** Scroll-scrubbed turntable drawn from extracted video frames on a canvas. */
export function initTurntable() {
  const canvas = document.querySelector<HTMLCanvasElement>('.turn__canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const notes = [...document.querySelectorAll<HTMLElement>('.turn__notes li')];
  const deg = document.querySelector<HTMLElement>('[data-deg]')!;
  const dial = document.querySelector<HTMLElement>('.dial');
  const set = innerWidth < 800 ? 's' : 'l';
  const imgs: HTMLImageElement[] = [];
  let current = -1;
  let wanted = 0;

  const draw = (i: number) => {
    wanted = i;
    const img = imgs[i];
    if (!img?.complete || !img.naturalWidth || i === current) return;
    if (canvas.width !== img.naturalWidth) { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; }
    ctx.drawImage(img, 0, 0);
    current = i;
  };

  const load = () => {
    if (imgs.length) return;
    for (let i = 0; i < FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = `/media/frames/${set}/${String(i + 1).padStart(3, '0')}.webp`;
      img.onload = () => { if (i === wanted || (i === 0 && current < 0)) draw(i); };
      imgs.push(img);
    }
  };

  const update = (p: number) => {
    draw(Math.round(p * (FRAMES - 1)));
    deg.textContent = String(Math.round(p * DEGREES));
    dial?.style.setProperty('--p', p.toFixed(3));
    notes.forEach((n) => { const at = +n.dataset.at!; n.classList.toggle('is-on', p >= at && p < at + 0.26); });
  };

  // Start fetching frames a screen before the section arrives.
  ScrollTrigger.create({ trigger: '.turn', start: 'top bottom+=100%', once: true, onEnter: load });

  if (reduced) {
    // No pin, no scrub: an explicit slider rotates the sofa instead.
    load();
    const wrap = canvas.parentElement!;
    const label = document.createElement('label');
    label.className = 'turn__slider mono';
    label.innerHTML = 'Rotate <input type="range" min="0" max="1" step="0.01" value="0" />';
    wrap.after(label);
    label.querySelector('input')!.addEventListener('input', (e) => update(+(e.target as HTMLInputElement).value));
    notes.forEach((n) => n.classList.add('is-on'));
    return;
  }

  gsap.timeline({ scrollTrigger: { trigger: '.turn', start: 'top top', end: innerWidth < 800 ? '+=120%' : '+=170%', pin: '.turn__stage', scrub: true, onUpdate: (st) => update(st.progress) } })
    .fromTo('.turn__canvas-wrap', { scale: 0.92 }, { scale: 1, ease: 'power2.out', duration: 0.3 })
    .to({}, { duration: 0.7 });
}
