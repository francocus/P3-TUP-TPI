const { validateEmail } = require('./validators');

describe('Suite de Pruebas Unitarias - Control de Formato de Email', () => {
  
  test('Debería validar con TRUE las estructuras de correos correctas', () => {
    expect(validateEmail('estudio@cuscianna.com')).toBe(true);
    expect(validateEmail('abogado.asociado@gmail.com')).toBe(true);
  });

  test('Debería retornar FALSE ante patrones de entrada inválidos', () => {
    expect(validateEmail('correoInvalido.com')).toBe(false);
    expect(validateEmail('usuario@estudio')).toBe(false);
    expect(validateEmail('@estudio.com')).toBe(false);
  });
});