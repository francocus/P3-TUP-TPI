import { useContext } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../services/auth/authentication.context";
import ToggleTheme from "../../shared/toggleTheme/ToggleTheme.jsx";
import "./notFound.css";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthenticationContext);

  const handleGoBack = () => {
    const dashboardByRole = {
      sysadmin: "/dashboard/sysadmin",
      abogado: "/dashboard/abogado",
      cliente: "/dashboard/cliente",
    };

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    navigate(dashboardByRole[user?.role] ?? "/dashboard", { replace: true });
  };

  return (
    <main className="not-found">
      <div className="not-found-toggle-theme">
        <ToggleTheme />
      </div>
      <section className="not-found__panel">
        <p className="not-found__eyebrow">Legal Manager</p>
        <div className="not-found__code">404</div>
        <h1>La página solicitada no fue encontrada</h1>
        <p className="not-found__copy">
          La ruta que intentaste abrir no existe o no tenés acceso directo a ese
          contenido.
        </p>

        <div className="not-found__actions">
          <Button className="not-found__button" onClick={handleGoBack}>
            Volver a panel principal
          </Button>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
