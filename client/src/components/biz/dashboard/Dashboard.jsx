import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useContext } from "react"
import AppointmentsContainer from "../appointmets/appointmentsContainer/AppointmentsContainer";
import "./dashboard.css";
import { AuthenticationContext } from '../../services/auth/authentication.context';


const Dashboard = () => {
  const navigate = useNavigate();

  const { user, handleUserLogout } = useContext(AuthenticationContext);
  
    const handleLogOut = (event) => {
      event.preventDefault();
      handleUserLogout();
      navigate('/login');
    };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <span className="dashboard-brand__mark">LM</span>
            <div>
              <p className="dashboard-eyebrow">Legal Manager</p>
              <h1>Panel de turnos</h1>
            </div>
          </div>

          <Button className="dashboard-logout" onClick={handleLogOut}>
            Cerrar sesion
          </Button>
        </header>

        <AppointmentsContainer />
      </section>
    </main>
  );
};

export default Dashboard;
