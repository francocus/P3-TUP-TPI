import { Form } from "react-bootstrap";

const CasesSearch = ({ onSearch }) => {
  return (
    <Form.Control
      className="cases-search"
      type="text"
      placeholder="Buscar expediente..."
      onChange={(event) => onSearch(event.target.value)}
    />
  );
};

export default CasesSearch;
