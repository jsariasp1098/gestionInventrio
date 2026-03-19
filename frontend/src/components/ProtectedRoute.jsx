import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Si el usuario no tiene el rol necesario, lo redirige al Dashboard
export default function ProtectedRoute({ roles, children }) {
  const { tieneRol } = useAuth();

  if (!tieneRol(roles)) {
    return <Navigate to="/" />;
  }

  return children;
}
