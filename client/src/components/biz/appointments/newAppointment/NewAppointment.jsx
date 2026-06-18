import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { addDays,  formatMonthTitle, getDateKey, getSunday,  pad, parseDate} from "../calendar/Calendar.data";
import { DAY_NAMES, SLOTS, MONTH_NAMES } from "../../../services/consts/calendarConsts";

const emptyForm = { lawyerId: "", date: "", time: "", reason: "" };
const addHour = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${pad(hours + 1)}:${pad(minutes)}`;
};

const NewAppointment = ({ show, onHide, onSubmit, lawyers, clients, user, token, appointments = [], appointment }) => {
  const isEdit = Boolean(appointment);
  const [form, setForm] = useState(emptyForm);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setMessage("");
    setForm(isEdit ? {
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      lawyerId: String(appointment.lawyerId),
    } : emptyForm);
  }, [show, appointment, isEdit]);

  useEffect(() => {
    const loadSlots = async () => {
      setSlots([]);
      if (isEdit || !form.lawyerId || !form.date) return;
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"}/appointments/availability?lawyerId=${form.lawyerId}&date=${form.date}`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (response.ok) setSlots((await response.json()).slots ?? []);
    };
    loadSlots();
  }, [form.date, form.lawyerId, isEdit, token]);

  const selectedDate = form.date ? parseDate(form.date) : null;
  const monthStart = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date();
  const monthGridStart = getSunday(monthStart);
  const monthDays = Array.from({ length: 35 }, (_, index) => addDays(monthGridStart, index));
  const busyDates = appointments.filter(({ lawyerId, status }) => String(lawyerId) === form.lawyerId && status !== "cancelado").reduce((dates, { date }) => ({ ...dates, [date]: true }), {});

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!form.date || !form.time || !form.reason.trim() || (!isEdit && !form.lawyerId)) return setMessage(isEdit ? "Completa fecha, horario y motivo." : "Completa abogado, fecha, horario y motivo.");
    try {
      setLoading(true);
      await onSubmit(isEdit ? appointment : {
        ...form,
        lawyerId: Number(form.lawyerId),
        title: "Solicitud de turno",
        status: "pendiente",
        endTime: addHour(form.time),
      }, isEdit ? {
        ...form,
        lawyerId: user?.role === "sysadmin" ? Number(form.lawyerId) : undefined,
        endTime: addHour(form.time),
      } : undefined);
      onHide();
    } catch (error) {
      setMessage(error.message || `No se pudo ${isEdit ? "modificar" : "solicitar"} el turno.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && !isEdit && user?.role === "abogado") {
      setForm((prev) => ({ ...prev, lawyerId: user.id }));
    }
  }, [show, isEdit, user]);

  return (
    <Modal
  show={show}
  centered
  backdrop="static"
  onHide={onHide}
  dialogClassName={`cases-modal__dialog ${isEdit ? "" : "appointment-request-modal__dialog"}`}
  contentClassName="cases-modal__content"
  backdropClassName="cases-modal__backdrop"
>
  <Modal.Header
    className="cases-modal__header"
    closeButton
    closeVariant="white"
  >
    <div>
      <p className="cases-modal__eyebrow">Agenda</p>
      <Modal.Title>
        {isEdit
          ? "Modificar turno"
          : user?.role === "cliente"
            ? "Solicitar turno"
            : "Agendar turno"}
      </Modal.Title>
    </div>
  </Modal.Header>
  <Form className="cases-form text-white" onSubmit={submit}>
    <Modal.Body
      className={`cases-modal__body ${isEdit ? "" : "appointment-request-modal"}`}
    >
      {message && <Alert variant="danger">{message}</Alert>}
      
      {!isEdit && user?.role !== "cliente" && (
        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Select
            value={form.clientId || ""}
            onChange={(event) =>
              setForm({ ...form, clientId: event.target.value })
            }
          >
            <option value="">Seleccionar cliente</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      {user?.role !== "abogado" && (!isEdit || user?.role === "sysadmin") && (
        <Form.Group className="mb-3">
          <Form.Label>Abogado</Form.Label>
          <Form.Select
            value={form.lawyerId || ""}
            onChange={(event) =>
              setForm({ ...form, lawyerId: event.target.value, time: "" })
            }
          >
            {!isEdit && <option value="">Seleccionar abogado</option>}
            {lawyers?.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}
      
      {isEdit ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Horario</Form.Label>
            <Form.Select
              value={form.time}
              onChange={(event) =>
                setForm({ ...form, time: event.target.value })
              }
            >
              {SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
            </Form.Select>
          </Form.Group>
        </>
      ) : (
        <div className="appointment-request-modal__grid">
          <div>
            <div className="appointment-request-modal__month">
              {formatMonthTitle(monthStart)}
            </div>
            <div className="appointment-request-modal__calendar">
              {DAY_NAMES.map((dayName) => (
                <span key={dayName}>{dayName}</span>
              ))}
              {monthDays.map((date) => {
                const dateKey = getDateKey(date);
                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`${form.date === dateKey ? "is-selected" : ""} ${busyDates[dateKey] ? "has-appointments" : ""} ${date.getMonth() !== monthStart.getMonth() ? "is-muted" : ""}`}
                    onClick={() =>
                      setForm({ ...form, date: dateKey, time: "" })
                    }
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="appointment-request-modal__slots">
            <strong>Horarios</strong>
            {form.date ? (
              <span>
                {DAY_NAMES[parseDate(form.date).getDay()]}{" "}
                {pad(parseDate(form.date).getDate())} de{" "}
                {MONTH_NAMES[parseDate(form.date).getMonth()]}
              </span>
            ) : (
              <span>Selecciona una fecha</span>
            )}
            {slots.length ? (
              slots.map((slot) => (
                <label
                  key={slot}
                  className={form.time === slot ? "is-selected" : ""}
                >
                  <span>{slot}</span>
                  <input
                    type="radio"
                    name="slot"
                    checked={form.time === slot}
                    onChange={() => setForm({ ...form, time: slot })}
                  />
                </label>
              ))
            ) : (
              <p>No hay horarios disponibles.</p>
            )}
          </div>
        </div>
      )}
      <Form.Group className={isEdit ? "" : "mt-3"}>
        <Form.Label>{isEdit ? "Motivo" : "Motivo breve"}</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={form.reason}
          placeholder={
            isEdit ? undefined : "Motivo breve de la consulta..."
          }
          onChange={(event) =>
            setForm({ ...form, reason: event.target.value })
          }
        />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer className="cases-modal__footer">
      <Button
        type="button"
        variant="secondary"
        className="cases-form__button cases-form__button--secondary appointment-cancel-button"
        onClick={onHide}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        className="cases-form__button cases-form__button--primary appointment-submit-button"
        disabled={loading}
      >
        {loading
          ? isEdit
            ? "Guardando..."
            : user?.role === "cliente"
              ? "Solicitando..."
              : "Agendando..."
          : isEdit
            ? "Guardar cambios"
            : "Confirmar cita"}
      </Button>
    </Modal.Footer>
  </Form>
</Modal>
  );
};

export default NewAppointment;
