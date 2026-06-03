const getStatusClass = (status) => {
  const normalizedStatus = status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  switch (normalizedStatus) {
    case "confirmado":
      return "is-confirmed";
    case "pendiente":
      return "is-pending";
    case "cancelado":
    case "canceled":
      return "is-cancelled";
    case "finalizado":
    case "completado":
      return "is-finished";
    default:
      return "";
  }
};

const AppointmentItem = ({
  clientName,
  lawyerName,
  date,
  time,
  reason,
  status,
  notes,
}) => {
  return (
    <div className="appointment-item">
      <div>
        <span className="appointment-item__label">Cliente</span>
        <h2>{clientName}</h2>
      </div>
      <span className={`appointment-item__status ${getStatusClass(status)}`}>{status}</span>
      <p>{lawyerName}</p>
      <p>{date} - {time}</p>
      <p>{reason}</p>
      <p>{notes}</p>
    </div>
  );
};

export default AppointmentItem;
