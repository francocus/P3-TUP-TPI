import { useContext } from "react";
import { Button } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../../services/auth/authentication.context";
import "./cliente.css";

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
            <nav className="dashboard-nav" aria-label="Navegación del cliente">
              <NavLink
                to="."
                end
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="appointments"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Mis Turnos
              </NavLink>
              <NavLink
                to="cases"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Mi Expediente
              </NavLink>
            </nav>

            <Button className="dashboard-logout" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  );
};

export default ClienteDashboard;
