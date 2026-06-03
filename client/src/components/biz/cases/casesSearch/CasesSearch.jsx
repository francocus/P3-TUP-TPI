import { Form } from "react-bootstrap"

const CasesSearch = ({ onSearch }) => {

    return (
        <Form.Group controlId="searchCase">
            <Form.Control
                className="cases-search"
                type="text"
                placeholder="Buscar expediente..."
                onChange={(event) => onSearch(event.target.value)} />
        </Form.Group>
    )
}

export default CasesSearch;
