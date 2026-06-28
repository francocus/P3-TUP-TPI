import { validateEmail } from './validators.js';

const assert = (condition, msg) => {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`PASS: ${msg}`);
};

assert(validateEmail('test@gmail.com') === true, 'email válido');
assert(validateEmail('noesvalido') === false, 'email inválido');
assert(validateEmail('') === false, 'email vacío');

console.log('Todos los tests pasaron.');