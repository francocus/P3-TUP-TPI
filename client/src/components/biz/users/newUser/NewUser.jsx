import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { initialUserForm } from './NewUser.data';

const NewUser = ({ user, onAddUser, onFormClosed, onEditUser }) => {
  const [form, setForm] = useState(user ?? initialUserForm);

  const isEditing = user !== undefined && user !== null;

  useEffect(() => {
    setForm(user ?? initialUserForm);
  }, [user]);

  const handleChangeFormAttribute = (event, attr) => {
    setForm((prevForm) => ({
      ...prevForm,
      [attr]: event.target.value,
    }));
  };

  const handleChangeActive = (event) => {
    setForm((prevForm) => ({
      ...prevForm,
      active: event.target.checked,
    }));
  };

  const handleSubmitUser = (event) => {
    event.preventDefault();

    if (!form.name || !form.dni || !form.email || !form.role) {
      return;
    }

    if (!isEditing && !form.password) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      dni: form.dni.trim(),
      email: form.email.trim(),
      role: form.role,
      active: Boolean(form.active),
    };

    if (form.password) {
      payload.password = form.password.trim();
    }

    if (isEditing) {
      onEditUser?.(payload);
      return;
    }

    onAddUser?.(payload);
  };

  return (
    <Form className="users-form" onSubmit={handleSubmitUser}>
      <div className="users-form__grid">
        <Form.Group className="users-form__field" controlId="name">
          <Form.Label>Nombre completo</Form.Label>
          <Form.Control
            value={form.name}
            onChange={(event) => handleChangeFormAttribute(event, 'name')}
            type="text"
            placeholder="Administrador General"
          />
        </Form.Group>

        <Form.Group className="users-form__field" controlId="dni">
          <Form.Label>DNI</Form.Label>
          <Form.Control
            value={form.dni}
            onChange={(event) => handleChangeFormAttribute(event, 'dni')}
            type="text"
            placeholder="30000000"
          />
        </Form.Group>

        <Form.Group className="users-form__field users-form__field--wide" controlId="email">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            value={form.email}
            onChange={(event) => handleChangeFormAttribute(event, 'email')}
            type="email"
            placeholder="admin@gmail.com"
          />
        </Form.Group>

        <Form.Group className="users-form__field" controlId="role">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            value={form.role}
            onChange={(event) => handleChangeFormAttribute(event, 'role')}
          >
            <option value="cliente">Cliente</option>
            <option value="abogado">Abogado</option>
            <option value="sysadmin">Sys Admin</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="users-form__field" controlId="password">
          <Form.Label>{isEditing ? 'Nueva contraseña' : 'Contraseña'}</Form.Label>
          <Form.Control
            value={form.password}
            onChange={(event) => handleChangeFormAttribute(event, 'password')}
            type="password"
            placeholder={isEditing ? 'Dejar vacío si no cambia' : 'Ingresar contraseña'}
          />
        </Form.Group>
      </div>

      <div className="users-form__footer">
        <div className="users-form__switch-wrap">
          <input
            id="active"
            className="users-form__switch-input"
            type="checkbox"
            checked={Boolean(form.active)}
            onChange={handleChangeActive}
          />
          <label className="users-form__switch" htmlFor="active">
            <span className="users-form__switch-track" aria-hidden="true">
              <span className="users-form__switch-thumb" />
            </span>
            <span className="users-form__switch-text">Usuario activo</span>
          </label>
        </div>

        <div className="users-form__actions">
          <button
            className="users-form__button users-form__button--secondary"
            type="button"
            onClick={onFormClosed}
          >
            Cancelar
          </button>
          <button className="users-form__button users-form__button--primary" type="submit">
            {isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </Form>
  );
};

export default NewUser;
