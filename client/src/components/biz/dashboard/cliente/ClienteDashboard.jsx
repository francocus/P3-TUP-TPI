import { useContext } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import "./cliente.css";
import AppointmentsContainer from "../../appointments/appointmentsContainer/AppointmentsContainer";
import CasesContainer from "../../cases/casesContainer/CasesContainer";

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { user, handleUserLogout } = useContext(AuthenticationContext);

  const handleLogout = (event) => {
    event.preventDefault();
    handleUserLogout();
    navigate("/login");
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <span className="dashboard-brand__mark">LM</span>
            <div>
              <p className="dashboard-eyebrow">Legal Manager</p>
              <h1>Mi panel</h1>
              {user?.name && <span className="dashboard-user">{user.name}</span>}
            </div>
          </div>

          <div className="dashboard-actions">
            <Button className="dashboard-logout" onClick={handleLogout}>
              Cerrar sesion
            </Button>
          </div>
        </header>

        <AppointmentsContainer />
        <CasesContainer />
      </section>
    </main>
  );
};

export default ClienteDashboard;
