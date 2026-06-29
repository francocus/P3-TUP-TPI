import { useContext, useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { AuthenticationContext } from '../../../services/auth/authentication.context';
import DeleteModal from "../../../shared/deleteModal/DeleteModal.jsx";
import NewUser from '../newUser/NewUser';
import UserDetails from '../userDetails/UserDetails.jsx';
import UserItem from '../userItem/UserItem';
import UsersSearch from '../usersSearch/UsersSearch';
import '../users.css';
import { API_URL } from '../../../services/consts/apiConsts';

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

const UsersContainer = () => {
  const { token, user: currentUser } = useContext(AuthenticationContext);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showNewUser, setShowNewUser] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch(`${API_URL}/users`, {
        headers: buildHeaders(token),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();
      setUsers(data.users ?? []);
    } catch (error) {
      setMessage(error.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleSearch = (searchValue) => {
    setSearchUser(searchValue);
  };

  const handleOpenNewUser = () => {
    setUserToEdit(null);
    setUserToDelete(null);
    setShowNewUser(true);
  };

  const handleCloseForms = () => {
    setShowNewUser(false);
    setUserToEdit(null);
    setUserToDelete(null);
    setMessage("");
  };

  const handleAddUser = async (form) => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await fetchUsers();
    handleCloseForms();
  };

  const handleEditUser = async (form) => {
    const response = await fetch(`${API_URL}/users/${form.id}`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await fetchUsers();
    handleCloseForms();
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser?.id) {
      return;
    }

    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: buildHeaders(token),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    await fetchUsers();
    setUserToDelete(null);
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }
    const lowerSearch = searchUser.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
      (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
      (user.dni && String(user.dni).toLowerCase().includes(lowerSearch));
    return matchesSearch;
  });

  return (
    <section className="users-panel">
      <header className="users-header">
        <div className="users-header__copy">
          <p>Gestión de usuarios</p>
          <h2>Gestión de usuarios</h2>
        </div>

        <div className="users-header__controls">
          <select
            className="users-filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="cliente">Cliente</option>
            <option value="abogado">Abogado</option>
            <option value="sysadmin">Sys Admin</option>
          </select>

          <div className="users-search-wrap">
            <UsersSearch onSearch={handleSearch} />
          </div>

          <Button
            type="button"
            className="users-create"
            title="Crear usuario"
            aria-label="Crear usuario"
            onClick={handleOpenNewUser}
          >
            <span className="users-create__text">Crear usuario</span>
          </Button>
        </div>
      </header>

      {message && (
        <Alert className="users-alert" variant="danger">
          {message}
        </Alert>
      )}

      {showNewUser && (
        <NewUser onAddUser={handleAddUser} onFormClosed={handleCloseForms} />
      )}

      {userToEdit && (
        <UserDetails
          user={userToEdit}
          onEditUser={handleEditUser}
          onFormClosed={handleCloseForms}
        />
      )}

      {userToDelete && (
        <DeleteModal
          show={Boolean(userToDelete)}
          onHide={() => setUserToDelete(null)}
          onConfirm={() => handleDeleteUser(userToDelete.id)}
          title="Eliminar usuario"
          message="¿Estás seguro que deseas eliminar al usuario"
          itemName={userToDelete?.name}
          confirmLabel="Sí, deseo eliminarlo"
        />
      )}

      {loading ? (
        <p className="users-empty">Cargando usuarios...</p>
      ) : filteredUsers.length > 0 ? (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario / DNI</th>
                <th>Rol</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th className="users-table__actions-head">Acciones Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userEntry) => (
                <UserItem
                  key={userEntry.id}
                  id={userEntry.id}
                  name={userEntry.name}
                  dni={userEntry.dni}
                  email={userEntry.email}
                  role={userEntry.role}
                  active={userEntry.active}
                  isCurrentUser={userEntry.id === currentUser?.id}
                  onEdit={(selectedUser) => {
                    setShowNewUser(false);
                    setUserToDelete(null);
                    setUserToEdit(selectedUser);
                  }}
                  onDelete={(id) => {
                    const selectedUser = filteredUsers.find(
                      (entry) => entry.id === id,
                    );
                    if (selectedUser) {
                      setShowNewUser(false);
                      setUserToEdit(null);
                      setUserToDelete(selectedUser);
                    }
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="users-empty">No se encontraron usuarios.</p>
      )}
    </section>
  );
};

export default UsersContainer;
