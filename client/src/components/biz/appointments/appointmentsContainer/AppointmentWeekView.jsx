import { WEEK_DAY_NAMES, pad, getDateKey, isSameDate } from "./utils";

const AppointmentWeekView = ({ weekDays, selectedDate, selectDate, renderDayAppointments }) => {
  return (
    <div className="appointments-week-view">
      <div className="appointments-week-view__header">
        {weekDays.map((date, index) => (
          <button
            key={getDateKey(date)}
            type="button"
            className={isSameDate(date, selectedDate) ? "is-selected" : ""}
            onClick={() => selectDate(date)}
          >
            <span>{WEEK_DAY_NAMES[index]}</span>
            <strong>{pad(date.getDate())}</strong>
          </button>
        ))}
      </div>
      <div className="appointments-week-view__grid">
        {weekDays.map((date) => (
          <div key={getDateKey(date)} className="appointments-week-view__column">
            <div className="appointments-week-view__appointments">
              {renderDayAppointments(date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentWeekView;