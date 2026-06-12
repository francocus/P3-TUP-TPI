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

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l8.84-8.84.92.92-8.84 8.84zM20.71 7.04a1 1 0 0 0 0-1.42l-2.33-2.33a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3.75A1.75 1.75 0 0 1 10.75 2h2.5A1.75 1.75 0 0 1 15 3.75V4h4a1 1 0 1 1 0 2h-1.06l-.8 11.2A2.75 2.75 0 0 1 14.39 20H9.61a2.75 2.75 0 0 1-2.75-2.8L6.06 6H5a1 1 0 1 1 0-2h4v-.25zM11 4h2v-.25a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25V4zm-1.93 2 .73 10.2c.02.4.35.71.75.71h3.9c.4 0 .73-.31.75-.7L15.93 6H9.07z" />
  </svg>
);

const UserItem = ({
  id,
  name,
  dni,
  email,
  role,
  active,
  isSelected,
  canDelete = true,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className={`user-row${isSelected ? ' is-selected' : ''}`}>
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
          {active ? 'Activo' : 'Inactivo'}
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
            <EditIcon />
          </button>
          <button
            className="user-action user-action--delete"
            type="button"
            title="Eliminar usuario"
            aria-label="Eliminar usuario"
            onClick={() => canDelete && onDelete?.(id)}
            disabled={!canDelete}
          >
            <DeleteIcon />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserItem;
