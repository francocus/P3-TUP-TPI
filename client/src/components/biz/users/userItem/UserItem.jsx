const getRoleClass = (role) => {
  switch (role) {
    case 'sysadmin':
      return 'is-sysadmin';
    case 'abogado':
      return 'is-abogado';
    case 'cliente':
      return 'is-cliente';
    default:
      return '';
  }
};

const getActiveClass = (active) => (active ? 'is-active' : 'is-inactive');

const getRoleLabel = (role) => {
  switch (role) {
    case 'sysadmin':
      return 'Sys Admin';
    case 'abogado':
      return 'Abogado';
    case 'cliente':
      return 'Cliente';
    default:
      return role;
  }
};

const UserItem = ({ id, name, dni, email, role, active, onEdit, onDelete, isCurrentUser }) => {
  return (
    <tr className="user-row">
      <td className="user-cell user-cell--main">
        <div className="user-main">
          <span className="user-main__name">{name}</span>
          <span className="user-main__dni">DNI: {dni}</span>
        </div>
      </td>

      <td className="user-cell">
        <span className={`user-chip user-chip--role ${getRoleClass(role)}`}>
          {getRoleLabel(role)}
        </span>
      </td>

      <td className="user-cell user-cell--muted">{email}</td>

      <td className="user-cell">
        <span className={`user-chip user-chip--status ${getActiveClass(active)}`}>
          {active ? 'activo' : 'inactivo'}
        </span>
      </td>

      <td className="user-cell user-cell--actions">
        <div className="user-actions">
          <button
            className="user-action user-action--edit"
            type="button"
            title="Editar usuario"
            aria-label="Editar usuario"
            onClick={() => onEdit?.({ id, name, dni, email, role, active })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 17.25V20h2.75L18.81 7.94l-2.75-2.75L4 17.25Zm14.71-9.54a.996.996 0 0 0 0-1.41l-1.01-1.01a.996.996 0 1 0-1.41 1.41l1.01 1.01c.39.39 1.03.39 1.41 0Z" />
            </svg>
          </button>
          <button
            className="user-action user-action--delete"
            type="button"
            title={isCurrentUser ? 'No puedes eliminar tu propio usuario' : 'Eliminar usuario'}
            aria-label="Eliminar usuario"
            onClick={() => onDelete?.(id)}
            disabled={isCurrentUser}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 3.75h6l1 1.5H20v1.5H4v-1.5h4l1-1.5Zm1.5 5.25h1.5v7.5h-1.5v-7.5Zm4.5 0h1.5v7.5H15v-7.5Zm-8.25 0h1.5v7.5h-1.5v-7.5Zm1.5 11.25h9A1.75 1.75 0 0 0 19 18v-8.25H5V18c0 .97.78 1.75 1.75 1.75Z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserItem;
