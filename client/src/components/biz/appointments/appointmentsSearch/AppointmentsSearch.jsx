import { Form } from 'react-bootstrap';

const AppointmentsSearch = ({ onSearch }) => {
  return (
    <Form.Control
      className="appointments-search"
      type="text"
      placeholder="Buscar turno..."
      onChange={(event) => onSearch(event.target.value)}
    />
  );
};

export default AppointmentsSearch;
