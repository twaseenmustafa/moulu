import '@fontsource-variable/bricolage-grotesque/wght.css';
import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './styles.css';
import './sub.css';
import { initScroll, initReveals, initMagnetic, initNav, initTransitions } from './modules/motion';

initScroll();
initNav();
initMagnetic();
initTransitions();
initReveals();

// Privacy: show and clear the reservations this browser holds (the only data the site keeps).
const box = document.querySelector<HTMLElement>('[data-clear]');
if (box) {
  const KEY = 'moulu-reservations'; // same key as src/modules/form.ts
  const n = box.querySelector<HTMLElement>('[data-res-count]')!;
  const label = box.querySelector<HTMLElement>('[data-res-label]')!;
  const btn = box.querySelector<HTMLButtonElement>('[data-res-clear]')!;
  const status = box.querySelector<HTMLElement>('[data-res-status]')!;
  const count = () => { try { return (JSON.parse(localStorage.getItem(KEY) || '[]') as unknown[]).length; } catch { return 0; } };
  const render = () => {
    const c = count();
    n.textContent = String(c);
    label.textContent = c === 1 ? 'reservation in this browser' : 'reservations in this browser';
    btn.disabled = c === 0;
    btn.querySelector('.btn__roll > span')!.textContent = c === 0 ? 'Nothing stored' : 'Delete them';
  };
  btn.addEventListener('click', () => {
    try { localStorage.removeItem(KEY); status.textContent = 'Done. This browser now holds nothing from us.'; }
    catch { status.textContent = 'Your browser blocks storage, so there is nothing to clear.'; }
    render();
  });
  render();
}
