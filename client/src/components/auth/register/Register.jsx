import { useContext, useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthenticationContext } from '../../services/auth/authentication.context';
import { initialRegisterFormErrors } from './Register.data';
import ToggleTheme from "../../shared/toggleTheme/ToggleTheme.jsx";
import '../auth.css';

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
  const [errors, setErrors] = useState(initialRegisterFormErrors);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!name.trim()) {
      setErrors((currentErrors) => ({ ...currentErrors, name: true }));
      nameInputRef.current?.focus();
      return;
    }

    if (!dni.trim()) {
      setErrors((currentErrors) => ({ ...currentErrors, dni: true }));
      dniInputRef.current?.focus();
      return;
    }

    if (!email.trim()) {
      setErrors((currentErrors) => ({ ...currentErrors, email: true }));
      emailInputRef.current?.focus();
      return;
    }

    if (!password) {
      setErrors((currentErrors) => ({ ...currentErrors, password: true }));
      passwordInputRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setErrors((currentErrors) => ({ ...currentErrors, confirmPassword: true }));
      confirmPasswordInputRef.current?.focus();
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);

      await handleUserRegister({
        name: name.trim(),
        dni: dni.trim(),
        email: email.trim(),
        password,
        role: 'cliente',
      });

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error.message || 'No se pudo crear la cuenta.');
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
              <p className="auth-eyebrow">Crear cuenta</p>
              <h1>Registro de usuario</h1>
            </div>

            {message && <Alert className="auth-alert" variant="danger">{message}</Alert>}
            <Form className="auth-form auth-form--register" onSubmit={handleRegister}>
              <div className="auth-field auth-field--wide">
                <label htmlFor="register-name">Nombre completo</label>
                <Form.Control
                  id="register-name"
                  ref={nameInputRef}
                  className="auth-control"
                  type="text"
                  placeholder="Administrador General"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setErrors((currentErrors) => ({ ...currentErrors, name: false }));
                  }}
                  isInvalid={errors.name}
                />
                {errors.name && <Form.Text className="text-danger">El nombre es obligatorio.</Form.Text>}
              </div>

              <div className="auth-field">
                <label htmlFor="register-dni">DNI</label>
                <Form.Control
                  id="register-dni"
                  ref={dniInputRef}
                  className="auth-control"
                  type="text"
                  placeholder="30000000"
                  value={dni}
                  onChange={(event) => {
                    setDni(event.target.value);
                    setErrors((currentErrors) => ({ ...currentErrors, dni: false }));
                  }}
                  isInvalid={errors.dni}
                />
                {errors.dni && <Form.Text className="text-danger">El DNI es obligatorio.</Form.Text>}
              </div>

              <div className="auth-field">
                <label htmlFor="register-email">Correo electrónico</label>
                <Form.Control
                  id="register-email"
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
                <label htmlFor="register-password">Crear contraseña</label>
                <Form.Control
                  id="register-password"
                  ref={passwordInputRef}
                  className="auth-control"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((currentErrors) => ({ ...currentErrors, password: false }));
                  }}
                  isInvalid={errors.password}
                />
                {errors.password && <Form.Text className="text-danger">La contraseña es obligatoria.</Form.Text>}
              </div>

              <div className="auth-field">
                <label htmlFor="register-confirm-password">Confirmar contraseña</label>
                <Form.Control
                  id="register-confirm-password"
                  ref={confirmPasswordInputRef}
                  className="auth-control"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrors((currentErrors) => ({ ...currentErrors, confirmPassword: false }));
                  }}
                  isInvalid={errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <Form.Text className="text-danger">Las contraseñas deben coincidir.</Form.Text>
                )}
              </div>

              <div className="auth-actions">
                <Button className="auth-submit" type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear usuario'}
                </Button>

                <div className="auth-footer">
                  <Button as={Link} to="/login" className="auth-switch">
                    Volver al acceso
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;
