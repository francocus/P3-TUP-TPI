export const getStatusClass = (status = '') => {
  const normalizedStatus = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');

  switch (normalizedStatus) {
    case 'activo':
    case 'abierto':
      return 'is-active';
    case 'pendiente':
      return 'is-pending';
    case 'cerrado':
    case 'finalizado':
    case 'archivado':
      return 'is-closed';
    case 'cancelado':
    case 'canceled':
      return 'is-cancelled';
    default:
      return '';
  }
};

export const getStatusLabel = (status = '') => {
  const normalizedStatus = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');

  switch (normalizedStatus) {
    case 'activo':
    case 'abierto':
      return 'Activo';
    case 'pendiente':
      return 'Pendiente';
    case 'cerrado':
    case 'finalizado':
      return 'Cerrado';
    case 'archivado':
      return 'Archivado';
    case 'cancelado':
    case 'canceled':
      return 'Cancelado';
    default:
      return status;
  }
};