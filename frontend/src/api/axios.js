import axios from 'axios';

// Crear instancia de Axios con la URL base del backend
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

// Interceptor: antes de cada petición, agrega el token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si el backend responde 401 (no autorizado), redirigir al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
