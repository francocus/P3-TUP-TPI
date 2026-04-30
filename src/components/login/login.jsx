import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const clearForm = () => {
    setName('');
    setDni('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const togglePanel = () => {
    setIsRegistering((current) => !current);
    setError('');
    clearForm();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const requiredFields = isRegistering
      ? [name, dni, email, password, confirmPassword]
      : [email, password];

    if (requiredFields.some((field) => field.trim() === '')) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    if (isRegistering) {
      localStorage.setItem('token', 'usuario-autenticado');
      navigate('/dashboard');
      return;
    }

    if (email !== 'admin@gmail.com' || password !== '123') {
      setError('Email o contrasena incorrectos.');
      return;
    }

    localStorage.setItem('token', 'usuario-autenticado');
    navigate('/dashboard');
  };

  const passwordsStarted = password !== '' || confirmPassword !== '';
  const passwordsMatch =
    password !== '' && confirmPassword !== '' && password === confirmPassword;
  const passwordMessage = !passwordsStarted
    ? 'Usa la misma contrasena dos veces para confirmar el registro.'
    : passwordsMatch
      ? 'Las contrasenas coinciden.'
      : 'Las contrasenas aun no coinciden.';

  return (
    <main className={`auth-shell ${isRegistering ? 'is-registering' : ''}`}>
      <div className="auth-card">
        <div className="auth-panel auth-panel--forms">
          <div className="auth-form-track">
            <section
              className={`auth-form-slide ${isRegistering ? 'is-idle' : 'is-active'}`}
              aria-hidden={isRegistering}
            >
              <div className="auth-brand">
                <span className="auth-brand__mark">LM</span>
                <div>
                  <p className="auth-eyebrow">Legal Manager</p>
                  <span className="auth-brand__caption">
                    Acceso seguro para estudios juridicos
                  </span>
                </div>
              </div>

              <div className="auth-copy">
                <h1>Iniciar sesion</h1>
                <p>
                  Acceso unificado para clientes, abogados y administracion del
                  estudio juridico.
                </p>
              </div>

              {error && !isRegistering && (
                <Alert variant="danger" className="auth-alert">
                  {error}
                </Alert>
              )}

              <Form className="auth-form" onSubmit={handleSubmit} noValidate>
                <Form.Group className="auth-field">
                  <Form.Label>Correo electronico</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="email"
                    placeholder="admin@gmail.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="auth-field">
                  <Form.Label>Contrasena</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="password"
                    placeholder="Ingresa tu contrasena"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Form.Group>

                <div className="auth-meta">
                  <span>Demo: admin@gmail.com</span>
                  <span>Rol demo: sysadmin</span>
                </div>

                <Button className="auth-submit" type="submit">
                  Entrar al panel
                </Button>

                <button type="button" className="auth-text-switch" onClick={togglePanel}>
                  No tienes cuenta? Registrate aqui
                </button>
              </Form>
            </section>

            <section
              className={`auth-form-slide ${isRegistering ? 'is-active' : 'is-idle'}`}
              aria-hidden={!isRegistering}
            >
              <div className="auth-brand">
                <span className="auth-brand__mark">LM</span>
                <div>
                  <p className="auth-eyebrow">Legal Manager</p>
                  <span className="auth-brand__caption">Alta interna de usuarios</span>
                </div>
              </div>

              <div className="auth-copy">
                <h1>Crear cuenta</h1>
                <p>
                  Alta de usuarios para el estudio con identificacion personal y
                  confirmacion segura de contrasena.
                </p>
              </div>

              {error && isRegistering && (
                <Alert variant="danger" className="auth-alert">
                  {error}
                </Alert>
              )}

              <Form className="auth-form auth-form--register" onSubmit={handleSubmit} noValidate>
                <Form.Group className="auth-field auth-field--wide">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="text"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="auth-field">
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 35111222"
                    value={dni}
                    onChange={(event) => setDni(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="auth-field auth-field--wide">
                  <Form.Label>Correo electronico</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="email"
                    placeholder="nombre@estudio.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="auth-field">
                  <Form.Label>Crea una contrasena</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="auth-field">
                  <Form.Label>Confirmar contrasena</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="password"
                    placeholder="Vuelve a escribirla"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </Form.Group>

                <div
                  className={`auth-password-status ${
                    passwordsStarted ? (passwordsMatch ? 'is-match' : 'is-mismatch') : ''
                  }`}
                >
                  {passwordMessage}
                </div>

                <Button className="auth-submit" type="submit">
                  Crear usuario
                </Button>

                <button type="button" className="auth-text-switch" onClick={togglePanel}>
                  Ya tienes cuenta? Inicia sesion
                </button>
              </Form>
            </section>
          </div>
        </div>

        <aside className="auth-panel auth-panel--showcase">
          <div className="auth-showcase-track">
            <section
              className={`auth-showcase-slide ${isRegistering ? 'is-idle' : 'is-active'}`}
              aria-hidden={isRegistering}
            >
              <div className="auth-showcase-copy">
                <p className="auth-eyebrow">Estudio juridico</p>
                <h2>Gestion integral de expedientes y turnos</h2>
                <p>
                  Una sola plataforma para seguimiento de causas, agenda de consultas
                  y administracion operativa del estudio.
                </p>
              </div>

              <div className="auth-showcase-stack">
                <div className="auth-showcase-card">
                  <span className="auth-showcase-card__label">Cliente</span>
                  <strong>Turnos y autogestion</strong>
                  <p>
                    Solicita consultas, revisa expedientes y consulta su historial
                    desde un solo acceso.
                  </p>
                </div>
                <div className="auth-showcase-card">
                  <span className="auth-showcase-card__label">Abogado</span>
                  <strong>Operacion diaria</strong>
                  <p>
                    Gestiona clientes, expedientes y turnos con trazabilidad sobre
                    cada intervencion.
                  </p>
                </div>
              </div>

              <Button className="auth-switch" variant="outline-light" onClick={togglePanel}>
                Registrar nuevo usuario
              </Button>
            </section>

            <section
              className={`auth-showcase-slide ${isRegistering ? 'is-active' : 'is-idle'}`}
              aria-hidden={!isRegistering}
            >
              <div className="auth-showcase-copy">
                <p className="auth-eyebrow">Alta de usuarios</p>
                <h2>Preparado para la operacion del estudio</h2>
                <p>
                  El alta permite crear perfiles reales para clientes o abogados con
                  informacion clara y acceso controlado desde administracion.
                </p>
              </div>

              <div className="auth-showcase-stack auth-showcase-stack--compact">
                <div className="auth-pill">Alta de clientes</div>
                <div className="auth-pill">Alta de abogados</div>
                <div className="auth-pill">DNI obligatorio</div>
              </div>

              <div className="auth-showcase-metric">
                <span>Panel administrativo</span>
                <strong>
                  Auditoria, usuarios, expedientes y agenda en una sola consola
                </strong>
              </div>

              <Button className="auth-switch" variant="outline-light" onClick={togglePanel}>
                Volver al acceso
              </Button>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
