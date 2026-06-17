import AppointmentDetails from "../appointmentDetails/AppointmentDetails";
import { addMonths, DAY_NAMES, formatMonthTitle, getDateKey, getSunday, addDays, isSameDate, pad } from "../data/appointments.data";
import AppointmentChip from "./AppointmentChip";

const MiniCalendar = ({ cursorDate, selectedDate, today, appointmentsByDate, selectedAppointment, selectedDayAppointments, user, onDateChange, onSelectAppointment, onClearAppointment, onStatus, onEdit }) => {
  const monthStart = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1);
  const monthGridStart = getSunday(monthStart);
  const monthDays = Array.from({ length: 35 }, (_, index) => addDays(monthGridStart, index));

  return (
    <aside className="appointments-sidebar">
      <div className="mini-calendar">
        <div className="mini-calendar__header">
          <strong>{formatMonthTitle(cursorDate)}</strong>
          <div>
            <button type="button" onClick={() => onDateChange(addMonths(cursorDate, -1))}>{"<"}</button>
            <button type="button" onClick={() => onDateChange(addMonths(cursorDate, 1))}>{">"}</button>
          </div>
        </div>
        <div className="mini-calendar__grid">
          {DAY_NAMES.map((dayName) => <span key={dayName} className="mini-calendar__day-name">{dayName}</span>)}
          {monthDays.map((date) => {
            const dateKey = getDateKey(date);
            return (
              <button key={dateKey} type="button" className={`${isSameDate(date, selectedDate) ? "is-selected" : ""} ${isSameDate(date, today) ? "is-today" : ""} ${appointmentsByDate[dateKey]?.length ? "has-appointments" : ""} ${date.getMonth() !== cursorDate.getMonth() ? "is-muted" : ""}`} onClick={() => onDateChange(date)}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      <div className="appointments-day-list">
        <span className="appointments-day-list__label">Turnos del {pad(selectedDate.getDate())}</span>
        {selectedDayAppointments.length ? selectedDayAppointments.map((appointment) => <AppointmentChip key={appointment.id} appointment={appointment} compact selected={selectedAppointment?.id === appointment.id} onSelect={onSelectAppointment} />) : <p>No hay turnos cargados.</p>}
      </div>
      <AppointmentDetails appointment={selectedAppointment} user={user} onClose={onClearAppointment} onStatus={onStatus} onEdit={onEdit} />
    </aside>
  );
};

export default MiniCalendar;
