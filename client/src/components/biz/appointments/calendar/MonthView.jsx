import { addDays, getDateKey, getMonday, isSameDate } from "../calendar/Calendar.data";
import { DAY_NAMES } from "../../../services/consts/calendarConsts";
import { getAppointmentAccent } from "./AppointmentChip";

const MonthView = ({ selectedDate, today, appointmentsByDate, onDateChange, onSelectAppointment }) => {

  const monthGridStart = getMonday(selectedDate);

  const monthDays = Array.from({ length: 28 }, (_, index) => addDays(monthGridStart, index));

  return (
    <div className="appointments-month-view">
      <div className="appointments-month-view__header">{DAY_NAMES.map((dayName) => <span key={dayName}>{dayName}</span>)}</div>
      <div className="appointments-month-view__grid">
        {monthDays.map((date) => {
          const dateKey = getDateKey(date);
          const dayAppointments = appointmentsByDate[dateKey] ?? [];

          const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

          return (
            <button
              key={dateKey}
              type="button"
              className={`appointments-month-cell ${isSameDate(date, selectedDate) ? "is-selected" : ""
                } ${isSameDate(date, today) ? "is-today" : ""
                } ${!isCurrentMonth ? "is-outside-month" : ""
                }`}
              onClick={() => onDateChange(date)}
            >
              <span className="appointments-month-cell__date">{date.getDate()}</span>
              <span className={`appointments-month-cell__events ${dayAppointments.length >= 3 ? "has-scroll" : ""}`}>
                {dayAppointments.map((appointment) => (
                  <span
                    key={appointment.id}
                    className={`appointments-month-event ${getAppointmentAccent(appointment)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectAppointment(appointment);
                    }}
                  >
                    {appointment.time} {appointment.clientName}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;