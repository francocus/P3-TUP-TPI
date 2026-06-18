import { pad } from "../calendar/Calendar.data";
import { DAY_NAMES } from "../../../services/consts/calendarConsts";
import AppointmentChip from "./AppointmentChip";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

const AppointmentsCalendar = ({ viewMode, cursorDate, selectedDate, today, selectedAppointment, appointmentsByDate, onDateChange, onSelectAppointment }) => {
  const selectedDayAppointments = appointmentsByDate[`${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`] ?? [];

  if (viewMode === "month") {
    return <MonthView cursorDate={cursorDate} selectedDate={selectedDate} today={today} appointmentsByDate={appointmentsByDate} onDateChange={onDateChange} onSelectAppointment={onSelectAppointment} />;
  }

  if (viewMode === "day") {
    return (
      <div className="appointments-day-view">
        <div className="appointments-day-view__header">
          <span>{DAY_NAMES[selectedDate.getDay()]}</span>
          <strong>{pad(selectedDate.getDate())}</strong>
        </div>
        <div className="appointments-day-view__list">
          {selectedDayAppointments.length ? selectedDayAppointments.map((appointment) => <AppointmentChip key={appointment.id} appointment={appointment} selected={selectedAppointment?.id === appointment.id} onSelect={onSelectAppointment} />) : <p className="appointments-calendar__empty">Sin turnos</p>}
        </div>
      </div>
    );
  }

  return <WeekView cursorDate={cursorDate} selectedDate={selectedDate} selectedAppointment={selectedAppointment} appointmentsByDate={appointmentsByDate} onDateChange={onDateChange} onSelectAppointment={onSelectAppointment} />;
};

export default AppointmentsCalendar;
