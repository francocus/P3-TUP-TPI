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
      <span className="appointment-item__status">{status}</span>
      <p>{lawyerName}</p>
      <p>{date} - {time}</p>
      <p>{reason}</p>
      <p>{notes}</p>
    </div>
  );
};

export default AppointmentItem;
