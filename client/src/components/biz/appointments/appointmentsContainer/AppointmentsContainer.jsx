import { useMemo, useState } from "react";
import { APPOINTMENTS } from "../data/appointments";
import "../appointments.css";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const WEEK_DAY_NAMES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const pad = (value) => String(value).padStart(2, "0");

const parseDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addDays = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

const addMonths = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return nextDate;
};

const getMonday = (date) => {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
};

const getSunday = (date) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() - nextDate.getDay());
  return nextDate;
};

const formatMonthTitle = (date) =>
  `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getAppointmentDate = (appointment) => parseDate(appointment.date);

const getStatusClass = (status) => {
  const normalizedStatus = normalizeText(status).replace(/\s+/g, "-");

  switch (normalizedStatus) {
    case "confirmado":
      return "is-confirmed";
    case "pendiente":
      return "is-pending";
    case "cancelado":
    case "canceled":
      return "is-cancelled";
    case "finalizado":
    case "completado":
      return "is-finished";
    default:
      return "";
  }
};

const getAppointmentAccent = (appointment) => {
  const normalizedStatus = normalizeText(appointment.status);

  if (normalizedStatus === "pendiente") return "is-warning";
  if (normalizedStatus === "cancelado") return "is-danger";
  if (normalizedStatus === "finalizado" || normalizedStatus === "completado") {
    return "is-muted";
  }

  return "is-primary";
};

const getAppointmentMinutes = (appointment) => {
  const [hours, minutes] = appointment.time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isSameDate = (firstDate, secondDate) =>
  getDateKey(firstDate) === getDateKey(secondDate);

const AppointmentChip = ({ appointment, compact = false, selected, onSelect }) => {
  const accentClass = getAppointmentAccent(appointment);
  const statusClass = getStatusClass(appointment.status);

  return (
    <button
      type="button"
      className={`appointment-chip ${accentClass} ${selected ? "is-selected" : ""} ${
        compact ? "is-compact" : ""
      }`}
      onClick={() => onSelect(appointment)}
      aria-label={`Ver detalle del turno de ${appointment.clientName}`}
    >
      <span className="appointment-chip__time">
        {appointment.time} - {appointment.endTime}
      </span>
      <span className={`appointment-chip__client ${accentClass}`}>{appointment.clientName}</span>
    </button>
  );
};

const AppointmentDetails = ({ appointment, onClose }) => {
  if (!appointment) {
    return (
      <aside className="appointment-details appointment-details--empty">
        <span className="appointment-details__eyebrow">Detalle del turno</span>
        <p>Selecciona una cita para ver cliente, expediente, ubicacion y notas.</p>
      </aside>
    );
  }

  return (
    <aside className="appointment-details">
      <div className="appointment-details__header">
        <div>
          <span className="appointment-details__eyebrow">Detalle del turno</span>
          <h3>{appointment.clientName}</h3>
        </div>
        <button type="button" className="appointment-details__close" onClick={onClose} aria-label="Cerrar detalle">
          x
        </button>
      </div>

      <span className={`appointment-details__status ${getStatusClass(appointment.status)}`}>
        {appointment.status}
      </span>

      <dl className="appointment-details__grid">
        <div>
          <dt>Fecha</dt>
          <dd>{appointment.date}</dd>
        </div>
        <div>
          <dt>Horario</dt>
          <dd>
            {appointment.time} - {appointment.endTime}
          </dd>
        </div>
        <div>
          <dt>Expediente</dt>
          <dd>{appointment.caseNumber}</dd>
        </div>
        <div>
          <dt>Materia</dt>
          <dd>{appointment.area}</dd>
        </div>
        <div>
          <dt>Ubicacion</dt>
          <dd>{appointment.location}</dd>
        </div>
        <div>
          <dt>Motivo</dt>
          <dd>{appointment.reason}</dd>
        </div>
      </dl>

      <p className="appointment-details__notes">{appointment.notes}</p>
    </aside>
  );
};

const AppointmentsContainer = () => {
  const today = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState("week");
  const [cursorDate, setCursorDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchAppointment, setSearchAppointment] = useState("");

  const appointments = useMemo(
    () =>
      APPOINTMENTS.map((appointment) => ({
        ...appointment,
        dateObject: getAppointmentDate(appointment),
      })).sort((firstAppointment, secondAppointment) => {
        const dateDiff = firstAppointment.dateObject - secondAppointment.dateObject;
        return dateDiff || getAppointmentMinutes(firstAppointment) - getAppointmentMinutes(secondAppointment);
      }),
    []
  );

  const filteredAppointments = useMemo(() => {
    const searchValue = normalizeText(searchAppointment.trim());

    if (!searchValue) return appointments;

    return appointments.filter((appointment) => {
      const searchable = [
        appointment.clientName,
        appointment.lawyerName,
        appointment.reason,
        appointment.status,
        appointment.caseNumber,
        appointment.area,
      ].join(" ");

      return normalizeText(searchable).includes(searchValue);
    });
  }, [appointments, searchAppointment]);

  const appointmentsByDate = useMemo(
    () =>
      filteredAppointments.reduce((groupedAppointments, appointment) => {
        groupedAppointments[appointment.date] = groupedAppointments[appointment.date] ?? [];
        groupedAppointments[appointment.date].push(appointment);
        return groupedAppointments;
      }, {}),
    [filteredAppointments]
  );

  const weekStart = getMonday(cursorDate);
  const weekDays = Array.from({ length: 6 }, (_, index) => addDays(weekStart, index));
  const monthStart = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1);
  const monthGridStart = getSunday(monthStart);
  const monthDays = Array.from({ length: 35 }, (_, index) => addDays(monthGridStart, index));
  const miniCalendarDays = Array.from({ length: 35 }, (_, index) => addDays(monthGridStart, index));
  const selectedDateKey = getDateKey(selectedDate);
  const selectedDayAppointments = appointmentsByDate[selectedDateKey] ?? [];
  const visibleTitle =
    viewMode === "day"
      ? `${DAY_NAMES[selectedDate.getDay()]} ${pad(selectedDate.getDate())} ${
          MONTH_NAMES[selectedDate.getMonth()]
        } ${selectedDate.getFullYear()}`
      : viewMode === "month"
      ? formatMonthTitle(cursorDate)
      : `${pad(weekDays[0].getDate())} - ${pad(weekDays[5].getDate())} ${
          MONTH_NAMES[weekDays[5].getMonth()]
        } ${weekDays[5].getFullYear()}`;

  const movePeriod = (amount) => {
    const nextDate =
      viewMode === "month" ? addMonths(cursorDate, amount) : addDays(cursorDate, amount * (viewMode === "day" ? 1 : 7));
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
          <label className="appointments-search-field">
            <span>Buscar turno</span>
            <input
              type="search"
              value={searchAppointment}
              placeholder="Cliente, expediente o motivo"
              onChange={(event) => setSearchAppointment(event.target.value)}
            />
          </label>

          <div className="appointments-period-controls" aria-label="Cambiar periodo">
            <button type="button" onClick={() => movePeriod(-1)} aria-label="Periodo anterior">
              ‹
            </button>
            <button
              type="button"
              onClick={() => {
                setCursorDate(today);
                setSelectedDate(today);
                setSelectedAppointment(null);
              }}
            >
              Hoy
            </button>
            <button type="button" onClick={() => movePeriod(1)} aria-label="Periodo siguiente">
              ›
            </button>
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
                <button type="button" onClick={() => moveMiniCalendarMonth(-1)} aria-label="Mes anterior">
                  ‹
                </button>
                <button type="button" onClick={() => moveMiniCalendarMonth(1)} aria-label="Mes siguiente">
                  ›
                </button>
              </div>
            </div>

            <div className="mini-calendar__grid">
              {DAY_NAMES.map((dayName) => (
                <span key={dayName} className="mini-calendar__day-name">
                  {dayName}
                </span>
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
            <div className="appointments-day-view">
              <div className="appointments-day-view__header">
                <span>{DAY_NAMES[selectedDate.getDay()]}</span>
                <strong>{pad(selectedDate.getDate())}</strong>
              </div>
              <div className="appointments-day-view__list">{renderDayAppointments(selectedDate)}</div>
            </div>
          )}

          {viewMode === "week" && (
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
                    <div className="appointments-week-view__appointments">{renderDayAppointments(date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === "month" && (
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
          )}
        </div>
      </div>
    </section>
  );
};

export default AppointmentsContainer;
