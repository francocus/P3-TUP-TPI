import { getAppointmentAccent, getStatusClass } from "./utils";

const AppointmentChip = ({ appointment, compact = false, selected, onSelect }) => {
  const accentClass = getAppointmentAccent(appointment);

  return (
    <button
      type="button"
      className={`appointment-chip ${accentClass} ${selected ? "is-selected" : ""} ${
        compact ? "is-compact" : ""
      }`}
      onClick={() => onSelect(appointment)}
      aria-label={`Ver detalle del turno de ${appointment.clientName}`}
    >
      <span className="appointment-chip__time">
        {appointment.time} - {appointment.endTime}
      </span>
      <span className={`appointment-chip__client ${accentClass}`}>{appointment.clientName}</span>
    </button>
  );
};

export default AppointmentChip;