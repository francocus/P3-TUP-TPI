import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import UsersSearch from '../usersSearch/UsersSearch';
import UserItem from '../userItem/UserItem';
import NewUser from '../newUser/NewUser';
import '../users.css';

const UsersContainer = () => {
  const [searchUser, setSearchUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const {
    users = [],
    showForm,
    userToEdit,
    currentUser,
    handleOpenForm,
    handleOpenEditForm,
    handleGoBack,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
  } = useOutletContext() || {};

  useEffect(() => {
    document.body.classList.toggle('users-modal-open', Boolean(showForm));

    return () => {
      document.body.classList.remove('users-modal-open');
    };
  }, [showForm]);

  const filteredUsers = useMemo(() => {
    const searchValue = searchUser.toUpperCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toUpperCase().includes(searchValue) ||
        user.dni.toUpperCase().includes(searchValue) ||
        user.email.toUpperCase().includes(searchValue) ||
        user.role.toUpperCase().includes(searchValue);

      const matchesRole = selectedRole === 'all' || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [searchUser, selectedRole, users]);

  const handleSearch = (searchValue) => {
    setSearchUser(searchValue);
  };

  const modalTitle = userToEdit ? 'Editar usuario' : 'Nuevo usuario';

  return (
    <section className="users-panel">
      <header className="users-header">
        <div className="users-header__copy">
          <h2>Gestión de Usuarios</h2>
          <p>Directorio global de la plataforma y CRUD total de perfiles.</p>
        </div>

        <div className="users-header__controls">
          <select
            className="users-filter"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="cliente">Cliente</option>
            <option value="abogado">Abogado</option>
            <option value="sysadmin">Sys Admin</option>
          </select>

          <div className="users-search-wrap">
            <UsersSearch onSearch={handleSearch} />
          </div>

          <button
            type="button"
            className="users-create"
            title="Crear perfil"
            aria-label="Crear perfil"
            onClick={handleOpenForm}
          >
            +
          </button>
        </div>
      </header>

      <div className="users-table-column">
        {filteredUsers.length > 0 ? (
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
                {filteredUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    id={user.id}
                    name={user.name}
                    dni={user.dni}
                    email={user.email}
                    role={user.role}
                    active={user.active}
                    isSelected={showForm && userToEdit?.id === user.id}
                    canDelete={currentUser?.id !== user.id}
                    onEdit={handleOpenEditForm}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="users-empty">No se encontraron usuarios.</p>
        )}
      </div>

      {showForm && (
        <div className="users-modal" role="presentation" onClick={handleGoBack}>
          <div
            className="users-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="users-modal__header">
              <div>
                <p className="users-modal__eyebrow">Administración de usuarios</p>
                <h3 id="users-modal-title">{modalTitle}</h3>
                <p className="users-modal__subtitle">
                  {userToEdit
                    ? `Perfil seleccionado: ${userToEdit.name}`
                    : 'Completa los datos para crear un nuevo perfil.'}
                </p>
              </div>

              <button
                type="button"
                className="users-modal__close"
                aria-label="Cerrar formulario"
                onClick={handleGoBack}
              >
                ×
              </button>
            </div>

            <div className="users-modal__body">
              <NewUser
                key={userToEdit?.id ?? 'new-user-form'}
                user={userToEdit}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onFormClosed={handleGoBack}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsersContainer;
