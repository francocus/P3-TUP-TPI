import { getStatusClass } from "./utils";

const AppointmentDetails = ({ appointment, onClose }) => {
  if (!appointment) {
    return (
      <aside className="appointment-details appointment-details--empty">
        <span className="appointment-details__eyebrow">Detalle del turno</span>
        <p>Selecciona una cita para ver cliente, expediente, ubicacion y notas.</p>
      </aside>
    );
  }

  return (
    <aside className="appointment-details">
      <div className="appointment-details__header">
        <div>
          <span className="appointment-details__eyebrow">Detalle del turno</span>
          <h3>{appointment.clientName}</h3>
        </div>
        <button type="button" className="appointment-details__close" onClick={onClose} aria-label="Cerrar detalle">
          x
        </button>
      </div>
      <span className={`appointment-details__status ${getStatusClass(appointment.status)}`}>
        {appointment.status}
      </span>
      <dl className="appointment-details__grid">
        <div><dt>Fecha</dt><dd>{appointment.date}</dd></div>
        <div><dt>Horario</dt><dd>{appointment.time} - {appointment.endTime}</dd></div>
        <div><dt>Expediente</dt><dd>{appointment.caseNumber}</dd></div>
        <div><dt>Materia</dt><dd>{appointment.area}</dd></div>
        <div><dt>Ubicacion</dt><dd>{appointment.location}</dd></div>
        <div><dt>Motivo</dt><dd>{appointment.reason}</dd></div>
      </dl>
      <p className="appointment-details__notes">{appointment.notes}</p>
    </aside>
  );
};

export default AppointmentDetails;