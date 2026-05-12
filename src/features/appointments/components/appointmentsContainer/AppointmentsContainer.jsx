import { useState } from "react";
import AppointmentsSearch from "../appointmentsSearch/AppointmentsSearch";
import AppointmentItem from "../appointmentItem/appointmentItem";
import { APPOINTMENTS } from "../../data/appointments";

const AppointmentsContainer = () => {
  const [searchAppointment, setSearchAppointment] = useState("");

  const handleSearch = (searchValue) => {
    setSearchAppointment(searchValue);
  };

  const appointmentsMapped = APPOINTMENTS
    .filter((appointment) =>
      appointment.clientName.toUpperCase().includes(searchAppointment.toUpperCase())
    )
    .map((appointment) => {
      return (
        <AppointmentItem
          key={appointment.id}
          id={appointment.id}
          clientName={appointment.clientName}
          lawyerName={appointment.lawyerName}
          date={appointment.date}
          time={appointment.time}
          reason={appointment.reason}
          status={appointment.status}
          notes={appointment.notes}
        />
      );
    });

  return (
    <section className="appointments-panel">
      <AppointmentsSearch onSearch={handleSearch} />
      {appointmentsMapped.length > 0 ? (
        <div className="appointments-list">{appointmentsMapped}</div>
      ) : (
        <p className="appointments-empty">No se encontraron turnos</p>
      )}
    </section>
  );
};

export default AppointmentsContainer;
