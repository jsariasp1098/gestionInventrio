import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { usuario, logout, tieneRol } = useAuth();

  // Definir las opciones del menú con los roles que pueden verlas
  const menuItems = [
    { nombre: 'Dashboard',  ruta: '/',           roles: ['ADMINISTRADOR', 'VENDEDOR', 'DUEÑO'] },
    { nombre: 'Productos',  ruta: '/productos',  roles: ['ADMINISTRADOR', 'DUEÑO'] },
    { nombre: 'Inventario', ruta: '/inventario',  roles: ['ADMINISTRADOR', 'VENDEDOR', 'DUEÑO'] },
    { nombre: 'Ventas',     ruta: '/ventas',      roles: ['ADMINISTRADOR', 'VENDEDOR', 'DUEÑO'] },
    { nombre: 'Compras',    ruta: '/compras',     roles: ['ADMINISTRADOR', 'DUEÑO'] },
    { nombre: 'Traslados',  ruta: '/traslados',   roles: ['ADMINISTRADOR', 'VENDEDOR', 'DUEÑO'] },
    { nombre: 'Sucursales', ruta: '/sucursales',  roles: ['DUEÑO'] },
    { nombre: 'Usuarios',   ruta: '/usuarios',    roles: ['ADMINISTRADOR', 'DUEÑO'] },
  ];

  // Filtrar opciones según el rol del usuario actual
  const menuVisible = menuItems.filter((item) => tieneRol(item.roles));

  // Estilos para el link activo vs inactivo
  const linkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded transition-colors ${
      isActive
        ? 'bg-orange-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-gray-800 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">OptiPlant</h1>
        <p className="text-sm text-gray-400">Gestión de Inventario</p>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {menuVisible.map((item) => (
          <NavLink key={item.ruta} to={item.ruta} end={item.ruta === '/'} className={linkClasses}>
            {item.nombre}
          </NavLink>
        ))}
      </nav>

      {/* Info del usuario + botón logout */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm text-white font-medium">{usuario?.nombre}</p>
        <p className="text-xs text-gray-400">{usuario?.rol}</p>
        <button
          onClick={logout}
          className="mt-3 w-full text-sm bg-orange-700 text-white py-2 rounded hover:bg-orange-800 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
