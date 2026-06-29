import { getStatusClass } from "../Appointments.data";

const AppointmentDetails = ({ appointment, user, isExpanded, onToggle, onStatus, onCancel, onEdit }) => (
  <div className={`appointment-card ${isExpanded ? "is-expanded" : ""}`}>
    <button type="button" className="appointment-card__summary" onClick={onToggle} aria-expanded={isExpanded}>
      <span className="appointment-card__summary-top">
        <span className="appointment-card__summary-text">
          {user?.role === "cliente" ? appointment.lawyerName : appointment.clientName}
        </span>
        <svg className="appointment-card__chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="appointment-card__summary-bottom">
        <span className="appointment-card__summary-date">{appointment.date} • {appointment.time}</span>
        <span className={`appointment-details__status ${getStatusClass(appointment.status)}`}>{appointment.status}</span>
      </span>
    </button>

    {isExpanded && (
      <div className="appointment-card__content">
        <div className="appointment-card__body">
          <span className="appointment-card__field-label">Motivo</span>
          <p>{appointment.reason}</p>
        </div>
        {user?.role === "abogado" && appointment.status.toLowerCase() !== "finalizado" && (
          <div className="appointment-card__actions">
            <span className="appointment-card__actions-label">Acciones</span>
            <div className="appointment-card__actions-buttons">
              {appointment.status.toLowerCase() === "pendiente" && (
                <button type="button" className="appointment-admin-action appointment-admin-action--confirm" title="Confirmar turno" onClick={() => onStatus(appointment, "confirmado")}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
                </button>
              )}
              {appointment.status.toLowerCase() !== "cancelado" && (
                <button type="button" className="appointment-admin-action appointment-admin-action--delete" title="Cancelar turno" onClick={() => onCancel(appointment)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" /></svg>
                </button>
              )}
              <button type="button" className="appointment-admin-action appointment-admin-action--edit" title="Editar turno" onClick={() => onEdit(appointment)}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 17.25V20h2.75L18.81 7.94l-2.75-2.75L4 17.25Zm14.71-9.54a.996.996 0 0 0 0-1.41l-1.01-1.01a.996.996 0 1 0-1.41 1.41l1.01 1.01c.39.39 1.03.39 1.41 0Z" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export default AppointmentDetails;
