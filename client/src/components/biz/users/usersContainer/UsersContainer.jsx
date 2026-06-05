import { useState } from "react";
import UsersSearch from "../usersSearch/UsersSearch";
import UserItem from "../userItem/UserItem";
import { USERS } from "../data/users";
import "../users.css";

const UsersContainer = () => {
  const [searchUser, setSearchUser] = useState("");

  const handleSearch = (searchValue) => {
    setSearchUser(searchValue);
  };

  const usersMapped = USERS
    .filter((user) =>
      user.name.toUpperCase().includes(searchUser.toUpperCase()) ||
      user.dni.toUpperCase().includes(searchUser.toUpperCase()) ||
      user.email.toUpperCase().includes(searchUser.toUpperCase()) ||
      user.role.toUpperCase().includes(searchUser.toUpperCase())
    )
    .map((user) => {
      return (
        <UserItem
          key={user.id}
          id={user.id}
          name={user.name}
          dni={user.dni}
          email={user.email}
          role={user.role}
          active={user.active}
        />
      );
    });

  return (
    <section className="users-panel">
      <header className="users-header">
        <div className="users-header__copy">
          <h2>Gestión de Usuarios</h2>
          <p>Directorio global de la plataforma y CRUD total de perfiles.</p>
        </div>

        <div className="users-header__controls">
          <select className="users-filter">
            <option>Todos los roles</option>
            <option>Cliente</option>
            <option>Abogado</option>
            <option>Sys Admin</option>
          </select>

          <div className="users-search-wrap">
            <UsersSearch onSearch={handleSearch} />
          </div>

          <button type="button" className="users-create" title="Crear perfil" aria-label="Crear perfil">
            +
          </button>
        </div>
      </header>

      {usersMapped.length > 0 ? (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario / DNI</th>
                <th>Rol</th>
                <th>Estudio Vinculado</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th className="users-table__actions-head">Acciones Admin</th>
              </tr>
            </thead>
            <tbody>{usersMapped}</tbody>
          </table>
        </div>
      ) : (
        <p className="users-empty">No se encontraron usuarios.</p>
      )}
    </section>
  );
};

export default UsersContainer;
