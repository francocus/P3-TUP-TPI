import { Form } from "react-bootstrap";

const UsersSearch = ({ onSearch }) => {
  return (
    <Form.Group controlId="searchUser">
      <Form.Control
        className="users-search"
        type="text"
        placeholder="Buscar usuario..."
        onChange={(event) => onSearch(event.target.value)}
      />
    </Form.Group>
  );
};

export default UsersSearch;
