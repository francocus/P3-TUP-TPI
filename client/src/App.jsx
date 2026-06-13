import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login/Login.jsx';
import Register from './components/auth/register/Register.jsx';
import Protected from './components/routes/protected/Protected.jsx';
import ProtectedByRole from './components/routes/ProtectedByRole/ProtectedByRole.jsx';
import NotFound from './components/routes/notFound/notFound.jsx';
import { AuthenticationContext } from './components/services/auth/authentication.context';
import AppointmentsContainer from './components/biz/appointments/appointmentsContainer/AppointmentsContainer.jsx';
import CasesContainer from './components/biz/cases/casesContainer/CasesContainer.jsx';
import UsersContainer from './components/biz/users/usersContainer/UsersContainer.jsx';
import SysAdminDashboard from './components/biz/dashboard/sysadmin/SysAdminDashboard.jsx';
import LawyerDashboard from './components/biz/dashboard/lawyer/LawyerDashboard.jsx';
import ClientDashboard from './components/biz/dashboard/client/ClientDashboard.jsx';

const dashboardByRole = {
  sysadmin: '/dashboard/sysadmin',
  abogado: '/dashboard/abogado',
  cliente: '/dashboard/cliente',
};

const DashboardRedirect = () => {
  const { user } = useContext(AuthenticationContext);

  return <Navigate to={dashboardByRole[user?.role] ?? '/login'} replace />;
};

const DashboardOverview = ({ eyebrow, title, description, cards }) => {
  return (
    <section className="dashboard-content">
      <div className="dashboard-overview">
        <div className="dashboard-overview__copy">
          <p className="dashboard-overview__eyebrow">{eyebrow}</p>
          <h2 className="dashboard-overview__title">{title}</h2>
          <p className="dashboard-overview__text">{description}</p>
        </div>

        <div className="dashboard-overview__grid">
          {cards.map((card) => (
            <article key={card.title} className="dashboard-overview__card">
              <span className="dashboard-overview__card-label">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const SysAdminOverview = () => (
  <DashboardOverview
    eyebrow="SISTEMA"
    title="Control global"
    description="Acceso total a usuarios, expedientes y turnos de toda la plataforma."
    cards={[
      {
        label: 'Usuarios',
        title: 'Gestión de perfiles',
        description: 'Alta, baja y edición de clientes, abogados y administradores.',
      },
      {
        label: 'Expedientes',
        title: 'Seguimiento centralizado',
        description: 'Control global del estado, responsables y trazabilidad.',
      },
      {
        label: 'Turnos',
        title: 'Agenda operativa',
        description: 'Visión completa de confirmados, pendientes y cancelados.',
      },
      {
        label: 'Auditoría',
        title: 'Actividad del sistema',
        description: 'Registro claro de cambios y movimientos administrativos.',
      },
    ]}
  />
);

const AbogadoOverview = () => (
  <DashboardOverview
    eyebrow="ESTUDIO JURÍDICO"
    title="Agenda y seguimiento"
    description="Visión rápida de la actividad diaria para atender turnos y expedientes en curso."
    cards={[
      {
        label: 'Turnos',
        title: 'Agenda del día',
        description: 'Revisión de consultas, confirmaciones y próximas atenciones.',
      },
      {
        label: 'Expedientes',
        title: 'Casos activos',
        description: 'Seguimiento de causas, avances y documentación asociada.',
      },
      {
        label: 'Clientes',
        title: 'Información vinculada',
        description: 'Acceso rápido a los datos de contacto y seguimiento de cada persona.',
      },
    ]}
  />
);

const ClienteOverview = () => (
  <DashboardOverview
    eyebrow="CLIENTE"
    title="Mi actividad"
    description="Acceso simple a los turnos asignados y al estado de mis expedientes."
    cards={[
      {
        label: 'Mis turnos',
        title: 'Próximas consultas',
        description: 'Fecha, hora y estado de cada turno desde un solo lugar.',
      },
      {
        label: 'Mi expediente',
        title: 'Seguimiento del caso',
        description: 'Consulta de avances, estado actual y observaciones del abogado.',
      },
      {
        label: 'Estado',
        title: 'Resumen personal',
        description: 'Todo lo importante, sin ruido visual y con lectura inmediata.',
      },
    ]}
  />
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardRedirect />
            </Protected>
          }
        />
        <Route
          path="/dashboard/sysadmin"
          element={
            <ProtectedByRole allowedRoles={['sysadmin']}>
              <SysAdminDashboard />
            </ProtectedByRole>
          }
        >
          <Route index element={<SysAdminOverview />} />
          <Route path="appointments" element={<AppointmentsContainer />} />
          <Route path="cases" element={<CasesContainer />} />
          <Route path="users" element={<UsersContainer />} />
        </Route>
        <Route
          path="/dashboard/abogado"
          element={
            <ProtectedByRole allowedRoles={['abogado']}>
              <LawyerDashboard />
            </ProtectedByRole>
          }
        >
          <Route index element={<AbogadoOverview />} />
          <Route path="appointments" element={<AppointmentsContainer />} />
          <Route path="cases" element={<CasesContainer />} />
        </Route>
        <Route
          path="/dashboard/cliente"
          element={
            <ProtectedByRole allowedRoles={['cliente']}>
              <ClientDashboard />
            </ProtectedByRole>
          }
        >
          <Route index element={<ClienteOverview />} />
          <Route path="appointments" element={<AppointmentsContainer />} />
          <Route path="cases" element={<CasesContainer />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
