const normalizeText = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const getStatusClass = (status) => {
  const normalizedStatus = normalizeText(status).replace(/\s+/g, "-");
  if (normalizedStatus === "confirmado") return "is-confirmed";
  if (normalizedStatus === "pendiente") return "is-pending";
  if (normalizedStatus === "cancelado") return "is-cancelled";
  if (normalizedStatus === "finalizado" || normalizedStatus === "completado") return "is-finished";
  return "";
};

const AppointmentDetails = ({ appointment, user, onClose, onStatus, onEdit }) => {
  if (!appointment) {
    return (
      <aside className="appointment-details appointment-details--empty">
        <span className="appointment-details__eyebrow">Detalle del turno</span>
        <p>Selecciona una cita para ver cliente, abogado, horario y motivo.</p>
      </aside>
    );
  }

  const canManage = user?.role === "sysadmin" || user?.role === "abogado";
  const canCancel = canManage || user?.role === "cliente";

  return (
    <aside className="appointment-details">
      <div className="appointment-details__header">
        <div>
          <span className="appointment-details__eyebrow">Detalle del turno</span>
          <h3>{appointment.clientName}</h3>
        </div>
        <button type="button" className="appointment-details__close" onClick={onClose}>x</button>
      </div>
      <span className={`appointment-details__status ${getStatusClass(appointment.status)}`}>{appointment.status}</span>
      <dl className="appointment-details__grid">
        <div><dt>Fecha</dt><dd>{appointment.date}</dd></div>
        <div><dt>Horario</dt><dd>{appointment.time} - {appointment.endTime}</dd></div>
        <div><dt>Abogado</dt><dd>{appointment.lawyerName}</dd></div>
        <div><dt>Expediente</dt><dd>{appointment.caseNumber}</dd></div>
        <div><dt>Motivo</dt><dd>{appointment.reason}</dd></div>
      </dl>
      {appointment.notes && <p className="appointment-details__notes">{appointment.notes}</p>}
      <div className="appointment-details__actions">
        {canManage && <button type="button" onClick={() => onEdit(appointment)}>Modificar</button>}
        {user?.role !== "sysadmin" && canManage && appointment.status !== "confirmado" && <button type="button" onClick={() => onStatus(appointment, "confirmado")}>Confirmar</button>}
        {user?.role !== "sysadmin" && canCancel && appointment.status !== "cancelado" && <button type="button" onClick={() => onStatus(appointment, "cancelado")}>Cancelar</button>}
      </div>
    </aside>
  );
};

export { getStatusClass };
export default AppointmentDetails;
