import { FABRIC_LINES, type Fabric } from '../data';

const SIZES = '(min-width: 900px) 66vw, 106vw';
const set = (f: string, ext: string) => [640, 1000, 1800].map((w) => `/media/dune-${f}-${w}.${ext} ${w}w`).join(', ');

/** One fabric choice recolours the page, swaps the sofa and syncs the form. */
export function setMood(f: Fabric) {
  const root = document.documentElement;
  if (root.dataset.mood === f || (!root.dataset.mood && f === 'ember')) return syncInputs(f);
  if (f === 'ember') delete root.dataset.mood; else root.dataset.mood = f;

  document.querySelectorAll<HTMLElement>('.mood__layer').forEach((l) => l.classList.toggle('is-on', l.dataset.fabric === f));
  const line = document.querySelector('[data-mood-line]');
  if (line) line.textContent = FABRIC_LINES[f];

  const hero = document.querySelector('[data-fabric-img]');
  if (hero) {
    hero.querySelector('source')!.srcset = set(f, 'avif');
    const img = hero.querySelector('img')!;
    img.srcset = set(f, 'webp');
    img.sizes = SIZES;
    img.src = `/media/dune-${f}-1000.webp`;
    img.alt = img.alt.replace(/in \w+ \w+/, `in ${f[0].toUpperCase() + f.slice(1)} ${f === 'cocoa' ? 'velvet' : f === 'chalk' ? 'wool' : 'bouclé'}`);
  }
  syncInputs(f);
}

function syncInputs(f: Fabric) {
  document.querySelectorAll<HTMLInputElement>(`input[name="fabric-ui"][value="${f}"], input[name="fabric"][value="${f}"]`).forEach((i) => (i.checked = true));
}

export function initMood() {
  document.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'fabric-ui' || t.name === 'fabric') setMood(t.value as Fabric);
  });
}
