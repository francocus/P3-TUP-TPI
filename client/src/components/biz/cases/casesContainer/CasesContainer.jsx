import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthenticationContext } from '../../../services/auth/authentication.context';
import { Alert, Button } from 'react-bootstrap';
import DeleteCaseModal from '../deleteCaseModal/DeleteCaseModal';
import CaseDetails from '../caseDetails/CaseDetails';
import NewCase from '../newCase/NewCase';
import CasesItem from '../casesItem/CasesItem';
import CasesSearch from '../casesSearch/CasesSearch';
import "../cases.css";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const buildHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const getErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.message || 'No se pudo completar la operacion.';
  } catch (_error) {
    return 'No se pudo completar la operacion.';
  }
};

const normalizeCaseEntry = (legalCase) => ({
  id: legalCase.id,
  caseNumber: legalCase.caseNumber ?? '',
  title: legalCase.title ?? '',
  area: legalCase.area ?? '',
  status: legalCase.status ?? 'activo',
  startDate: legalCase.startDate ?? '',
  lastUpdate: legalCase.lastUpdate ?? '',
  description: legalCase.description ?? '',
  notes: legalCase.notes ?? '',
  clientId: legalCase.clientId ?? legalCase.client?.id ?? '',
  lawyerId: legalCase.lawyerId ?? legalCase.lawyer?.id ?? '',
  clientName: legalCase.client?.name ?? 'Sin cliente',
  lawyerName: legalCase.lawyer?.name ?? 'Sin abogado',
});

const CasesContainer = () => {
  const { token, user: currentUser } = useContext(AuthenticationContext);
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchCase, setSearchCase] = useState('');
  const [showNewCase, setShowNewCase] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState(null);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const fetchUsers = async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: buildHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const data = await response.json();
    setUsers(data.users ?? []);
  };

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const loadCases = async () => {
      try {
        setLoading(true);
        setMessage('');
        await Promise.all([fetchCases(), fetchUsers()]);
      } catch (error) {
        setMessage(error.message || 'No se pudieron cargar los expedientes.');
      } finally {
        setLoading(false);
      }
    };

    loadCases();
    return undefined;
  }, [token]);

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
    setMessage('');
  };

  const handleAddCase = async (form) => {
    const payload = {
      ...form,
      clientId: Number(form.clientId),
      lawyerId: form.lawyerId ? Number(form.lawyerId) : Number(currentUser?.id),
    };

    const response = await fetch(`${API_URL}/cases`, {
      method: 'POST',
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
      method: 'PUT',
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
      method: 'DELETE',
      headers: buildHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await fetchCases();
    setCaseToDelete(null);
  };

  const filteredCases = useMemo(() => {
    const query = searchCase.trim().toLowerCase();

    return cases.filter((legalCase) => {
      const matchesQuery =
        legalCase.caseNumber.toLowerCase().includes(query) ||
        legalCase.title.toLowerCase().includes(query) ||
        legalCase.area.toLowerCase().includes(query) ||
        legalCase.clientName.toLowerCase().includes(query) ||
        legalCase.lawyerName.toLowerCase().includes(query) ||
        legalCase.status.toLowerCase().includes(query) ||
        legalCase.description.toLowerCase().includes(query) ||
        legalCase.notes.toLowerCase().includes(query);

      return matchesQuery;
    });
  }, [cases, searchCase]);

  const clients = useMemo(() => users.filter((userEntry) => userEntry.role === 'cliente'), [users]);
  const lawyers = useMemo(() => users.filter((userEntry) => userEntry.role === 'abogado'), [users]);

  return (
    <section className="cases-panel">
      <header className="cases-header">
        <div className="cases-header__copy">
          <h2>Gestion de Expedientes</h2>
          <p>Directorio global de expedientes y CRUD total de casos.</p>
        </div>

        <div className="cases-header__controls">
          <div className="cases-search-wrap">
            <CasesSearch onSearch={handleSearch} />
          </div>

          <Button
            type="button"
            className="cases-create"
            title="Crear expediente"
            aria-label="Crear expediente"
            onClick={handleOpenNewCase}
          >
            <span className="cases-create__text">Crear expediente</span>
          </Button>
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

      {caseToDelete ? (
        <DeleteCaseModal
          show={Boolean(caseToDelete)}
          legalCase={caseToDelete}
          onHide={() => setCaseToDelete(null)}
          onDeleteCase={handleDeleteCase}
        />
      ) : null}

      {loading ? (
        <p className="cases-empty">Cargando expedientes...</p>
      ) : filteredCases.length > 0 ? (
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
                const selectedCase = filteredCases.find((entry) => entry.id === id);
                if (selectedCase) {
                  setShowNewCase(false);
                  setCaseToEdit(null);
                  setCaseToDelete(selectedCase);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <p className="cases-empty">No se encontraron expedientes.</p>
      )}
    </section>
  );
};

export default CasesContainer;
