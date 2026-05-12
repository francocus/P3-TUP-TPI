import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/components/login/login';
import Dashboard from './features/dashboard/components/Dashboard'; 
import ProtectedRoute from './routes/protected/Protected';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
