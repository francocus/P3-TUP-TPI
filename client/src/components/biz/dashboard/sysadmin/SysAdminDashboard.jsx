import { useContext, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthenticationContext } from '../../../services/auth/authentication.context';
import './sysdamin.css';

const apiBaseUrl = 'http://localhost:4000/api/users';

const SysAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const { user: currentUser, token, handleUserLogout } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch(apiBaseUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setUsers(data.users ?? []))
      .catch((error) => console.log(error));
  }, [token]);

  const handleGoBack = () => {
    setShowForm(false);
    setUserToEdit(null);
  };

  const handleOpenForm = () => {
    setUserToEdit(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (selectedUser) => {
    setUserToEdit(selectedUser);
    setShowForm(true);
  };

  const handleAddUser = (form) => {
    fetch(apiBaseUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers((prevUsers) => [data.user, ...prevUsers]);
        setShowForm(false);
        setUserToEdit(null);
      })
      .catch((error) => console.log(error));
  };

  const handleEditUser = (form) => {
    fetch(`${apiBaseUrl}/${userToEdit.id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'PUT',
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers((prevUsers) =>
          prevUsers.map((currentUserItem) =>
            currentUserItem.id === userToEdit.id ? data.user : currentUserItem
          )
        );
        setShowForm(false);
        setUserToEdit(null);
      })
      .catch((error) => console.log(error));
  };

  const handleDeleteUser = (id) => {
    if (id === currentUser?.id) {
      return;
    }

    fetch(`${apiBaseUrl}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    })
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((currentUserItem) => currentUserItem.id !== id));
      })
      .catch((error) => console.log(error));
  };

  const handleLogout = () => {
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
              <h1>Panel SysAdmin</h1>
              <span className="dashboard-user">{currentUser?.name ?? 'Administrador General'}</span>
            </div>
          </div>

          <div className="dashboard-actions">
            <nav className="dashboard-nav" aria-label="Navegación del sysadmin">
              <NavLink
                to="."
                end
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="cases"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                Expedientes
              </NavLink>
              <NavLink
                to="appointments"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                Turnos
              </NavLink>
              <NavLink
                to="users"
                className={({ isActive }) =>
                  `dashboard-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                Usuarios
              </NavLink>
            </nav>

            <Button className="dashboard-logout" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </header>

        <Outlet
          context={{
            users,
            showForm,
            userToEdit,
            currentUser,
            handleOpenForm,
            handleOpenEditForm,
            handleGoBack,
            handleAddUser,
            handleEditUser,
            handleDeleteUser,
          }}
        />
      </section>
    </main>
  );
};

export default SysAdminDashboard;
