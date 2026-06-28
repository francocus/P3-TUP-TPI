import { useContext, useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { AuthenticationContext } from '../../services/auth/authentication.context.jsx';
import ToggleTheme from '../../shared/toggleTheme/ToggleTheme.jsx';
import { initialLoginFormErrors } from './Login.data.js';
import { Scale } from 'lucide-react';
import '../auth.css';

const MailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6.5h18v11H3z" /><path d="m3 7 9 6 9-6" /></svg>;
const LockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="10.5" width="16" height="10" rx="2" /><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" /></svg>;
const EyeIcon = ({ off }) => off
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c5 0 8.7 3.4 10 7-.5 1.4-1.3 2.7-2.4 3.8M6.3 6.3C4 7.7 2.4 9.6 1 12c1.3 3.6 5 7 11 7 1.4 0 2.7-.2 3.9-.6" /></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12c1.3-3.6 5-7 11-7s9.7 3.4 11 7c-1.3 3.6-5 7-11 7S2.3 15.6 1 12Z" /><circle cx="12" cy="12" r="3" /></svg>;

const Login = () => {
  const { handleUserLogin } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(initialLoginFormErrors);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!email.trim()) {
      setErrors((e) => ({ ...e, email: true }));
      emailInputRef.current?.focus();
      return;
    }
    if (!password.trim()) {
      setErrors((e) => ({ ...e, password: true }));
      passwordInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      setErrors(initialLoginFormErrors);
      const response = await handleUserLogin({ email: email.trim(), password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-theme-toggle">
        <ToggleTheme />
      </div>
      <div className="auth-grid">
        <aside className="auth-aside">
          <div className="auth-brand">
            <span className="dashboard-brand__mark">
              <Scale size={20} />
            </span>
            <strong>LEGAL MANAGER</strong>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-box">
            <div className="auth-box__head">
              <span className="auth-eyebrow">Bienvenido</span>
              <h1>Iniciar sesión</h1>
              <p>Ingresá tus credenciales para continuar.</p>
            </div>

            {message && <Alert className="auth-alert" variant="danger">{message}</Alert>}

            <Form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="login-email">Correo electrónico</label>
                <div className="auth-input">
                  <MailIcon />
                  <Form.Control
                    id="login-email"
                    ref={emailInputRef}
                    type="email"
                    placeholder="nombre@estudio.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((c) => ({ ...c, email: false })); }}
                  />
                </div>
                {errors.email && <span className="auth-error">El correo es obligatorio.</span>}
              </div>

              <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                <label htmlFor="login-password">Contraseña</label>
                <div className="auth-input">
                  <LockIcon />
                  <Form.Control
                    id="login-password"
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((c) => ({ ...c, password: false })); }}
                  />
                  <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)} aria-label="Mostrar contraseña">
                    <EyeIcon off={showPassword} />
                  </button>
                </div>
                {errors.password && <span className="auth-error">La contraseña es obligatoria.</span>}
              </div>

              <Button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'Ingresando…' : 'Iniciar sesión'}
              </Button>
            </Form>

            <p className="auth-switch-text">
              ¿No tenés cuenta? <Link to="/register" className="auth-link">Crear cuenta</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;