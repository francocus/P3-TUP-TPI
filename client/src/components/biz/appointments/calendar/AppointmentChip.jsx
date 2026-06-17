import { normalizeText } from "../data/appointments.data";

const getAppointmentAccent = (appointment) => {
  const normalizedStatus = normalizeText(appointment.status);
  if (normalizedStatus === "pendiente") return "is-warning";
  if (normalizedStatus === "cancelado") return "is-danger";
  if (normalizedStatus === "finalizado" || normalizedStatus === "completado") return "is-muted";
  return "is-primary";
};

const AppointmentChip = ({ appointment, compact = false, selected, onSelect }) => {
  const accentClass = getAppointmentAccent(appointment);
  return (
    <button type="button" className={`appointment-chip ${accentClass} ${selected ? "is-selected" : ""} ${compact ? "is-compact" : ""}`} onClick={() => onSelect(appointment)}>
      <span className="appointment-chip__time">{appointment.time} - {appointment.endTime}</span>
      <span className={`appointment-chip__client ${accentClass}`}>{appointment.clientName}</span>
    </button>
  );
};

export { getAppointmentAccent };
export default AppointmentChip;
