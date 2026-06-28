import { useContext, useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthenticationContext } from '../../services/auth/authentication.context';
import ToggleTheme from '../../shared/toggleTheme/ToggleTheme.jsx';
import { initialRegisterFormErrors } from './Register.data';
import '../auth.css';

const UserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c1.4-3.8 4.3-5.8 7.5-5.8s6.1 2 7.5 5.8" /></svg>;
const IdIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5.5" width="18" height="13" rx="2.4" /><circle cx="8.6" cy="11.5" r="1.8" /><path d="M5.6 16c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4M13.5 10h5M13.5 13h5" /></svg>;
const MailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6.5h18v11H3z" /><path d="m3 7 9 6 9-6" /></svg>;
const LockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="10.5" width="16" height="10" rx="2" /><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" /></svg>;
const EyeIcon = ({ off }) => off
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c5 0 8.7 3.4 10 7-.5 1.4-1.3 2.7-2.4 3.8M6.3 6.3C4 7.7 2.4 9.6 1 12c1.3 3.6 5 7 11 7 1.4 0 2.7-.2 3.9-.6" /></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12c1.3-3.6 5-7 11-7s9.7 3.4 11 7c-1.3 3.6-5 7-11 7S2.3 15.6 1 12Z" /><circle cx="12" cy="12" r="3" /></svg>;

const Register = () => {
  const { handleUserRegister } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const nameInputRef = useRef(null);
  const dniInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState(initialRegisterFormErrors);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!name.trim()) { setErrors((c) => ({ ...c, name: true })); nameInputRef.current?.focus(); return; }
    if (!dni.trim()) { setErrors((c) => ({ ...c, dni: true })); dniInputRef.current?.focus(); return; }
    if (!email.trim()) { setErrors((c) => ({ ...c, email: true })); emailInputRef.current?.focus(); return; }
    if (!password) { setErrors((c) => ({ ...c, password: true })); passwordInputRef.current?.focus(); return; }

    if (password !== confirmPassword) {
      setErrors((c) => ({ ...c, confirmPassword: true }));
      confirmPasswordInputRef.current?.focus();
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await handleUserRegister({ name: name.trim(), dni: dni.trim(), email: email.trim(), password, role: 'cliente' });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error.message || 'No se pudo crear la cuenta.');
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
            <span className="auth-mark">⚖</span>
            <strong>LEGAL MANAGER</strong>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-box">
            <div className="auth-box__head">
              <span className="auth-eyebrow">Crear cuenta</span>
              <h1>Registro de usuario</h1>
              <p>Completá tus datos para empezar.</p>
            </div>

            {message && (
              <Alert className="auth-alert" variant="danger">
                {message}
              </Alert>
            )}

            <Form
              className="auth-form auth-form--register"
              onSubmit={handleRegister}
              noValidate
            >
              <div
                className={`auth-field auth-field--wide ${errors.name ? "has-error" : ""}`}
              >
                <label htmlFor="register-name">Nombre completo</label>
                <div className="auth-input">
                  <UserIcon />
                  <Form.Control
                    id="register-name"
                    ref={nameInputRef}
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((c) => ({ ...c, name: false }));
                    }}
                  />
                </div>
                {errors.name && (
                  <span className="auth-error">El nombre es obligatorio.</span>
                )}
              </div>

              <div className={`auth-field ${errors.dni ? "has-error" : ""}`}>
                <label htmlFor="register-dni">DNI</label>
                <div className="auth-input">
                  <IdIcon />
                  <Form.Control
                    id="register-dni"
                    ref={dniInputRef}
                    type="text"
                    placeholder="Ej: 30123123"
                    value={dni}
                    onChange={(e) => {
                      setDni(e.target.value);
                      setErrors((c) => ({ ...c, dni: false }));
                    }}
                  />
                </div>
                {errors.dni && (
                  <span className="auth-error">El DNI es obligatorio.</span>
                )}
              </div>

              <div className={`auth-field ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="register-email">Correo electrónico</label>
                <div className="auth-input">
                  <MailIcon />
                  <Form.Control
                    id="register-email"
                    ref={emailInputRef}
                    type="email"
                    placeholder="correo@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((c) => ({ ...c, email: false }));
                    }}
                  />
                </div>
                {errors.email && (
                  <span className="auth-error">El correo es obligatorio.</span>
                )}
              </div>

              <div
                className={`auth-field ${errors.password ? "has-error" : ""}`}
              >
                <label htmlFor="register-password">Crear contraseña</label>
                <div className="auth-input">
                  <LockIcon />
                  <Form.Control
                    id="register-password"
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((c) => ({ ...c, password: false }));
                    }}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label="Mostrar contraseña"
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                </div>
                {errors.password && (
                  <span className="auth-error">
                    La contraseña es obligatoria.
                  </span>
                )}
              </div>

              <div
                className={`auth-field ${errors.confirmPassword ? "has-error" : ""}`}
              >
                <label htmlFor="register-confirm-password">
                  Confirmar contraseña
                </label>
                <div className="auth-input">
                  <LockIcon />
                  <Form.Control
                    id="register-confirm-password"
                    ref={confirmPasswordInputRef}
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((c) => ({ ...c, confirmPassword: false }));
                    }}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label="Mostrar contraseña"
                  >
                    <EyeIcon off={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="auth-error">
                    Las contraseñas deben coincidir.
                  </span>
                )}
              </div>

              <Button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creando…" : "Crear usuario"}
              </Button>
            </Form>

            <p className="auth-switch-text">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="auth-link">
                Volver al acceso
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;