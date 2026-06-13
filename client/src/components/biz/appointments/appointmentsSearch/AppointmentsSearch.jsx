import { Form } from 'react-bootstrap';

const AppointmentsSearch = ({ onSearch }) => {
  return (
    <Form.Group controlId="searchAppointment">
      <Form.Control
        className="appointments-search"
        type="text"
        placeholder="Buscar turno..."
        onChange={(event) => onSearch(event.target.value)}
      />
    </Form.Group>
  );
};

export default AppointmentsSearch;
