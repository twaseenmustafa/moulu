import { PRODUCTS, type ProductId } from '../data';
import { gsap, reduced } from './motion';

/** Front elevation drawn from the product's real dimensions (1 cm = 3 units). */
function drawing(id: ProductId): string {
  const [w, , h, seat] = PRODUCTS[id].dims;
  const arm = PRODUCTS[id].arm;
  const k = 3, W = w * k, H = h * k, S = seat * k, A = arm * k, plinth = 8 * k, pad = 90;
  const x0 = pad, y0 = pad, base = y0 + H;
  const armW = arm ? Math.min(26 * k, W * 0.18) : 0;
  const r = 14 * k;
  const parts = [
    `<rect class="d-line" x="${x0 + 12}" y="${base - plinth}" width="${W - 24}" height="${plinth}" rx="6"/>`,
    arm ? `<rect class="d-line" x="${x0}" y="${base - A}" width="${armW}" height="${A - plinth + 2}" rx="${r}"/>` : '',
    arm ? `<rect class="d-line" x="${x0 + W - armW}" y="${base - A}" width="${armW}" height="${A - plinth + 2}" rx="${r}"/>` : '',
    `<rect class="d-line" x="${x0 + armW}" y="${base - S}" width="${W - armW * 2}" height="${S - plinth}" rx="${r * 0.8}"/>`,
  ];
  if (id !== 'crumb') {
    const n = id === 'dune' ? 2 : 1, bw = (W - armW * 2) / n;
    for (let i = 0; i < n; i++) parts.push(`<rect class="d-line" x="${x0 + armW + i * bw + 4}" y="${y0}" width="${bw - 8}" height="${H - S + 10}" rx="${r}"/>`);
  }
  const dim = `<g class="d-dim"><path d="M${x0} ${base + 24}h${W}M${x0} ${base + 16}v16M${x0 + W} ${base + 16}v16"/><path d="M${x0 + W + 24} ${y0}v${H}M${x0 + W + 16} ${y0}h16M${x0 + W + 16} ${base}h16"/><path d="M${x0 - 24} ${base - S}v${S}M${x0 - 32} ${base - S}h16" stroke-dasharray="4 4"/></g>`;
  const txt = `<text x="${x0 + W / 2}" y="${base + 46}" text-anchor="middle">${w} CM</text><text x="${x0 + W + 34}" y="${y0 + H / 2}">${h}</text><text x="${x0 - 30}" y="${base - S - 10}" text-anchor="middle">SEAT ${seat}</text>`;
  return `<svg viewBox="0 0 ${W + pad * 2 + 30} ${H + pad + 70}" role="img" aria-label="Front elevation: ${w} cm wide, ${h} cm high, seat ${seat} cm">${parts.join('')}${dim}${txt}</svg>`;
}

export function initSpecs() {
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"][data-spec]')];
  const pill = document.querySelector<HTMLElement>('.tabs__pill')!;
  const table = document.querySelector<HTMLElement>('[data-spec-table]')!;
  const draw = document.querySelector<HTMLElement>('[data-drawing]')!;
  const panel = document.getElementById('specs-panel')!;

  const movePill = (t: HTMLButtonElement) => { pill.style.width = t.offsetWidth + 'px'; pill.style.transform = `translateX(${t.offsetLeft}px)`; };

  const select = (t: HTMLButtonElement, focus = false) => {
    const id = t.dataset.spec as ProductId;
    tabs.forEach((b) => { const on = b === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', t.id);
    table.innerHTML = PRODUCTS[id].specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    draw.innerHTML = drawing(id);
    movePill(t);
    if (focus) t.focus();
    if (!reduced) {
      gsap.from(table.children, { opacity: 0, y: 10, stagger: 0.02, duration: 0.5, ease: 'expo.out' });
      draw.querySelectorAll<SVGGeometryElement>('.d-line').forEach((p) => {
        const len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
      });
    }
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') select(tabs[0], true);
      else if (e.key === 'End') select(tabs[tabs.length - 1], true);
      else if (d) select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
  select(tabs[0]);
  addEventListener('resize', () => movePill(tabs.find((t) => t.getAttribute('aria-selected') === 'true')!));
  document.fonts?.ready.then(() => movePill(tabs[0]));
}
