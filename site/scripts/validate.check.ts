// Self-check for the reservation validator. Run: node scripts/validate.check.ts
import assert from 'node:assert/strict';
import { validate } from '../src/modules/validate.ts';

const ok = { name: 'Ada', email: 'ada@example.com', country: 'Germany', consent: true };
assert.deepEqual(validate(ok), {});
assert.ok(validate({ ...ok, name: '   ' }).name);
assert.ok(validate({ ...ok, name: 'x'.repeat(61) }).name);
for (const bad of ['', 'ada', 'ada@', 'ada@example', 'a da@example.com', 'ada@@example.com', 'ada@.com'])
  assert.ok(validate({ ...ok, email: bad }).email, `should reject "${bad}"`);
for (const good of ['a.b+c@sub.example.co.uk', ' ada@example.com '])
  assert.equal(validate({ ...ok, email: good }).email, undefined, `should accept "${good}"`);
assert.ok(validate({ ...ok, country: '' }).country);
assert.ok(validate({ ...ok, consent: false }).consent);
console.log('validate: all checks passed');
