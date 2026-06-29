export const getRoleClass = (role) => {
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

export const getActiveClass = (active) => (active ? 'is-active' : 'is-inactive');

export const getRoleLabel = (role) => {
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