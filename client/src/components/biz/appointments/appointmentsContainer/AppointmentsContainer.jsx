import { useContext, useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import AppointmentDetails from "../appointmentDetails/AppointmentDetails";
import AppointmentItem from "../appointmentItem/AppointmentItem";
import AppointmentsSearch from "../appointmentsSearch/AppointmentsSearch";
import { normalizeText, parseDate, pad } from "../../calendar/Calendar.data.js";
import NewAppointment from "../newAppointment/NewAppointment";
import DeleteModal from "../../../shared/deleteModal/DeleteModal.jsx";
import "../appointments.css";
import { API_URL } from "../../../services/consts/apiConsts";

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
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

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
        console.error("Error al cargar abogados", error);
        setMessage("No se pudieron cargar los abogados disponibles.");
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
        console.error("Error al cargar clientes", error);
        setMessage("No se pudieron cargar los clientes disponibles.");
      }
    };

    if (token) {
      if (["cliente", "client", "sysadmin"].includes(user?.role))
        fetchLawyers();
      if (["abogado", "sysadmin"].includes(user?.role)) fetchClients();
    }
  }, [token, user]);

  const searchValue = normalizeText(searchAppointment.trim());

  const roleFilteredAppointments = appointments.filter((appointment) => {
    if (
      statusFilter !== "all" &&
      appointment.status.toLowerCase() !== statusFilter.toLowerCase()
    )
      return false;
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
            {user?.role === "sysadmin"
              ? "Gestión de turnos"
              : "Visualizá y gestioná los turnos"}
          </p>
          <h2>
            {user?.role === "sysadmin"
              ? "Gestión de turnos"
              : "Turnos programados"}
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
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <label className="appointments-search-field">
            <AppointmentsSearch onSearch={setSearchAppointment} />
          </label>

          {(user?.role === "cliente" ||
            user?.role === "abogado" ||
            user?.role === "sysadmin") && (
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
              <AppointmentDetails
                key={appointment.id}
                appointment={appointment}
                user={user}
                isExpanded={expandedIds.has(appointment.id)}
                onToggle={() => toggleExpanded(appointment.id)}
                onStatus={handleStatus}
                onCancel={setAppointmentToCancel}
                onEdit={setAppointmentToEdit}
              />
            ))
          ) : (
            <div
              className="appointments-calendar__empty"
              style={{ gridColumn: "1 / -1" }}
            >
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

      {user?.role === "sysadmin" &&
        (filteredAppointments.length > 0 ? (
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
                  <AppointmentItem
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={setAppointmentToEdit}
                    onDelete={setAppointmentToDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="appointments-empty">No se encontraron turnos.</p>
        ))}

      <DeleteModal
        show={Boolean(appointmentToDelete)}
        onHide={() => setAppointmentToDelete(null)}
        onConfirm={() => handleDeleteAppointment(appointmentToDelete.id)}
        title="Eliminar turno"
        message="¿Estás seguro que deseas eliminar el turno de"
        itemName={appointmentToDelete?.clientName}
        confirmLabel="Sí, deseo eliminarlo"
      />

      <DeleteModal
        show={Boolean(appointmentToCancel)}
        onHide={() => setAppointmentToCancel(null)}
        onConfirm={() => handleStatus(appointmentToCancel, "cancelado")}
        title="Cancelar turno"
        message="¿Estás seguro que deseas cancelar el turno de"
        itemName={appointmentToCancel?.clientName}
        confirmLabel="Sí, deseo cancelarlo"
      />

      <NewAppointment
        show={showRequest || Boolean(appointmentToEdit)}
        appointment={appointmentToEdit}
        onHide={() => {
          setShowRequest(false);
          setAppointmentToEdit(null);
        }}
        onSubmit={appointmentToEdit ? handleEdit : handleRequest}
        lawyers={lawyers}
        clients={clients}
        appointments={appointments}
        user={user}
      />
    </section>
  );
};

export default AppointmentsContainer;
