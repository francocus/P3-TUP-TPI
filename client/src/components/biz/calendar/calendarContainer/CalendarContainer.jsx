import { useContext, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import { getStatusClass } from "../../appointments/Appointments.data";
import MonthView from "../monthView/MonthView";
import WeekView from "../weekView/WeekView";
import { addDays, addMonths, formatMonthTitle, getDateKey, getMonday, pad, parseDate } from "../Calendar.data";
import { MONTH_NAMES } from "../../../services/consts/calendarConsts";
import "../../appointments/appointments.css";
import "../../dashboard/dashboard.css";
import { API_URL } from '../../../services/consts/apiConsts';

const buildHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const getErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.message || "No se pudo completar la operacion.";
  } catch (_error) {
    return "No se pudo completar la operacion.";
  }
};

const addHour = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${pad(hours + 1)}:${pad(minutes)}`;
};

const getAppointmentMinutes = (appointment) => {
  const [hours, minutes] = appointment.time.split(":").map(Number);
  return hours * 60 + minutes;
};

const mapAppointment = (appointment) => ({
  ...appointment,
  dateObject: parseDate(appointment.date),
  clientName: appointment.client?.name ?? "Cliente",
  lawyerName: appointment.lawyer?.name ?? "Abogado",
  lawyerId: appointment.lawyer?.id ?? appointment.lawyerId,
  clientId: appointment.client?.id ?? appointment.clientId,
  caseNumber: appointment.case?.caseNumber ?? "Sin expediente",
  endTime: appointment.endTime || addHour(appointment.time),
});

const CalendarContainer = () => {
  const { token, user } = useContext(AuthenticationContext);
  const [today] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("week");
  const [cursorDate, setCursorDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setMessage("");
        const response = await fetch(`${API_URL}/appointments`, {
          headers: buildHeaders(token),
        });
        if (!response.ok) throw new Error(await getErrorMessage(response));
        const data = await response.json();
        setAppointments(
          (data.appointments ?? [])
            .map(mapAppointment)
            .sort(
              (a, b) =>
                a.dateObject - b.dateObject ||
                getAppointmentMinutes(a) - getAppointmentMinutes(b),
            ),
        );
      } catch (error) {
        setMessage(error.message || "No se pudieron cargar los turnos.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAppointments();
  }, [token]);

  const visibleAppointments = appointments.filter((appointment) => {
    if (user?.role === "abogado") return appointment.lawyerId === user.id;
    if (user?.role === "cliente") return appointment.clientId === user.id;
    return true;
  });

  const appointmentsByDate = visibleAppointments.reduce(
    (grouped, appointment) => ({
      ...grouped,
      [appointment.date]: [...(grouped[appointment.date] ?? []), appointment],
    }),
    {}
  );

  const selectedDayAppointments = appointmentsByDate[getDateKey(selectedDate)] ?? [];
  const weekStart = getMonday(cursorDate);
  const weekEnd = addDays(weekStart, 6);
  const visibleTitle =
    viewMode === "month"
      ? formatMonthTitle(cursorDate)
      : `${pad(weekStart.getDate())} - ${pad(weekEnd.getDate())} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

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

  const movePeriod = (amount) => {
    setCursorDate((prev) =>
      viewMode === "month"
        ? addMonths(prev, amount)
        : addDays(prev, amount * 7),
    );
  };

  return (
    <section className="dashboard-content">
      <div className="dashboard-calendar">
        <div className="dashboard-calendar__hero">
          <div>
            <p className="dashboard-overview__eyebrow">Agenda del estudio</p>
            <h2 className="dashboard-calendar__title">{visibleTitle}</h2>
          </div>

          <div className="appointments-calendar-controls">
            <div className="appointments-period-controls">
              <button type="button" onClick={() => movePeriod(-1)}>
                {"<"}
              </button>
              <button type="button" onClick={() => selectDate(today)}>
                Hoy
              </button>
              <button type="button" onClick={() => movePeriod(1)}>
                {">"}
              </button>
            </div>

            <div className="appointments-view-toggle">
              {['week', 'month'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={viewMode === mode ? "is-active" : ""}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {message && (
          <Alert className="dashboard-message dashboard-message--error" variant="danger">
            {message}
          </Alert>
        )}

        {loading ? (
          <p className="appointments-calendar__empty">Cargando turnos...</p>
        ) : (
          <div className="dashboard-calendar__layout">
            <div className="dashboard-calendar__board">
              {viewMode === "month" ? (
                <MonthView
                  cursorDate={cursorDate}
                  selectedDate={selectedDate}
                  today={today}
                  appointmentsByDate={appointmentsByDate}
                  onDateChange={selectDate}
                  onSelectAppointment={selectAppointment}
                />
              ) : (
                <WeekView
                  cursorDate={cursorDate}
                  selectedDate={selectedDate}
                  selectedAppointment={selectedAppointment}
                  appointmentsByDate={appointmentsByDate}
                  onDateChange={selectDate}
                  onSelectAppointment={selectAppointment}
                />
              )}
            </div>

            <aside className="dashboard-calendar__details">
              <span className="appointment-details__eyebrow">Detalle del turno</span>
              {selectedAppointment ?? selectedDayAppointments[0] ? (
                (() => {
                  const appointment = selectedAppointment ?? selectedDayAppointments[0];
                  return (
                    <>
                      <h3>{appointment.clientName}</h3>
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
                          <dt>Abogado</dt>
                          <dd>{appointment.lawyerName}</dd>
                        </div>
                        <div>
                          <dt>Expediente</dt>
                          <dd>{appointment.caseNumber}</dd>
                        </div>
                        <div>
                          <dt>Motivo</dt>
                          <dd>{appointment.reason}</dd>
                        </div>
                      </dl>
                      {appointment.notes && <p className="appointment-details__notes">{appointment.notes}</p>}
                    </>
                  );
                })()
              ) : (
                <p>Seleccioná un turno para ver cliente, abogado, horario y motivo.</p>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default CalendarContainer;
