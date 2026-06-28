// reemplazar todo el contenido de App.jsx

import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "./components/auth/login/Login.jsx";
import Register from "./components/auth/register/Register.jsx";
import ProtectedByRole from "./components/routes/protectedByRole/ProtectedByRole.jsx";
import NotFound from "./components/routes/notFound/NotFound.jsx";
import { AuthenticationContext } from "./components/services/auth/authentication.context";
import AppointmentsContainer from "./components/biz/appointments/appointmentsContainer/AppointmentsContainer.jsx";
import CasesContainer from "./components/biz/cases/casesContainer/CasesContainer.jsx";
import UsersContainer from "./components/biz/users/usersContainer/UsersContainer.jsx";
import SysAdminDashboard from "./components/biz/dashboard/sysadmin/SysAdminDashboard.jsx";
import LawyerDashboard from "./components/biz/dashboard/lawyer/LawyerDashboard.jsx";
import ClientDashboard from "./components/biz/dashboard/client/ClientDashboard.jsx";
import Dashboard from "./components/biz/dashboard/Dashboard.jsx";

const DashboardLayout = () => {
  const { user } = useContext(AuthenticationContext);
  if (user?.role === "sysadmin") return <SysAdminDashboard />;
  if (user?.role === "abogado") return <LawyerDashboard />;
  return <ClientDashboard />;
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
              <DashboardLayout />
            </ProtectedByRole>
          }
        >
          <Route index element={<Navigate to="calendar" replace />} />
          <Route path="calendar" element={<Dashboard />} />
          <Route path="appointments" element={<AppointmentsContainer />} />
          <Route path="cases" element={<CasesContainer />} />
          <Route
            path="users"
            element={
              <ProtectedByRole allowedRoles={["sysadmin"]}>
                <UsersContainer />
              </ProtectedByRole>
            }
          />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
