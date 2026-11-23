import { validate, type ReserveInput } from './validate';
import { PRODUCTS, FABRIC_NAMES, euro, type ProductId, type Fabric } from '../data';
import { gsap, reduced } from './motion';

const KEY = 'moulu-reservations';

export function initForm() {
  const form = document.querySelector<HTMLFormElement>('[data-form]');
  const success = document.querySelector<HTMLElement>('[data-success]');
  if (!form || !success) return;
  const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement;

  // Collection CTAs preselect the product.
  document.querySelectorAll<HTMLElement>('[data-product]').forEach((a) =>
    a.addEventListener('click', () => { (form.querySelector(`input[name="product"][value="${a.dataset.product}"]`) as HTMLInputElement).checked = true; }));

  const read = (): ReserveInput => ({ name: field('name').value, email: field('email').value, country: field('country').value, consent: field('consent').checked });

  const show = (errs: ReturnType<typeof validate>, only?: string) => {
    (['name', 'email', 'country', 'consent'] as const).forEach((k) => {
      if (only && only !== k) return;
      const el = form.querySelector(`#e-${k}`)!;
      el.textContent = errs[k] ?? '';
      field(k).setAttribute('aria-invalid', String(!!errs[k]));
    });
  };

  // Validate a field once the user leaves it, then live while they fix it.
  form.addEventListener('focusout', (e) => {
    const n = (e.target as HTMLInputElement).name;
    if (['name', 'email', 'country'].includes(n) && (e.target as HTMLInputElement).value) show(validate(read()), n);
  });
  form.addEventListener('input', (e) => {
    const n = (e.target as HTMLInputElement).name;
    if (field(n)?.getAttribute?.('aria-invalid') === 'true') show(validate(read()), n);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = read();
    const errs = validate(v);
    show(errs);
    const first = (['name', 'country', 'email', 'consent'] as const).find((k) => errs[k]);
    if (first) { field(first).focus(); return; }

    const product = (form.querySelector('input[name="product"]:checked') as HTMLInputElement).value as ProductId;
    const fabric = (form.querySelector('input[name="fabric"]:checked') as HTMLInputElement).value as Fabric;
    const id = 'ML-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    try {
      const all = JSON.parse(localStorage.getItem(KEY) || '[]');
      all.push({ id, product, fabric, name: v.name.trim(), email: v.email.trim(), country: v.country, at: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch { /* storage blocked: the success state still confirms in-page */ }

    success.querySelector('[data-s-name]')!.textContent = v.name.trim();
    success.querySelector('[data-s-id]')!.textContent = id;
    success.querySelector('[data-s-item]')!.textContent = `${PRODUCTS[product].name} in ${FABRIC_NAMES[fabric]}, ${euro(PRODUCTS[product].price)}`;
    form.hidden = true;
    success.hidden = false;
    success.focus();
    if (!reduced) gsap.from(success.children, { y: 24, opacity: 0, stagger: 0.07, duration: 0.8, ease: 'expo.out' });
  });

  success.querySelector('[data-reset]')!.addEventListener('click', () => {
    form.reset();
    show({});
    success.hidden = true;
    form.hidden = false;
    field('name').focus();
  });
}
