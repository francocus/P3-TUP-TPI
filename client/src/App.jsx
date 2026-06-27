import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login/Login.jsx';
import Register from './components/auth/register/Register.jsx';
import ProtectedByRole from './components/routes/ProtectedByRole/ProtectedByRole.jsx';
import NotFound from './components/routes/notFound/notFound.jsx';
import { AuthenticationContext } from './components/services/auth/authentication.context';
import AppointmentsContainer from './components/biz/appointments/appointmentsContainer/AppointmentsContainer.jsx';
import CasesContainer from './components/biz/cases/casesContainer/CasesContainer.jsx';
import UsersContainer from './components/biz/users/usersContainer/UsersContainer.jsx';
import SysAdminDashboard from './components/biz/dashboard/sysadmin/SysAdminDashboard.jsx';
import LawyerDashboard from './components/biz/dashboard/lawyer/LawyerDashboard.jsx';
import ClientDashboard from './components/biz/dashboard/client/ClientDashboard.jsx';
import Dashboard from './components/biz/dashboard/Dashboard.jsx';

const dashboardByRole = {
  sysadmin: '/dashboard/sysadmin',
  abogado: '/dashboard/abogado',
  cliente: '/dashboard/cliente',
};

const DashboardRedirect = () => {
  const { user } = useContext(AuthenticationContext);

  return <Navigate to={dashboardByRole[user?.role] ?? '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedByRole>
              <DashboardRedirect />
            </ProtectedByRole>
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
          <Route index element={<Dashboard/>} />
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
          <Route index element={<Dashboard/>} />
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
          <Route index element={<Dashboard />} />
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
