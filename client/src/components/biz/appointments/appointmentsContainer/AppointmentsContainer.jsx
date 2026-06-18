import { useContext, useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import { getStatusClass } from "../appointmentDetails/AppointmentDetails";
import AppointmentsSearch from "../appointmentsSearch/AppointmentsSearch";
import { normalizeText, parseDate, pad } from "../calendar/Calendar.data";
import NewAppointment from "../newAppointment/NewAppointment";
import DeleteModal from "../../../shared/deleteModal/DeleteModal.jsx";
import ToggleTheme from "../../../shared/toggleTheme/ToggleTheme.jsx";
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
  lawyerId: appointment.lawyer?.id ?? appointment.lawyerId,
  clientId: appointment.client?.id ?? appointment.clientId,
  caseNumber: appointment.case?.caseNumber ?? "Sin expediente",
  endTime: appointment.endTime || addHour(appointment.time),
});

const AppointmentsContainer = () => {
  const { token, user } = useContext(AuthenticationContext);
  const [searchAppointment, setSearchAppointment] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [showRequest, setShowRequest] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

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

    const fetchClients = async () => {
      const response = await fetch(`${API_URL}/users/clients`, {
        headers: buildHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients ?? []);
      }
    };

    if (token) {
      if (["cliente", "client", "sysadmin"].includes(user?.role)) fetchLawyers();
      if (["abogado", "sysadmin"].includes(user?.role)) fetchClients();
    }
  }, [token, user]);

  const searchValue = normalizeText(searchAppointment.trim());

  const roleFilteredAppointments = appointments.filter((appointment) => {
    if (statusFilter !== "all" && appointment.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (user?.role === "abogado") return appointment.lawyerId === user.id;
    if (user?.role === "cliente") return appointment.clientId === user.id;
    return true;
  });

  const filteredAppointments = searchValue
    ? roleFilteredAppointments.filter((appointment) =>
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
    : roleFilteredAppointments;

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
  };

  const handleDeleteAppointment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: buildHeaders(token),
      });

      if (!response.ok) throw new Error(await getErrorMessage(response));

      await fetchAppointments();
      setAppointmentToDelete(null);
    } catch (error) {
      setMessage(error.message || "No se pudo eliminar el turno.");
    }
  };

  return (
  <section
    className={`appointments-panel ${user?.role === "sysadmin" ? "appointments-panel--admin" : ""}`}
  >
    <div className="appointments-toolbar">
      <div>
        <p className="appointments-toolbar__eyebrow">
          {user?.role === "sysadmin" ? "Gestión de turnos" : "Visualizá y gestioná el estado de los turnos"} 
        </p>
        <h2>{user?.role === "sysadmin" ? "Gestión de turnos" : "Mis turnos"}
        </h2>
      </div>

      <div className="appointments-toolbar__actions">
        <select
          className="appointments-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <label className="appointments-search-field">
          <AppointmentsSearch onSearch={setSearchAppointment} />
        </label>

        {(user?.role === "cliente" || user?.role === "abogado" || user?.role === "sysadmin") && (
          <Button
            type="button"
            className="appointments-create"
            onClick={() => setShowRequest(true)}
          >
            {user?.role === "cliente" ? "Solicitar turno" : "Agendar turno"}
          </Button>
        )}
      </div>
    </div>

    {user?.role !== "sysadmin" && (
      <div className="appointments-cards-grid">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-card__header">
                <span className={`appointment-details__status ${getStatusClass(appointment.status)}`}>
                  {appointment.status}
                </span>
                <span className="appointment-card__date">
                  {appointment.date} • {appointment.time}
                </span>
              </div>

              <div className="appointment-card__body">
                <h3>
                  {user?.role === "cliente"
                    ? `Abogado: ${appointment.lawyerName}`
                    : `Cliente: ${appointment.clientName}`}
                </h3>
                <p><strong>Motivo:</strong> {appointment.reason}</p>
              </div>

              {user?.role === "abogado" && (
                <div className="appointment-card__actions">
                  <button
                    type="button"
                    className="appointment-admin-action appointment-admin-action--edit"
                    title="Editar turno"
                    onClick={() => setAppointmentToEdit(appointment)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M4 17.25V20h2.75L18.81 7.94l-2.75-2.75L4 17.25Zm14.71-9.54a.996.996 0 0 0 0-1.41l-1.01-1.01a.996.996 0 1 0-1.41 1.41l1.01 1.01c.39.39 1.03.39 1.41 0Z" />
                    </svg>
                  </button>

                  {appointment.status.toLowerCase() !== "cancelado" && (
                    <button
                      type="button"
                      className="appointment-admin-action appointment-admin-action--delete"
                      title="Cancelar turno"
                      onClick={() => {
                        if (window.confirm("¿Estás seguro que querés cancelar este turno?")) {
                          handleStatus(appointment, "Cancelado");
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
                        <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="appointments-calendar__empty" style={{ gridColumn: "1 / -1" }}>
            No hay turnos programados.
          </div>
        )}
      </div>
    )}

    {message && (
      <Alert className="users-alert" variant="danger">
        {message}
      </Alert>
    )}

    {user?.role === "sysadmin" && (
      filteredAppointments.length > 0 ? (
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
                    <span className={`appointment-details__status ${getStatusClass(appointment.status)}`}>
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
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M4 17.25V20h2.75L18.81 7.94l-2.75-2.75L4 17.25Zm14.71-9.54a.996.996 0 0 0 0-1.41l-1.01-1.01a.996.996 0 1 0-1.41 1.41l1.01 1.01c.39.39 1.03.39 1.41 0Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="appointment-admin-action appointment-admin-action--delete"
                        title="Eliminar turno"
                        aria-label="Eliminar turno"
                        onClick={() => setAppointmentToDelete(appointment)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="appointments-empty">No se encontraron turnos.</p>
      )
    )}

     <DeleteModal
      show={Boolean(appointmentToDelete)}
      onHide={() => setAppointmentToDelete(null)}
      onConfirm={() => handleDeleteAppointment(appointmentToDelete.id)}
      title="Eliminar turno"
      message="¿Estás seguro que deseas eliminar el turno de"
      itemName={appointmentToDelete?.clientName}
    />

    <NewAppointment
      show={showRequest}
      onHide={() => setShowRequest(false)}
      onSubmit={handleRequest}
      lawyers={lawyers}
      clients={clients}
      token={token}
      appointments={appointments}
      user={user}
    />
    <NewAppointment
      show={Boolean(appointmentToEdit)}
      appointment={appointmentToEdit}
      onHide={() => setAppointmentToEdit(null)}
      onSubmit={handleEdit}
      lawyers={lawyers}
      clients={clients}
      user={user}
    />
  </section>
);
};

export default AppointmentsContainer;