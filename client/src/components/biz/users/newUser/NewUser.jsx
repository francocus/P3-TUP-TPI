import { useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { initialUserForm } from './NewUser.data';

const NewUser = ({ onAddUser, onFormClosed }) => {
  const [form, setForm] = useState(initialUserForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangeFormAttribute = (event, attr) => {
    setForm((prevForm) => ({
      ...prevForm,
      [attr]: attr === 'active' ? event.target.checked : event.target.value,
    }));
  };

  const handleGoBack = () => {
    setMessage('');
    setForm(initialUserForm);
    onFormClosed?.();
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.name.trim() || !form.dni.trim() || !form.email.trim() || !form.password.trim()) {
      setMessage('Completá nombre, DNI, correo electrónico y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await onAddUser?.(form);
      setForm(initialUserForm);
      onFormClosed?.();
    } catch (error) {
      setMessage(error.message || 'No se pudo crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show
      centered
      backdrop="static"
      onHide={handleGoBack}
      dialogClassName="users-modal__dialog"
      contentClassName="users-modal__content"
      backdropClassName="users-modal__backdrop"
    >
      <Modal.Header className="users-modal__header" closeButton closeVariant="white">
        <div>
          <p className="users-modal__eyebrow">Administración de usuarios</p>
          <Modal.Title>Nuevo usuario</Modal.Title>
        </div>
      </Modal.Header>

      <Form className="users-form text-white" autoComplete="off" onSubmit={handleAddUser}>
        <Modal.Body className="users-modal__body">
          {message && (
            <Alert className="mb-3" variant="danger">
              {message}
            </Alert>
          )}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(event) => handleChangeFormAttribute(event, 'name')}
                  type="text"
                  placeholder="Ingresar nombre completo"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="dni">
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  value={form.dni}
                  onChange={(event) => handleChangeFormAttribute(event, 'dni')}
                  type="text"
                  placeholder="Ingresar DNI"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  value={form.email}
                  onChange={(event) => handleChangeFormAttribute(event, 'email')}
                  type="email"
                  placeholder="Ingresar correo"
                  autoComplete="off"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  value={form.password}
                  onChange={(event) => handleChangeFormAttribute(event, 'password')}
                  type="password"
                  placeholder="Ingresar contraseña"
                  autoComplete="off"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="role">
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
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Check
                checked={form.active}
                onChange={(event) => handleChangeFormAttribute(event, 'active')}
                type="switch"
                id="active"
                label="Usuario activo"
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="users-modal__footer">
          <Button variant="secondary" onClick={handleGoBack} type="button" disabled={loading} className="users-form__button users-form__button--secondary">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading} className="users-form__button users-form__button--primary">
            {loading ? 'Agregando...' : 'Agregar usuario'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NewUser;
