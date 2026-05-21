import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login/login';
import Dashboard from './components/biz/dashboard/Dashboard'; 
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
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
