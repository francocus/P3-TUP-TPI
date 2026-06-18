import { useContext, useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthenticationContext } from '../../services/auth/authentication.context';
import ToggleTheme from "../../shared/toggleTheme/ToggleTheme.jsx";
import { initialLoginFormErrors } from './Login.data';
import '../auth.css';

const dashboardByRole = {
  sysadmin: '/dashboard/sysadmin',
  abogado: '/dashboard/abogado',
  cliente: '/dashboard/cliente',
};

const Login = () => {
  const { handleUserLogin } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(initialLoginFormErrors);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!email.trim()) {
      setErrors((currentErrors) => ({ ...currentErrors, email: true }));
      emailInputRef.current?.focus();
      return;
    }

    if (!password.trim()) {
      setErrors((currentErrors) => ({ ...currentErrors, password: true }));
      passwordInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      setErrors(initialLoginFormErrors);

      const response = await handleUserLogin({
        email: email.trim(),
        password,
      });

      navigate(dashboardByRole[response?.user?.role] ?? '/dashboard', { replace: true });
    } catch (error) {
      setMessage(error.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell auth-shell--single">
        <ToggleTheme />
      <section className="auth-card auth-card--single">
        <div className="auth-panel auth-panel--forms auth-panel--single">
          <div className="auth-form-slide is-active auth-form-slide--full">
            <div className="auth-brand">
              <span className="auth-brand__mark">LM</span>
              <div>
                <strong>LEGAL MANAGER</strong>
              </div>
            </div>

            <div className="auth-copy">
              <p className="auth-eyebrow">Iniciar sesión</p>
              <h1>Acceso al sistema</h1>
            </div>

            {message && <Alert className="auth-alert" variant="danger">{message}</Alert>}
            <Form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label htmlFor="login-email">Correo electrónico</label>
                <Form.Control
                  id="login-email"
                  ref={emailInputRef}
                  className="auth-control"
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((currentErrors) => ({ ...currentErrors, email: false }));
                  }}
                  isInvalid={errors.email}
                />
                {errors.email && <Form.Text className="text-danger">El correo es obligatorio.</Form.Text>}
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Contraseña</label>
                <Form.Control
                  id="login-password"
                  ref={passwordInputRef}
                  className="auth-control"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((currentErrors) => ({ ...currentErrors, password: false }));
                  }}
                  isInvalid={errors.password}
                />
                {errors.password && <Form.Text className="text-danger">La contraseña es obligatoria.</Form.Text>}
              </div>

              <Button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </Form>

            <div className="auth-footer">
              <Button as={Link} to="/register" className="auth-switch">
                Crear cuenta
              </Button>
              
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
