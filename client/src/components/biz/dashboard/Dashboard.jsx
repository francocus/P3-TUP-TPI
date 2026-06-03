import { useNavigate } from "react-router-dom";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useContext } from "react";
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
              <h1>Panel operativo</h1>
              {user?.name && <span className="dashboard-user">{user.name}</span>}
            </div>
          </div>

          <div className="dashboard-actions">
            <nav className="dashboard-nav" aria-label="Secciones del dashboard">
              <NavLink
                to="/dashboard/appointments"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                Turnos
              </NavLink>
              <NavLink
                to="/dashboard/cases"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                Expedientes
              </NavLink>
            </nav>

            <Button className="dashboard-logout" onClick={handleLogOut}>
              Cerrar sesion
            </Button>
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  );
};

export default Dashboard;
