import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { initialAppointmentForm } from './NewAppointment.data';

const NewAppointment = ({
  appointment,
  onAddAppointment,
  onEditAppointment,
  onFormClosed,
  backPath = '/dashboard',
}) => {
  const [form, setForm] = useState(appointment ?? initialAppointmentForm);
  const [error, setError] = useState('');

  const isEditing = appointment !== undefined;
  const navigate = useNavigate();

  useEffect(() => {
    setForm(appointment ?? initialAppointmentForm);
    setError('');
  }, [appointment]);

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
      form.title,
      form.date,
      form.time,
      form.reason,
      form.clientId,
      form.lawyerId,
    ];

    if (requiredFields.some((field) => field?.toString().trim() === '')) {
      setError('Completa los campos obligatorios del turno.');
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      reason: form.reason.trim(),
      area: form.area.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      endTime: form.endTime.trim(),
      clientId: Number(form.clientId),
      lawyerId: Number(form.lawyerId),
      caseId: form.caseId ? Number(form.caseId) : '',
    };

    if (isEditing) {
      onEditAppointment?.(payload);
      return;
    }

    onAddAppointment?.(payload);
    setForm(initialAppointmentForm);
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
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  value={form.title}
                  onChange={(event) => handleChangeFormAttribute(event, 'title')}
                  type="text"
                  placeholder="Consulta inicial"
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
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="finalizado">Finalizado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="date">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  value={form.date}
                  onChange={(event) => handleChangeFormAttribute(event, 'date')}
                  type="date"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3" controlId="time">
                <Form.Label>Hora</Form.Label>
                <Form.Control
                  value={form.time}
                  onChange={(event) => handleChangeFormAttribute(event, 'time')}
                  type="time"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3" controlId="endTime">
                <Form.Label>Hora de fin</Form.Label>
                <Form.Control
                  value={form.endTime}
                  onChange={(event) => handleChangeFormAttribute(event, 'endTime')}
                  type="time"
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
            <Col md={6}>
              <Form.Group className="mb-3" controlId="caseId">
                <Form.Label>ID del expediente</Form.Label>
                <Form.Control
                  value={form.caseId}
                  onChange={(event) => handleChangeFormAttribute(event, 'caseId')}
                  type="number"
                  placeholder="Opcional"
                  min="1"
                />
              </Form.Group>
            </Col>

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
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="reason">
                <Form.Label>Motivo</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={form.reason}
                  onChange={(event) => handleChangeFormAttribute(event, 'reason')}
                  placeholder="Razón del turno"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="location">
                <Form.Label>Ubicación</Form.Label>
                <Form.Control
                  value={form.location}
                  onChange={(event) => handleChangeFormAttribute(event, 'location')}
                  type="text"
                  placeholder="Estudio central"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="notes">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  value={form.notes}
                  onChange={(event) => handleChangeFormAttribute(event, 'notes')}
                  type="text"
                  placeholder="Observaciones"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" type="button" onClick={handleGoBack}>
              {isEditing ? 'Cancelar' : 'Volver'}
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Editar' : 'Agregar'} turno
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NewAppointment;
