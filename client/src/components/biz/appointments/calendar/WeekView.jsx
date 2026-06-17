import { addDays, getDateKey, getMonday, isSameDate, pad, WEEK_DAY_NAMES } from "../data/appointments.data";
import AppointmentChip from "./AppointmentChip";

const WeekView = ({ cursorDate, selectedDate, selectedAppointment, appointmentsByDate, onDateChange, onSelectAppointment }) => {
  const weekStart = getMonday(cursorDate);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div className="appointments-week-view">
      <div className="appointments-week-view__header">
        {weekDays.map((date, index) => (
          <button key={getDateKey(date)} type="button" className={isSameDate(date, selectedDate) ? "is-selected" : ""} onClick={() => onDateChange(date)}>
            <span>{WEEK_DAY_NAMES[index]}</span>
            <strong>{pad(date.getDate())}</strong>
          </button>
        ))}
      </div>
      <div className="appointments-week-view__grid">
        {weekDays.map((date) => {
          const dateAppointments = appointmentsByDate[getDateKey(date)] ?? [];
          return (
            <div key={getDateKey(date)} className="appointments-week-view__column">
              <div className="appointments-week-view__appointments">
                {dateAppointments.length ? dateAppointments.map((appointment) => <AppointmentChip key={appointment.id} appointment={appointment} selected={selectedAppointment?.id === appointment.id} onSelect={onSelectAppointment} />) : <p className="appointments-calendar__empty">Sin turnos</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
