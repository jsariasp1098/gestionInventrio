import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Compras from './pages/Compras';
import Traslados from './pages/Traslados';
import Sucursales from './pages/Sucursales';
import Usuarios from './pages/Usuarios';

// Ruta protegida: si no hay token, redirige al login
function RutaPrivada({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas dentro del Layout (Sidebar + contenido) */}
        <Route path="/" element={<RutaPrivada><Layout /></RutaPrivada>}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="compras" element={<Compras />} />
          <Route path="traslados" element={<Traslados />} />

          {/* Solo ADMINISTRADOR y DUEÑO */}
          <Route path="sucursales" element={
            <ProtectedRoute roles={['ADMINISTRADOR', 'DUEÑO']}>
              <Sucursales />
            </ProtectedRoute>
          } />
          <Route path="usuarios" element={
            <ProtectedRoute roles={['ADMINISTRADOR', 'DUEÑO']}>
              <Usuarios />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
