import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);

// Proveedor que envuelve toda la app
export const AuthProvider = ({ children }) => {
  // Al iniciar, revisar si ya hay un usuario guardado en localStorage
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  // Función de login: llama al backend y guarda token + datos del usuario
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    // Guardar token y datos del usuario en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({
      idUsuario: data.idUsuario,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      idSucursal: data.idSucursal,
      nombreSucursal: data.nombreSucursal,
    }));

    // Actualizar el estado
    setUsuario({
      idUsuario: data.idUsuario,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      idSucursal: data.idSucursal,
      nombreSucursal: data.nombreSucursal,
    });

    return data;
  };

  // Función de logout: limpia todo y redirige al login
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // Verificar si el usuario tiene un rol específico
  const tieneRol = (roles) => {
    if (!usuario) return false;
    return roles.includes(usuario.rol);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
};
