import { addDays, DAY_NAMES, getDateKey, getSunday, isSameDate, MONTH_NAMES } from "../calendar/Calendar.data";
import { getAppointmentAccent } from "./AppointmentChip";

const MonthView = ({ cursorDate, selectedDate, today, appointmentsByDate, onDateChange, onSelectAppointment }) => {
  const monthStart = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1);
  const monthGridStart = getSunday(monthStart);
  const monthDays = Array.from({ length: 35 }, (_, index) => addDays(monthGridStart, index));

  return (
    <div className="appointments-month-view">
      <div className="appointments-month-view__header">{DAY_NAMES.map((dayName) => <span key={dayName}>{dayName}</span>)}</div>
      <div className="appointments-month-view__grid">
        {monthDays.map((date) => {
          const dateKey = getDateKey(date);
          const dayAppointments = appointmentsByDate[dateKey] ?? [];
          return (
            <button key={dateKey} type="button" className={`appointments-month-cell ${isSameDate(date, selectedDate) ? "is-selected" : ""} ${isSameDate(date, today) ? "is-today" : ""} ${date.getMonth() !== cursorDate.getMonth() ? "is-outside-month" : ""}`} onClick={() => onDateChange(date)}>
              <span className="appointments-month-cell__date">{date.getDate() === 1 ? `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}` : date.getDate()}</span>
              <span className="appointments-month-cell__events">
                {dayAppointments.slice(0, 3).map((appointment) => <span key={appointment.id} className={`appointments-month-event ${getAppointmentAccent(appointment)}`} onClick={(event) => { event.stopPropagation(); onSelectAppointment(appointment); }}>{appointment.time} {appointment.clientName}</span>)}
                {dayAppointments.length > 3 && <span className="appointments-month-event is-more">+{dayAppointments.length - 3} mas</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
