import { useState } from "react";
import { APPOINTMENTS } from "../data/appointments";
import AppointmentsSearch from "../appointmentsSearch/AppointmentsSearch";
import AppointmentDayView from "./AppointmentDayView";
import AppointmentWeekView from "./AppointmentWeekView";
import AppointmentMonthView from "./AppointmentMonthView";
import AppointmentChip from "./AppointmentChip"; 
import AppointmentDetails from "./AppointmentDetails";
import "../appointments.css";

import { 
  DAY_NAMES, MONTH_NAMES, pad, getDateKey, addDays, addMonths, 
  getMonday, getSunday, formatMonthTitle, normalizeText, 
  getAppointmentDate, getAppointmentMinutes, isSameDate 
} from "./utils";
import "../appointments.css";

const AppointmentsContainer = () => {
  // Inicialización perezosa: solo calcula el 'new Date()' en el primer montaje
  const [today] = useState(() => new Date());
  
  const [viewMode, setViewMode] = useState("week");
  const [cursorDate, setCursorDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchAppointment, setSearchAppointment] = useState("");

  // ESTADO DERIVADO 1: Transformar y ordenar
  const appointments = APPOINTMENTS.map((appointment) => ({
    ...appointment,
    dateObject: getAppointmentDate(appointment),
  })).sort((a, b) => {
    const dateDiff = a.dateObject - b.dateObject;
    return dateDiff || getAppointmentMinutes(a) - getAppointmentMinutes(b);
  });

  // ESTADO DERIVADO 2: Filtrar
  const searchValue = normalizeText(searchAppointment.trim());
  const filteredAppointments = searchValue 
    ? appointments.filter((appointment) => {
        const searchable = [
          appointment.clientName, appointment.lawyerName, appointment.reason,
          appointment.status, appointment.caseNumber, appointment.area,
        ].join(" ");
        return normalizeText(searchable).includes(searchValue);
      })
    : appointments;

  // ESTADO DERIVADO 3: Agrupar por fecha
  const appointmentsByDate = filteredAppointments.reduce((grouped, appointment) => {
    grouped[appointment.date] = grouped[appointment.date] ?? [];
    grouped[appointment.date].push(appointment);
    return grouped;
  }, {});

  // ESTADO DERIVADO 4: Cálculos del calendario
  const weekStart = getMonday(cursorDate);
  const weekDays = Array.from({ length: 6 }, (_, index) => addDays(weekStart, index));
  
  // 1 Mini Calendario lateral (mes tradicional)
  const monthStart = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1);
  const miniCalendarGridStart = getSunday(monthStart);
  const miniCalendarDays = Array.from({ length: 35 }, (_, index) => addDays(miniCalendarGridStart, index));
  
  // 2. la Vista "Mensual" (5 semanas empezando hoy)
  const boardGridStart = getSunday(cursorDate);
  const monthDays = Array.from({ length: 35 }, (_, index) => addDays(boardGridStart, index));
  
  const selectedDateKey = getDateKey(selectedDate);
  const selectedDayAppointments = appointmentsByDate[selectedDateKey] ?? [];

  const visibleTitle = viewMode === "day"
    ? `${DAY_NAMES[selectedDate.getDay()]} ${pad(selectedDate.getDate())} ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : viewMode === "month"
    ? formatMonthTitle(cursorDate)
    : `${pad(weekDays[0].getDate())} - ${pad(weekDays[5].getDate())} ${MONTH_NAMES[weekDays[5].getMonth()]} ${weekDays[5].getFullYear()}`;

  // Funciones de control
  const movePeriod = (amount) => {
    const nextDate = viewMode === "month" ? addMonths(cursorDate, amount) : addDays(cursorDate, amount * (viewMode === "day" ? 1 : 7));
    setCursorDate(nextDate);
    setSelectedDate(nextDate);
    setSelectedAppointment(null);
  };

  const moveMiniCalendarMonth = (amount) => {
    const nextDate = addMonths(cursorDate, amount);
    setCursorDate(nextDate);
    setSelectedDate(nextDate);
    setSelectedAppointment(null);
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setCursorDate(date);
    setSelectedAppointment(null);
  };

  const selectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(appointment.dateObject);
    setCursorDate(appointment.dateObject);
  };

  const renderDayAppointments = (date, compact = false) => {
    const dateAppointments = appointmentsByDate[getDateKey(date)] ?? [];
    if (!dateAppointments.length) {
      return compact ? null : <p className="appointments-calendar__empty">Sin turnos</p>;
    }
    return dateAppointments.map((appointment) => (
      <AppointmentChip
        key={appointment.id}
        appointment={appointment}
        compact={compact}
        selected={selectedAppointment?.id === appointment.id}
        onSelect={selectAppointment}
      />
    ));
  };

  return (
    <section className="appointments-panel">
      <div className="appointments-toolbar">
        <div>
          <p className="appointments-toolbar__eyebrow">Agenda profesional</p>
          <h2>{visibleTitle}</h2>
        </div>

        <div className="appointments-toolbar__actions">
          <div className="appointments-search-field">
            <span>Buscar turno</span>
            <AppointmentsSearch onSearch={setSearchAppointment} />
          </div>

          <div className="appointments-period-controls" aria-label="Cambiar periodo">
            <button type="button" onClick={() => movePeriod(-1)} aria-label="Periodo anterior">‹</button>
            <button type="button" onClick={() => { setCursorDate(today); setSelectedDate(today); setSelectedAppointment(null); }}>Hoy</button>
            <button type="button" onClick={() => movePeriod(1)} aria-label="Periodo siguiente">›</button>
          </div>

          <div className="appointments-view-toggle" aria-label="Vista de agenda">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "is-active" : ""}
                onClick={() => setViewMode(mode)}
              >
                {mode === "day" ? "Dia" : mode === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="appointments-calendar">
        <aside className="appointments-sidebar">
          <div className="mini-calendar">
            <div className="mini-calendar__header">
              <strong>{formatMonthTitle(cursorDate)}</strong>
              <div>
                <button type="button" onClick={() => moveMiniCalendarMonth(-1)} aria-label="Mes anterior">‹</button>
                <button type="button" onClick={() => moveMiniCalendarMonth(1)} aria-label="Mes siguiente">›</button>
              </div>
            </div>

            <div className="mini-calendar__grid">
              {DAY_NAMES.map((dayName) => (
                <span key={dayName} className="mini-calendar__day-name">{dayName}</span>
              ))}
              {miniCalendarDays.map((date) => {
                const dateKey = getDateKey(date);
                const hasAppointments = Boolean(appointmentsByDate[dateKey]?.length);
                const isCurrentMonth = date.getMonth() === cursorDate.getMonth();

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`${isSameDate(date, selectedDate) ? "is-selected" : ""} ${
                      isSameDate(date, today) ? "is-today" : ""
                    } ${hasAppointments ? "has-appointments" : ""} ${!isCurrentMonth ? "is-muted" : ""}`}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="appointments-day-list">
            <span className="appointments-day-list__label">Turnos del {pad(selectedDate.getDate())}</span>
            {selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((appointment) => (
                <AppointmentChip
                  key={appointment.id}
                  appointment={appointment}
                  compact
                  selected={selectedAppointment?.id === appointment.id}
                  onSelect={selectAppointment}
                />
              ))
            ) : (
              <p>No hay turnos cargados.</p>
            )}
          </div>

          <AppointmentDetails appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
        </aside>

        <div className="appointments-board">
          {viewMode === "day" && (
            <AppointmentDayView 
              selectedDate={selectedDate} 
              renderDayAppointments={renderDayAppointments} 
            />
          )}

          {viewMode === "week" && (
            <AppointmentWeekView 
              weekDays={weekDays} 
              selectedDate={selectedDate} 
              selectDate={selectDate} 
              renderDayAppointments={renderDayAppointments} 
            />
          )}

          {viewMode === "month" && (
            <AppointmentMonthView 
              monthDays={monthDays} 
              cursorDate={cursorDate} 
              selectedDate={selectedDate} 
              today={today} 
              appointmentsByDate={appointmentsByDate} 
              selectDate={selectDate} 
              selectAppointment={selectAppointment} 
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default AppointmentsContainer;