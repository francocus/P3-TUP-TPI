import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { AuthenticationContext } from '../services/auth/authentication.context';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, handleUserLogout } = useContext(AuthenticationContext);

  const handleLogOut = (event) => {
    event.preventDefault();
    handleUserLogout();
    navigate('/login');
  };

  return (
    <>
      <p>Sesion iniciada como: {user?.name || user?.email || 'Usuario'}</p>
      <Button variant="primary" onClick={handleLogOut}>
        Cerrar sesion
      </Button>
    </>
  );
};

export default Dashboard;
