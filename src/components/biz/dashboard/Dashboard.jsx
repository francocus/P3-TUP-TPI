import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AppointmentsContainer from "../appointmets/appointmentsContainer/AppointmentsContainer";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogOut = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
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
