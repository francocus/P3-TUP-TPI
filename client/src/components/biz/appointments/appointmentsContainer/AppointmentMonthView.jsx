import { DAY_NAMES, MONTH_NAMES, getDateKey, isSameDate, getAppointmentAccent } from "./utils";

const AppointmentMonthView = ({
  monthDays, cursorDate, selectedDate, today, appointmentsByDate, selectDate, selectAppointment
}) => {
  return (
    <div className="appointments-month-view">
      <div className="appointments-month-view__header">
        {DAY_NAMES.map((dayName) => (
          <span key={dayName}>{dayName}</span>
        ))}
      </div>
      <div className="appointments-month-view__grid">
        {monthDays.map((date) => {
          const dateKey = getDateKey(date);
          const dayAppointments = appointmentsByDate[dateKey] ?? [];
          const isCurrentMonth = date.getMonth() === cursorDate.getMonth();

          return (
            <button
              key={dateKey}
              type="button"
              className={`appointments-month-cell ${isSameDate(date, selectedDate) ? "is-selected" : ""} ${
                isSameDate(date, today) ? "is-today" : ""
              } ${!isCurrentMonth ? "is-outside-month" : ""}`}
              onClick={() => selectDate(date)}
            >
              <span className="appointments-month-cell__date">
                {date.getDate() === 1 ? `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}` : date.getDate()}
              </span>
              <span className="appointments-month-cell__events">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <span
                    key={appointment.id}
                    role="button"
                    tabIndex={0}
                    className={`appointments-month-event ${getAppointmentAccent(appointment)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectAppointment(appointment);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        selectAppointment(appointment);
                      }
                    }}
                  >
                    {appointment.time} {appointment.clientName}
                  </span>
                ))}
                {dayAppointments.length > 3 && (
                  <span className="appointments-month-event is-more">+{dayAppointments.length - 3} mas</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentMonthView;