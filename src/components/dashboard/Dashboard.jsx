import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap";
const Dashboard = () => {
    const navigate = useNavigate('');

    const handleLogOut = (e) => {
        e.preventDefault();
        navigate('/login');
    };
  return (
    <>
        <Button variant="primary" onClick={handleLogOut}>Cerrar sesión</Button>

    </>
  )
}

export default Dashboard;