import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login'; // La ruta que mencionaste
import Dashboard from './components/dashboard/Dashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Definimos que la ruta /login cargue el componente Login */}
        <Route path="/login" element={<Login />} />
        {/* Opcional: Redirigir la raíz (/) al login por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;