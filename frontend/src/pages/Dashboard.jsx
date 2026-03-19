import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  const esDueño = usuario?.rol === 'DUEÑO';

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setDatos(res.data))
      .catch((err) => {
        console.error('Error dashboard:', err.response || err);
        setError('Error al cargar las métricas');
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <p className="text-gray-500">Cargando métricas...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Función para formatear números como moneda colombiana
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tarjeta
          titulo="Ventas del Mes"
          valor={datos.totalVentasMes}
          subtitulo={formatearPrecio(datos.ingresoVentasMes)}
          color="bg-green-500"
        />
        <Tarjeta
          titulo="Compras del Mes"
          valor={datos.totalComprasMes}
          subtitulo={formatearPrecio(datos.gastoComprasMes)}
          color="bg-blue-500"
        />
        <Tarjeta
          titulo="Total Productos"
          valor={datos.totalProductos}
          subtitulo="Registrados en el sistema"
          color="bg-purple-500"
        />
        <Tarjeta
          titulo="Sucursales"
          valor={datos.totalSucursales}
          subtitulo="Activas"
          color="bg-orange-500"
        />
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Tarjeta
          titulo="Traslados Pendientes"
          valor={datos.trasladosPendientes}
          subtitulo="Por procesar"
          color="bg-yellow-500"
        />
        <Tarjeta
          titulo="Productos con Stock Bajo"
          valor={datos.productosStockBajo?.length || 0}
          subtitulo="Requieren atención"
          color="bg-red-500"
        />
      </div>

      {/* Tabla de productos con stock bajo */}
      {datos.productosStockBajo && datos.productosStockBajo.length > 0 && (() => {
        // Filtrar: DUEÑO ve todas las sucursales, los demás solo la suya
        console.log('Stock bajo:', datos.productosStockBajo);
        console.log('Usuario idSucursal:', usuario.idSucursal, typeof usuario.idSucursal);
        const productosFiltrados = esDueño
          ? datos.productosStockBajo
          : datos.productosStockBajo.filter((item) => Number(item.idSucursal) === Number(usuario.idSucursal));

        if (productosFiltrados.length === 0) return null;

        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Alertas de Stock Bajo</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left text-gray-600 text-sm uppercase">
                    <th className="pb-3 pr-4">Producto</th>
                    {esDueño && <th className="pb-3 pr-4">Sucursal</th>}
                    <th className="pb-3 pr-4 text-center">Stock Actual</th>
                    <th className="pb-3 text-center">Stock Mínimo</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  {productosFiltrados.map((item, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-800">{item.producto}</td>
                      {esDueño && <td className="py-3 pr-4 text-gray-600">{item.sucursal}</td>}
                      <td className="py-3 pr-4 text-center">
                        <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">
                          {item.stockActual}
                        </span>
                      </td>
                      <td className="py-3 text-center text-gray-500">{item.stockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Componente reutilizable para cada tarjeta de métrica
function Tarjeta({ titulo, valor, subtitulo, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl font-bold`}>
          {valor}
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{titulo}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>
        </div>
      </div>
    </div>
  );
}
