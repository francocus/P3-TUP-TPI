import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login/login';
import Dashboard from './components/biz/dashboard/Dashboard'; 
import AppointmentsContainer from './components/biz/appointments/appointmentsContainer/AppointmentsContainer';
import CasesContainer from './components/biz/cases/casesContainer/CasesContainer';
import Protected from './components/routes/protected/Protected';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        >
          <Route index element={<Navigate to="appointments" replace />} />
          <Route path="appointments" element={<AppointmentsContainer />} />
          <Route path="cases" element={<CasesContainer />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
