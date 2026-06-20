import assert from 'node:assert/strict';
import { validateEmail } from './validators.js';

assert.equal(validateEmail('estudio@cuscianna.com'), true);
assert.equal(validateEmail('abogado.asociado@gmail.com'), true);
assert.equal(validateEmail('correoInvalido.com'), false);
assert.equal(validateEmail('usuario@estudio'), false);
assert.equal(validateEmail('@estudio.com'), false);

console.log('Validators OK');