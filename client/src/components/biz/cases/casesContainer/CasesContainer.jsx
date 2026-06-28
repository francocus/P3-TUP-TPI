import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import { Alert, Button } from "react-bootstrap";
import DeleteModal from "../../../shared/deleteModal/DeleteModal.jsx";
import CaseDetails from "../caseDetails/CaseDetails";
import NewCase from "../newCase/NewCase";
import CasesItem from "../casesItem/CasesItem";
import CasesSearch from "../casesSearch/CasesSearch";
import "../cases.css";

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

const normalizeCaseEntry = (legalCase) => ({
  id: legalCase.id,
  caseNumber: legalCase.caseNumber ?? "",
  title: legalCase.title ?? "",
  area: legalCase.area ?? "",
  status: legalCase.status ?? "activo",
  startDate: legalCase.startDate ?? "",
  lastUpdate: legalCase.lastUpdate ?? "",
  description: legalCase.description ?? "",
  notes: legalCase.notes ?? "",
  clientId: legalCase.clientId ?? legalCase.client?.id ?? "",
  lawyerId: legalCase.lawyerId ?? legalCase.lawyer?.id ?? "",
  clientName: legalCase.client?.name ?? "Sin cliente",
  lawyerName: legalCase.lawyer?.name ?? "Sin abogado",
});

const CasesContainer = () => {
  const { token, user: currentUser } = useContext(AuthenticationContext);
  const [cases, setCases] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchCase, setSearchCase] = useState("");
  const [showNewCase, setShowNewCase] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState(null);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCases = async () => {
    const response = await fetch(`${API_URL}/cases`, {
      headers: buildHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const data = await response.json();
    setCases((data.cases ?? []).map(normalizeCaseEntry));
  };

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
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadCases = async () => {
      try {
        setLoading(true);
        setMessage("");
        await fetchCases();
      } catch (error) {
        setMessage(error.message || "No se pudieron cargar los expedientes.");
      } finally {
        setLoading(false);
      }
    };

    loadCases();

    if (["abogado", "sysadmin"].includes(currentUser?.role)) {
      fetchClients();
    }
    if (currentUser?.role === "sysadmin") {
      fetchLawyers();
    }
  }, [token, currentUser]);

  const handleSearch = (searchValue) => {
    setSearchCase(searchValue);
  };

  const handleOpenNewCase = () => {
    setCaseToEdit(null);
    setCaseToDelete(null);
    setShowNewCase(true);
  };

  const handleCloseForms = () => {
    setShowNewCase(false);
    setCaseToEdit(null);
    setCaseToDelete(null);
    setMessage("");
  };

  const handleAddCase = async (form) => {
    const payload = {
      ...form,
      clientId: Number(form.clientId),
      lawyerId: form.lawyerId ? Number(form.lawyerId) : Number(currentUser?.id),
    };

    const response = await fetch(`${API_URL}/cases`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await fetchCases();
    handleCloseForms();
  };

  const handleEditCase = async (form) => {
    const payload = {
      ...form,
      clientId: Number(form.clientId),
      lawyerId: form.lawyerId ? Number(form.lawyerId) : Number(currentUser?.id),
    };

    const response = await fetch(`${API_URL}/cases/${form.id}`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await fetchCases();
    handleCloseForms();
  };

  const handleDeleteCase = async (id) => {
    const response = await fetch(`${API_URL}/cases/${id}`, {
      method: "DELETE",
      headers: buildHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await fetchCases();
    setCaseToDelete(null);
  };

  const query = searchCase.trim().toLowerCase();

  const filteredCases = cases.filter((legalCase) => {

    const matchesSearch =
      legalCase.caseNumber.toLowerCase().includes(query) ||
      legalCase.title.toLowerCase().includes(query) ||
      legalCase.area.toLowerCase().includes(query) ||
      legalCase.clientName.toLowerCase().includes(query) ||
      legalCase.lawyerName.toLowerCase().includes(query) ||
      legalCase.status.toLowerCase().includes(query) ||
      legalCase.description.toLowerCase().includes(query) ||
      legalCase.notes.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      legalCase.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const hasScrollableContent = !loading && filteredCases.length > 0;

  return (
    <section className={`cases-panel${hasScrollableContent ? " has-scroll-content" : ""}`}>
      <header className="cases-header">
        <div className="cases-header__copy">
          <p>{currentUser?.role === "sysadmin" ? "Gestión de expedientes" : "Visualizá y gestioná el estado de los expedientes"}</p>
          <h2>{currentUser?.role === "sysadmin" ? "Gestión de expedientes" : "Expedientes asignados"}</h2>
        </div>

        <div className="cases-header__controls">
          <div className="cases-filter-wrap">
            <select
              className="cases-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
              <option value="cerrado">Cerrado</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
          <div className="cases-search-wrap">
            <CasesSearch onSearch={handleSearch} />
          </div>

          {currentUser?.role === "abogado" || currentUser?.role === "sysadmin" ? (
            <Button
              type="button"
              className="cases-create"
              title="Crear expediente"
              aria-label="Crear expediente"
              onClick={handleOpenNewCase}
            >
              <span className="cases-create__text">Crear expediente</span>
            </Button>
          ) : null}
        </div>
      </header>

      {message ? (
        <Alert className="cases-alert" variant="danger">
          {message}
        </Alert>
      ) : null}

      {showNewCase ? (
        <NewCase
          currentUser={currentUser}
          clients={clients}
          lawyers={lawyers}
          onAddCase={handleAddCase}
          onFormClosed={handleCloseForms}
        />
      ) : null}

      {caseToEdit ? (
        <CaseDetails
          legalCase={caseToEdit}
          currentUser={currentUser}
          clients={clients}
          lawyers={lawyers}
          onEditCase={handleEditCase}
          onFormClosed={handleCloseForms}
        />
      ) : null}

      {caseToDelete && (
        <DeleteModal
          show={Boolean(caseToDelete)}
          onHide={() => setCaseToDelete(null)}
          onConfirm={() => handleDeleteCase(caseToDelete.id)}
          title="Eliminar expediente"
          message="¿Estás seguro que deseas eliminar el expediente"
          itemName={caseToDelete?.caseNumber}
        />
      )}

      {loading ? (
        <p className="cases-empty">Cargando expedientes...</p>
      ) : filteredCases.length > 0 ? (
        <>
          {currentUser?.role === "sysadmin" && (
            <div className="cases-table-wrap">
              <table className="cases-table">
                <thead>
                  <tr>
                    <th>Expediente / Título</th>
                    <th>Cliente / Abogado</th>
                    <th>Área</th>
                    <th>Estado</th>
                    <th className="cases-table__actions-head">Acciones Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((legalCase) => (
                    <tr key={legalCase.id} className="case-admin-row">
                      <td className="case-admin-cell case-admin-cell--main">
                        <div className="case-admin-main">
                          <span className="case-admin-main__name">{legalCase.caseNumber}</span>
                          <span className="case-admin-main__sub">{legalCase.title}</span>
                        </div>
                      </td>
                      <td className="case-admin-cell case-admin-cell--main">
                        <div className="case-admin-main">
                          <span className="case-admin-main__name">{legalCase.clientName}</span>
                          <span className="case-admin-main__sub">{legalCase.lawyerName}</span>
                        </div>
                      </td>
                      <td className="case-admin-cell case-admin-cell--muted">
                        {legalCase.area}
                      </td>
                      <td className="case-admin-cell" style={{ textAlign: 'center' }}>
                        <span className={`cases-item__status is-${legalCase.status.toLowerCase()}`}>
                          {legalCase.status}
                        </span>
                      </td>
                      <td className="case-admin-cell case-admin-cell--actions">
                        <div className="case-actions">
                          <button
                            type="button"
                            className="case-action case-action--edit"
                            title="Editar expediente"
                            onClick={() => {
                              setShowNewCase(false);
                              setCaseToDelete(null);
                              setCaseToEdit({
                                ...legalCase,
                                clientId: legalCase.clientId,
                                lawyerId: legalCase.lawyerId,
                              });
                            }}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M4 17.25V20h2.75L18.81 7.94l-2.75-2.75L4 17.25Zm14.71-9.54a.996.996 0 0 0 0-1.41l-1.01-1.01a.996.996 0 1 0-1.41 1.41l1.01 1.01c.39.39 1.03.39 1.41 0Z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="case-action case-action--delete"
                            title="Eliminar expediente"
                            onClick={() => {
                              setShowNewCase(false);
                              setCaseToEdit(null);
                              setCaseToDelete(legalCase);
                            }}
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
          )}

          {currentUser?.role !== "sysadmin" && (
            <div className="cases-list">
              {filteredCases.map((legalCase) => (
                <CasesItem
                  key={legalCase.id}
                  id={legalCase.id}
                  caseNumber={legalCase.caseNumber}
                  title={legalCase.title}
                  clientName={legalCase.clientName}
                  lawyerName={legalCase.lawyerName}
                  clientId={legalCase.clientId}
                  lawyerId={legalCase.lawyerId}
                  area={legalCase.area}
                  status={legalCase.status}
                  startDate={legalCase.startDate}
                  lastUpdate={legalCase.lastUpdate}
                  description={legalCase.description}
                  notes={legalCase.notes}
                  currentUser={currentUser}
                  onEdit={(selectedCase) => {
                    setShowNewCase(false);
                    setCaseToDelete(null);
                    setCaseToEdit({
                      ...selectedCase,
                      clientId: selectedCase.clientId,
                      lawyerId: selectedCase.lawyerId,
                    });
                  }}
                  onDelete={(id) => {
                    const selectedCase = filteredCases.find(
                      (entry) => entry.id === id,
                    );
                    if (selectedCase) {
                      setShowNewCase(false);
                      setCaseToEdit(null);
                      setCaseToDelete(selectedCase);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="cases-empty">No se encontraron expedientes.</p>
      )}
    </section>
  );
};

export default CasesContainer;
