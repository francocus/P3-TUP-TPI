import { useContext } from "react";
import { Button } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import ToggleTheme from "../../../shared/toggleTheme/ToggleTheme.jsx";
import "../dashboard.css";

const LawyerDashboard = () => {
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
              <p className="dashboard-eyebrow">Panel del estudio</p>
              <h1>Legal Manager</h1>
              {user?.name && <span className="dashboard-user">{user.name}</span>}
            </div>
          </div>

          <div className="dashboard-actions">
            <nav className="dashboard-nav" aria-label="Navegación del abogado">
              <NavLink
                to="."
                end
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Calendario
              </NavLink>
              <NavLink
                to="appointments"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Turnos
              </NavLink>
              <NavLink
                to="cases"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Expedientes
              </NavLink>
            </nav>

            <Button className="dashboard-logout" onClick={handleLogout}>
              Cerrar sesión
            </Button>
            <ToggleTheme />
          </div>

        </header>

        <Outlet />
      </section>
    </main>
  );
};

export default LawyerDashboard;