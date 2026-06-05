import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login/login';
import Protected from './components/routes/protected/Protected';
import ProtectedByRole from './components/routes/protectedByRole/ProtectedByRole';
import NotFound from './components/routes/notFound/notFound';
import { AuthenticationContext } from './components/services/auth/authentication.context';
import SysAdminDashboard from './components/biz/dashboard/sysadmin/SysAdminDashboard';
import AbogadoDashboard from './components/biz/dashboard/abogado/AbogadoDashboard';
import ClienteDashboard from './components/biz/dashboard/cliente/ClienteDashboard';

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
        />
        <Route
          path="/dashboard/abogado"
          element={
            <ProtectedByRole allowedRoles={['abogado']}>
              <AbogadoDashboard />
            </ProtectedByRole>
          }
        />
        <Route
          path="/dashboard/cliente"
          element={
            <ProtectedByRole allowedRoles={['cliente']}>
              <ClienteDashboard />
            </ProtectedByRole>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
