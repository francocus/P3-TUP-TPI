const getStatusClass = (status = '') => {
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

const getStatusLabel = (status = '') => {
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

const CasesItem = ({
  id,
  caseNumber,
  title,
  clientName,
  lawyerName,
  clientId,
  lawyerId,
  area,
  status,
  startDate,
  lastUpdate,
  description,
  notes,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="cases-item">
      <div className="cases-item__header">
        <div>
          <span className="cases-item__label">Expediente</span>
          <h2 className="cases-item__title">{caseNumber}</h2>
        </div>

        <div className="cases-item__actions">
          <button
            className="cases-item__action cases-item__action--edit"
            type="button"
            title="Editar expediente"
            aria-label="Editar expediente"
            onClick={() =>
              onEdit?.({
                id,
                caseNumber,
                title,
                clientName,
                lawyerName,
                clientId,
                lawyerId,
                area,
                status,
                startDate,
                lastUpdate,
                description,
                notes,
              })
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 17.25V20h2.75L18.81 7.94l-2.75-2.75L4 17.25Zm14.71-9.54a.996.996 0 0 0 0-1.41l-1.01-1.01a.996.996 0 1 0-1.41 1.41l1.01 1.01c.39.39 1.03.39 1.41 0Z" />
            </svg>
          </button>

          <button
            className="cases-item__action cases-item__action--delete"
            type="button"
            title="Eliminar expediente"
            aria-label="Eliminar expediente"
            onClick={() => onDelete?.(id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 3.75h6l1 1.5H20v1.5H4v-1.5h4l1-1.5Zm1.5 5.25h1.5v7.5h-1.5v-7.5Zm4.5 0h1.5v7.5H15v-7.5Zm-8.25 0h1.5v7.5h-1.5v-7.5Zm1.5 11.25h9A1.75 1.75 0 0 0 19 18v-8.25H5V18c0 .97.78 1.75 1.75 1.75Z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="cases-item__subtitle">{title}</p>

      <div className="cases-item__meta">
        <span>Cliente: {clientName}</span>
        <span>Abogado: {lawyerName}</span>
        <span>Area: {area}</span>
      </div>

      <span className={`cases-item__status ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>

      <p className="cases-item__description">{description}</p>

      {notes ? <p className="cases-item__notes">{notes}</p> : null}

      <div className="cases-item__meta">
        <span>Inicio: {startDate}</span>
        <span>Actualizado: {lastUpdate}</span>
      </div>
    </article>
  );
};

export default CasesItem;
