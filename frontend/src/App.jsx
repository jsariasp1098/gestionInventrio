import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Componente temporal para la página principal (lo reemplazaremos en la siguiente fase)
function Home() {
  const { usuario, logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido, {usuario?.nombre}</h1>
        <p className="text-gray-500 mb-1">Rol: {usuario?.rol}</p>
        <p className="text-gray-500 mb-4">Sucursal ID: {usuario?.idSucursal}</p>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

// Ruta protegida: si no hay token, redirige al login
function RutaPrivada({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <RutaPrivada>
            <Home />
          </RutaPrivada>
        } />
      </Routes>
    </BrowserRouter>
  );
}
