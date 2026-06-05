const getRoleClass = (role) => {
  switch (role) {
    case "sysadmin":
      return "is-sysadmin";
    case "abogado":
      return "is-abogado";
    case "cliente":
      return "is-cliente";
    default:
      return "";
  }
};

const getActiveClass = (active) => (active ? "is-active" : "is-inactive");

const getRoleLabel = (role) => {
  switch (role) {
    case "sysadmin":
      return "Sys Admin";
    case "abogado":
      return "Abogado";
    case "cliente":
      return "Cliente";
    default:
      return role;
  }
};

const UserItem = ({ id, name, dni, email, role, active }) => {
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

      <td className="user-cell user-cell--muted">
        <span className="user-estudio">{role === "sysadmin" ? "GLOBAL" : "Smith & Co."}</span>
      </td>

      <td className="user-cell user-cell--muted">{email}</td>

      <td className="user-cell">
        <span className={`user-chip user-chip--status ${getActiveClass(active)}`}>
          {active ? "activo" : "inactivo"}
        </span>
      </td>

      <td className="user-cell user-cell--actions">
        <div className="user-actions">
          <button className="user-action user-action--edit" type="button" title="Editar usuario" aria-label="Editar usuario">
            ✎
          </button>
          <button className="user-action user-action--delete" type="button" title="Eliminar usuario" aria-label="Eliminar usuario">
            ⌫
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserItem;
