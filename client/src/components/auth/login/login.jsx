import { useContext, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthenticationContext } from '../../services/auth/authentication.context';
import './login.css';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('cliente');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleUserLogin, handleUserRegister } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const resetRegisterFields = () => {
    setName('');
    setDni('');
    setConfirmPassword('');
    setRole('cliente');
  };

  const togglePanel = () => {
    setIsRegistering((current) => !current);
    setError('');
    setSuccess('');
    resetRegisterFields();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const requiredFields = isRegistering
      ? [name, dni, email, password, confirmPassword, role]
      : [email, password];

    if (requiredFields.some((field) => field.trim() === '')) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isRegistering) {
        await handleUserRegister({
          name,
          dni,
          email,
          password,
          role,
        });

        setSuccess('Usuario creado correctamente. Ahora puedes iniciar sesion.');
        setIsRegistering(false);
        resetRegisterFields();
        return;
      }

      await handleUserLogin({
        email,
        password,
      });

      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Ocurrio un error al procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordsStarted = password !== '' || confirmPassword !== '';
  const passwordsMatch =
    password !== '' && confirmPassword !== '' && password === confirmPassword;
  const passwordMessage = !passwordsStarted
    ? 'Usa la misma contraseña dos veces para confirmar el registro.'
    : passwordsMatch
      ? 'Las contraseñas coinciden.'
      : 'Las contraseñas aun no coinciden.';

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
                    Acceso seguro para estudios jurídicos
                  </span>
                </div>
              </div>

              <div className="auth-copy">
                <h1>Iniciar sesión</h1>
                <p>
                  Acceso unificado para clientes, abogados y administración del
                  estudio jurídico.
                </p>
              </div>

              {success && !isRegistering && (
                <Alert variant="success" className="auth-alert auth-alert--success">
                  {success}
                </Alert>
              )}

              {error && !isRegistering && (
                <Alert variant="danger" className="auth-alert">
                  {error}
                </Alert>
              )}

              <Form className="auth-form" onSubmit={handleSubmit} noValidate>
                <Form.Group className="auth-field">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="email"
                    placeholder="abogado@legalmanager.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="auth-field">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    className="auth-control"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Form.Group>


                <Button className="auth-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Iniciar sesión'}
                </Button>

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
                  Alta de usuarios para el estudio con identificación personal y
                  confirmación segura de contraseña.
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

                <Form.Group className="auth-field">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    className="auth-control"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="abogado">Abogado</option>
                    <option value="sysadmin">Sysadmin</option>
                  </Form.Select>
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
                  <Form.Label>Crea una contraseña</Form.Label>
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
                  <Form.Label>Confirmar contraseña</Form.Label>
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

                <Button className="auth-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Crear usuario'}
                </Button>

                <button
                  type="button"
                  className="auth-text-switch"
                  onClick={togglePanel}
                  disabled={isSubmitting}
                >
                  Ya tienes cuenta? Inicia sesión
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
                Registrarse
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
