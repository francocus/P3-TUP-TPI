import { useContext, useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import { getStatusClass } from "../appointmentDetails/AppointmentDetails";
import AppointmentsSearch from "../appointmentsSearch/AppointmentsSearch";
import { normalizeText, parseDate, pad } from "../../calendar/Calendar.data.js";
import NewAppointment from "../newAppointment/NewAppointment";
import DeleteModal from "../../../shared/deleteModal/DeleteModal.jsx";
import ToggleTheme from "../../../shared/toggleTheme/ToggleTheme.jsx";
import "../appointments.css";
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
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleExpanded = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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
      try {
        const response = await fetch(`${API_URL}/users/lawyers`, {
          headers: buildHeaders(token),
        });
        if (response.ok) {
          const data = await response.json();
          setLawyers(data.lawyers ?? []);
        }
      } catch (error) {
        console.error('Error al cargar abogados', error);
        setMessage('No se pudieron cargar los abogados disponibles.');
      }
    };

    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_URL}/users/clients`, {
          headers: buildHeaders(token),
        });
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients ?? []);
        }
      } catch (error) {
        console.error('Error al cargar clientes', error);
        setMessage('No se pudieron cargar los clientes disponibles.');
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

  const hasScrollableContent = filteredAppointments.length > 0;

  return (
    <section
      className={`appointments-panel ${user?.role === "sysadmin" ? "appointments-panel--admin" : ""}${hasScrollableContent ? " has-scroll-content" : ""}`}
    >
      <div className="appointments-toolbar">
        <div>
          <p className="appointments-toolbar__eyebrow">
            {user?.role === "sysadmin" ? "Gestión de turnos" : "Visualizá y gestioná los turnos"}
          </p>
          <h2>{user?.role === "sysadmin" ? "Gestión de turnos" : "Turnos programados"}</h2>
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
            filteredAppointments.map((appointment) => {
              const isExpanded = expandedIds.has(appointment.id);
              return (
                <div key={appointment.id} className={`appointment-card ${isExpanded ? "is-expanded" : ""}`}>
                  <button
                    type="button"
                    className="appointment-card__summary"
                    onClick={() => toggleExpanded(appointment.id)}
                    aria-expanded={isExpanded}
                  >
                    <span className="appointment-card__summary-top">
                      <span className="appointment-card__summary-text">
                        {user?.role === "cliente" ? appointment.lawyerName : appointment.clientName}
                      </span>
                      <svg className="appointment-card__chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="appointment-card__summary-bottom">
                      <span className="appointment-card__summary-date">
                        {appointment.date} • {appointment.time}
                      </span>
                      <span className={`appointment-details__status ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="appointment-card__content">
                      <div className="appointment-card__body">
                        <span className="appointment-card__field-label">Motivo</span>
                        <p>{appointment.reason}</p>
                      </div>

                      {user?.role === "abogado" && (
                        <div className="appointment-card__actions">
                          <span className="appointment-card__actions-label">Acciones</span>
                          <div className="appointment-card__actions-buttons">
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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
                            <path d="M9 3.75h6l1 1.5H20v1.5H4v-1.5h4l1-1.5Zm1.5 5.25h1.5v7.5h-1.5v-7.5Zm4.5 0h1.5v7.5H15v-7.5Zm-8.25 0h1.5v7.5h-1.5v-7.5Zm1.5 11.25h9A1.75 1.75 0 0 0 19 18v-8.25H5V18c0 .97.78 1.75 1.75 1.75Z" />
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