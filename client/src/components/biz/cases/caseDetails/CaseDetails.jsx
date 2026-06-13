import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { initialCaseForm } from '../newCase/NewCase.data';

const statusOptions = [
  { value: 'activo', label: 'Activo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'cerrado', label: 'Cerrado' },
  { value: 'archivado', label: 'Archivado' },
];

const CaseDetails = ({ legalCase, onEditCase, onFormClosed, clients = [], lawyers = [], currentUser }) => {
  const [form, setForm] = useState(legalCase ?? initialCaseForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(legalCase ?? initialCaseForm);
    setMessage('');
  }, [legalCase]);

  useEffect(() => {
    if (currentUser?.role === 'abogado') {
      setForm((previousForm) => ({
        ...previousForm,
        lawyerId: String(currentUser.id),
      }));
    }
  }, [currentUser]);

  const handleChangeFormAttribute = (event, attr) => {
    setForm((previousForm) => ({
      ...previousForm,
      [attr]: event.target.value,
    }));
  };

  const handleGoBack = () => {
    setMessage('');
    setForm(legalCase ?? initialCaseForm);
    onFormClosed?.();
  };

  const handleEditCase = async (event) => {
    event.preventDefault();
    setMessage('');

    const requiredFields = ['caseNumber', 'title', 'area', 'startDate', 'lastUpdate', 'description', 'clientId'];
    if (currentUser?.role !== 'abogado') {
      requiredFields.push('lawyerId');
    }

    const hasEmptyField = requiredFields.some((field) => !String(form[field] ?? '').trim());
    if (hasEmptyField) {
      setMessage('Completa los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        clientId: Number(form.clientId),
        lawyerId: currentUser?.role === 'abogado' ? Number(currentUser.id) : Number(form.lawyerId),
      };

      await onEditCase?.(payload);
      onFormClosed?.();
    } catch (error) {
      setMessage(error.message || 'No se pudo actualizar el expediente.');
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
      dialogClassName="cases-modal__dialog"
      contentClassName="cases-modal__content"
      backdropClassName="cases-modal__backdrop"
    >
      <Modal.Header className="cases-modal__header" closeButton closeVariant="white">
        <div>
          <p className="cases-modal__eyebrow">Administracion de expedientes</p>
          <Modal.Title>Editar expediente</Modal.Title>
          <p className="cases-modal__subtitle">Expediente seleccionado: {legalCase?.caseNumber}</p>
        </div>
      </Modal.Header>

      <Form className="cases-form text-white" onSubmit={handleEditCase}>
        <Modal.Body className="cases-modal__body">
          {message ? (
            <Alert className="mb-3" variant="danger">
              {message}
            </Alert>
          ) : null}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="caseNumber">
                <Form.Label>Numero de expediente</Form.Label>
                <Form.Control
                  value={form.caseNumber ?? ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'caseNumber')}
                  type="text"
                  placeholder="Ingresar numero de expediente"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Titulo</Form.Label>
                <Form.Control
                  value={form.title ?? ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'title')}
                  type="text"
                  placeholder="Ingresar titulo"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="area">
                <Form.Label>Area</Form.Label>
                <Form.Control
                  value={form.area ?? ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'area')}
                  type="text"
                  placeholder="Ingresar area"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="status">
                <Form.Label>Estado</Form.Label>
                <Form.Select value={form.status ?? 'activo'} onChange={(event) => handleChangeFormAttribute(event, 'status')}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="startDate">
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control
                  value={form.startDate ?? ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'startDate')}
                  type="date"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="lastUpdate">
                <Form.Label>Ultima actualizacion</Form.Label>
                <Form.Control
                  value={form.lastUpdate ?? ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'lastUpdate')}
                  type="date"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Descripcion</Form.Label>
                <Form.Control
                  value={form.description ?? ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'description')}
                  as="textarea"
                  rows={3}
                  placeholder="Ingresar descripcion"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="notes">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  value={form.notes ?? ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'notes')}
                  as="textarea"
                  rows={2}
                  placeholder="Ingresar notas opcionales"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="clientId">
                <Form.Label>Cliente</Form.Label>
                <Form.Select
                  value={form.clientId ? String(form.clientId) : ''}
                  onChange={(event) => handleChangeFormAttribute(event, 'clientId')}
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.dni}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="lawyerId">
                <Form.Label>Abogado</Form.Label>
                {currentUser?.role === 'abogado' ? (
                  <Form.Control value={currentUser?.name ?? ''} readOnly />
                ) : (
                  <Form.Select
                    value={form.lawyerId ? String(form.lawyerId) : ''}
                    onChange={(event) => handleChangeFormAttribute(event, 'lawyerId')}
                  >
                    <option value="">Seleccionar abogado</option>
                    {lawyers.map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.name} - {lawyer.dni}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="cases-modal__footer">
          <Button
            variant="secondary"
            onClick={handleGoBack}
            type="button"
            disabled={loading}
            className="cases-form__button cases-form__button--secondary"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="cases-form__button cases-form__button--primary"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CaseDetails;
