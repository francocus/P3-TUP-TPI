import { DAY_NAMES, pad } from "./utils";

const AppointmentDayView = ({ selectedDate, renderDayAppointments }) => {
  return (
    <div className="appointments-day-view">
      <div className="appointments-day-view__header">
        <span>{DAY_NAMES[selectedDate.getDay()]}</span>
        <strong>{pad(selectedDate.getDate())}</strong>
      </div>
      <div className="appointments-day-view__list">
        {renderDayAppointments(selectedDate)}
      </div>
    </div>
  );
};

export default AppointmentDayView;