import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { initialCaseForm } from './NewCase.data';

const NewCase = ({
  legalCase,
  onAddCase,
  onEditCase,
  onFormClosed,
  backPath = '/dashboard',
}) => {
  const [form, setForm] = useState(legalCase ?? initialCaseForm);
  const [error, setError] = useState('');

  const isEditing = legalCase !== undefined;
  const navigate = useNavigate();

  useEffect(() => {
    setForm(legalCase ?? initialCaseForm);
    setError('');
  }, [legalCase]);

  const handleChangeFormAttribute = (event, attr) => {
    setForm((prevForm) => ({
      ...prevForm,
      [attr]: event.target.value,
    }));
    setError('');
  };

  const handleGoBack = () => {
    if (isEditing) {
      onFormClosed?.();
      return;
    }

    navigate(backPath, { replace: true });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requiredFields = [
      form.caseNumber,
      form.title,
      form.area,
      form.startDate,
      form.lastUpdate,
      form.description,
      form.clientId,
    ];

    if (requiredFields.some((field) => field?.toString().trim() === '')) {
      setError('Completa los campos obligatorios del expediente.');
      return;
    }

    const payload = {
      ...form,
      caseNumber: form.caseNumber.trim(),
      title: form.title.trim(),
      area: form.area.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),
      clientId: Number(form.clientId),
      lawyerId: form.lawyerId ? Number(form.lawyerId) : '',
    };

    if (isEditing) {
      onEditCase?.(payload);
      return;
    }

    onAddCase?.(payload);
    setForm(initialCaseForm);
    setError('');
  };

  return (
    <Card className="m-4 w-100" bg="dark" text="light">
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="caseNumber">
                <Form.Label>Número de expediente</Form.Label>
                <Form.Control
                  value={form.caseNumber}
                  onChange={(event) => handleChangeFormAttribute(event, 'caseNumber')}
                  type="text"
                  placeholder="EXP-2026-001"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  value={form.title}
                  onChange={(event) => handleChangeFormAttribute(event, 'title')}
                  type="text"
                  placeholder="Reclamo laboral por despido"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="area">
                <Form.Label>Área</Form.Label>
                <Form.Control
                  value={form.area}
                  onChange={(event) => handleChangeFormAttribute(event, 'area')}
                  type="text"
                  placeholder="Laboral"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="status">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(event) => handleChangeFormAttribute(event, 'status')}
                >
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cerrado">Cerrado</option>
                  <option value="cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="startDate">
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control
                  value={form.startDate}
                  onChange={(event) => handleChangeFormAttribute(event, 'startDate')}
                  type="date"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="lastUpdate">
                <Form.Label>Última actualización</Form.Label>
                <Form.Control
                  value={form.lastUpdate}
                  onChange={(event) => handleChangeFormAttribute(event, 'lastUpdate')}
                  type="date"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="clientId">
                <Form.Label>ID del cliente</Form.Label>
                <Form.Control
                  value={form.clientId}
                  onChange={(event) => handleChangeFormAttribute(event, 'clientId')}
                  type="number"
                  placeholder="1"
                  min="1"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="lawyerId">
                <Form.Label>ID del abogado</Form.Label>
                <Form.Control
                  value={form.lawyerId}
                  onChange={(event) => handleChangeFormAttribute(event, 'lawyerId')}
                  type="number"
                  placeholder="2"
                  min="1"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={form.description}
                  onChange={(event) => handleChangeFormAttribute(event, 'description')}
                  placeholder="Detalle general del expediente"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="notes">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(event) => handleChangeFormAttribute(event, 'notes')}
                  placeholder="Observaciones internas"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" type="button" onClick={handleGoBack}>
              {isEditing ? 'Cancelar' : 'Volver'}
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Editar' : 'Agregar'} expediente
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NewCase;
