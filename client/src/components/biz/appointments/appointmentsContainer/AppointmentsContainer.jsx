import { useContext, useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import AppointmentsCalendar from "../calendar/AppointmentsCalendar";
import MiniCalendar from "../calendar/MiniCalendar";
import { getStatusClass } from "../appointmentDetails/AppointmentDetails";
import AppointmentsSearch from "../appointmentsSearch/AppointmentsSearch";
import {
  addDays,
  addMonths,
  formatMonthTitle,
  getDateKey,
  getMonday,
  MONTH_NAMES,
  normalizeText,
  pad,
  parseDate,
} from "../data/appointments.data";
import NewAppointment from "../newAppointment/NewAppointment";
import "../appointments.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

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
  caseNumber: appointment.case?.caseNumber ?? "Sin expediente",
  endTime: appointment.endTime || addHour(appointment.time),
});

const AppointmentsContainer = () => {
  const { token, user } = useContext(AuthenticationContext);
  const [today] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("week");
  const [cursorDate, setCursorDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchAppointment, setSearchAppointment] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [showRequest, setShowRequest] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (token) fetchAppointments();
  }, [token]);

  useEffect(() => {
    const fetchLawyers = async () => {
      const response = await fetch(`${API_URL}/users/lawyers`, {
        headers: buildHeaders(token),
      });
      if (response.ok) setLawyers((await response.json()).lawyers ?? []);
    };
    if (token && ["cliente", "sysadmin"].includes(user?.role)) fetchLawyers();
  }, [token, user]);

  const searchValue = normalizeText(searchAppointment.trim());
  
  const filteredAppointments = searchValue
    ? appointments.filter((appointment) =>
        normalizeText(
          [
            appointment.clientName,
            appointment.lawyerName,
            appointment.reason,
            appointment.status,
            appointment.caseNumber,
          ].join(" "),
        ).includes(searchValue),
      )
    : appointments;
    
  const appointmentsByDate = filteredAppointments.reduce(
    (grouped, appointment) => ({
      ...grouped,
      [appointment.date]: [...(grouped[appointment.date] ?? []), appointment],
    }),
    {},
  );
  const selectedDayAppointments =
    appointmentsByDate[getDateKey(selectedDate)] ?? [];
  const weekStart = getMonday(cursorDate);
  const weekEnd = addDays(weekStart, 6);
  const visibleTitle =
    viewMode === "day"
      ? `${pad(selectedDate.getDate())} ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
      : viewMode === "month"
        ? formatMonthTitle(cursorDate)
        : `${pad(weekStart.getDate())} - ${pad(weekEnd.getDate())} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const movePeriod = (amount) => {
    const nextDate =
      viewMode === "month"
        ? addMonths(cursorDate, amount)
        : addDays(cursorDate, amount * (viewMode === "day" ? 1 : 7));
    selectDate(nextDate);
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

  const updateAppointment = async (appointment, payload) => {
    const response = await fetch(`${API_URL}/appointments/${appointment.id}`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    await fetchAppointments();
  };

  const handleStatus = async (appointment, status) => {
    try {
      await updateAppointment(appointment, { status });
      setSelectedAppointment(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleRequest = async (form) => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(form),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    await fetchAppointments();
  };

  const handleEdit = async (appointment, form) => {
    await updateAppointment(appointment, form);
    setAppointmentToEdit(null);
    setSelectedAppointment(null);
  };

  const calendarControls = (
    <div className="appointments-calendar-controls">
      <label className="appointments-search-field">
        <span>Buscar turno</span>
        <AppointmentsSearch onSearch={setSearchAppointment} />
      </label>
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
  );

  return (
    <section
      className={`appointments-panel ${user?.role === "sysadmin" ? "appointments-panel--admin" : ""}`}
    >
      <div className="appointments-toolbar">
        <div>
          <p className="appointments-toolbar__eyebrow">
            {user?.role === "sysadmin"
              ? "Gestion de turnos"
              : "Agenda profesional"}
          </p>
          <h2>
            {user?.role === "sysadmin" ? "Gestion de Turnos" : visibleTitle}
          </h2>
        </div>
        {user?.role !== "sysadmin" && (
          <div className="appointments-toolbar__actions">
            {user?.role === "cliente" && (
              <Button
                type="button"
                className="appointments-create"
                onClick={() => setShowRequest(true)}
              >
                Solicitar turno
              </Button>
            )}
            {calendarControls}
          </div>
        )}
      </div>

      {message && (
        <Alert className="users-alert" variant="danger">
          {message}
        </Alert>
      )}

      {user?.role === "sysadmin" && (
        <div className="appointments-table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Cliente / Abogado</th>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="appointment-admin-row">
                  <td className="appointment-admin-cell appointment-admin-cell--main">
                    <div className="appointment-admin-main">
                      <span className="appointment-admin-main__name">
                        {appointment.clientName}
                      </span>
                      <span className="appointment-admin-main__lawyer">
                        {appointment.lawyerName}
                      </span>
                    </div>
                  </td>
                  <td className="appointment-admin-cell appointment-admin-cell--muted">
                    {appointment.date} {appointment.time}
                  </td>
                  <td className="appointment-admin-cell appointment-admin-cell--muted">
                    {appointment.reason}
                  </td>
                  <td className="appointment-admin-cell">
                    <span
                      className={`appointment-details__status ${getStatusClass(appointment.status)}`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="appointment-admin-cell appointment-admin-cell--actions">
                    <div className="appointment-admin-actions">
                      <button
                        type="button"
                        className="appointment-admin-action appointment-admin-action--edit"
                        title="Editar turno"
                        aria-label="Editar turno"
                        onClick={() => setAppointmentToEdit(appointment)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M4 17.25V20h2.75L18.81 7.94l-2.75-2.75L4 17.25Zm14.71-9.54a.996.996 0 0 0 0-1.41l-1.01-1.01a.996.996 0 1 0-1.41 1.41l1.01 1.01c.39.39 1.03.39 1.41 0Z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {user?.role === "sysadmin" && calendarControls}

      {loading ? (
        <p className="appointments-calendar__empty">Cargando turnos...</p>
      ) : (
        <div className="appointments-calendar">
          <MiniCalendar
            cursorDate={cursorDate}
            selectedDate={selectedDate}
            today={today}
            appointmentsByDate={appointmentsByDate}
            selectedAppointment={selectedAppointment}
            selectedDayAppointments={selectedDayAppointments}
            user={user}
            onDateChange={selectDate}
            onSelectAppointment={selectAppointment}
            onClearAppointment={() => setSelectedAppointment(null)}
            onStatus={handleStatus}
            onEdit={setAppointmentToEdit}
          />
          <div className="appointments-board">
            <AppointmentsCalendar
              viewMode={viewMode}
              cursorDate={cursorDate}
              selectedDate={selectedDate}
              today={today}
              selectedAppointment={selectedAppointment}
              appointmentsByDate={appointmentsByDate}
              onDateChange={selectDate}
              onSelectAppointment={selectAppointment}
            />
          </div>
        </div>
      )}

      <NewAppointment
        show={showRequest}
        onHide={() => setShowRequest(false)}
        onSubmit={handleRequest}
        lawyers={lawyers}
        token={token}
        appointments={appointments}
      />
      <NewAppointment
        show={Boolean(appointmentToEdit)}
        appointment={appointmentToEdit}
        onHide={() => setAppointmentToEdit(null)}
        onSubmit={handleEdit}
        lawyers={lawyers}
        user={user}
      />
    </section>
  );
};

export default AppointmentsContainer;
