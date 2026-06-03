const getStatusClass = (status) => {
    const normalizedStatus = status
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-");

    switch (normalizedStatus) {
        case "activo":
        case "abierto":
            return "is-active";
        case "pendiente":
            return "is-pending";
        case "cerrado":
        case "finalizado":
        case "archivado":
            return "is-closed";
        case "cancelado":
        case "canceled":
            return "is-cancelled";
        default:
            return "";
    }
};

const CasesItem = ({
    caseNumber,
    title,
    clientName,
    lawyerName,
    type,
    status,
    startDate,
    lastUpdate,
    description,
}) => {
    return (
        <div className="cases-item">
            <div>
                <span className="cases-item__label">Expediente</span>
                <h2>{caseNumber}</h2>
            </div>

            <p>{title}</p>
            <p>{clientName}</p>
            <p>{lawyerName}</p>
            <p>{type}</p>
            <span className={`cases-item__status ${getStatusClass(status)}`}>{status}</span>
            <p>{startDate}</p>
            <p>{lastUpdate}</p>
            <p>{description}</p>
        </div>
    );
};

export default CasesItem;
