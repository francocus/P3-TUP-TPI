import { useContext, useEffect } from "react";
import { Button } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import ToggleTheme from "../../../shared/toggleTheme/ToggleTheme.jsx";
import { Scale } from 'lucide-react';
import "../dashboard.css";

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const { user, handleUserLogout } = useContext(AuthenticationContext);

  useEffect(() => {
    document.documentElement.classList.add("dashboard-scroll-locked");
    document.body.classList.add("dashboard-scroll-locked");

    return () => {
      document.documentElement.classList.remove("dashboard-scroll-locked");
      document.body.classList.remove("dashboard-scroll-locked");
    };
  }, []);

  const handleLogout = (event) => {
    event.preventDefault();
    handleUserLogout();
    navigate("/login");
  };

  return (
    <main className="dashboard-shell dashboard-shell--locked">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <span className="dashboard-brand__mark">
              <Scale size={20} />
            </span>
            <div>
              <p className="dashboard-eyebrow">Panel del estudio</p>
              <h1>Legal Manager</h1>
              {user?.name && (
                <span className="dashboard-user">{user.name}</span>
              )}
            </div>
          </div>

          <div className="dashboard-actions">
            <nav className="dashboard-nav" aria-label="Navegación del abogado">
              <NavLink
                to="/dashboard/calendar"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Calendario
              </NavLink>
              <NavLink
                to="/dashboard/appointments"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Turnos
              </NavLink>
              <NavLink
                to="/dashboard/cases"
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
