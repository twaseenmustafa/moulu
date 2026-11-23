export interface ReserveInput {
  name: string;
  email: string;
  country: string;
  consent: boolean;
}

export type Errors = Partial<Record<keyof ReserveInput, string>>;

// Pragmatic email check: one @, a dot in the domain, no spaces.
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function validate(v: ReserveInput): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  if (!name) e.name = 'Tell us what to call you.';
  else if (name.length > 60) e.name = 'Keep it under 60 characters.';
  const email = v.email.trim();
  if (!email) e.email = 'We need an email to hold your seat.';
  else if (!EMAIL.test(email)) e.email = 'That email looks incomplete — check the part after the @.';
  if (!v.country) e.country = 'Choose where it should be delivered.';
  if (!v.consent) e.consent = 'Tick the box so we may email you about this reservation.';
  return e;
}
