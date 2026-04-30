import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/login';
import Dashboard from './components/dashboard/Dashboard'; 
import ProtectedRoute from './components/protected-routes/ProtectedRoute';

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