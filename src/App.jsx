import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/login'; // La ruta que mencionaste

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Definimos que la ruta /login cargue el componente Login */}
        <Route path="/login" element={<Login />} />

        {/* Opcional: Redirigir la raíz (/) al login por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;