import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORES_PIE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  const esDueño = usuario?.rol === 'DUEÑO';

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/ventas'),
      api.get('/compras'),
      api.get('/inventario'),
    ])
      .then(([resDash, resVentas, resCompras, resInv]) => {
        setDatos(resDash.data);
        setVentas(resVentas.data);
        setCompras(resCompras.data);
        setInventario(resInv.data);
      })
      .catch((err) => {
        console.error('Error dashboard:', err.response || err);
        setError('Error al cargar las métricas');
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="text-gray-500">Cargando métricas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const formatearPrecio = (valor) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  // --- Datos para gráfica de barras: Ventas vs Compras por mes ---
  const construirDatosMensuales = () => {
    const meses = {};
    ventas.forEach((v) => {
      const mes = String(v.fechaVenta).substring(0, 7);
      if (!meses[mes]) meses[mes] = { mes, ventas: 0, compras: 0 };
      meses[mes].ventas += v.total || 0;
    });
    compras.forEach((c) => {
      const mes = String(c.fechaCompra).substring(0, 7);
      if (!meses[mes]) meses[mes] = { mes, ventas: 0, compras: 0 };
      meses[mes].compras += c.total || 0;
    });
    return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);
  };

  // --- Datos para gráfica de pie: stock por sucursal ---
  const construirStockPorSucursal = () => {
    const porSucursal = {};
    inventario.forEach((item) => {
      const nombre = item.sucursal || 'Sin sucursal';
      if (!porSucursal[nombre]) porSucursal[nombre] = 0;
      porSucursal[nombre] += item.stockActual || 0;
    });
    return Object.entries(porSucursal).map(([name, value]) => ({ name, value }));
  };

  const datosMensuales = construirDatosMensuales();
  const stockPorSucursal = construirStockPorSucursal();

  const productosFiltrados = datos.productosStockBajo
    ? (esDueño ? datos.productosStockBajo : datos.productosStockBajo.filter((item) => Number(item.idSucursal) === Number(usuario.idSucursal)))
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tarjeta titulo="Ventas del Mes" valor={datos.totalVentasMes} subtitulo={formatearPrecio(datos.ingresoVentasMes || 0)} color="bg-green-500" icono="$" />
        <Tarjeta titulo="Compras del Mes" valor={datos.totalComprasMes} subtitulo={formatearPrecio(datos.gastoComprasMes || 0)} color="bg-blue-500" icono="C" />
        <Tarjeta titulo="Total Productos" valor={datos.totalProductos} subtitulo="Registrados" color="bg-purple-500" icono="P" />
        <Tarjeta titulo="Sucursales" valor={datos.totalSucursales} subtitulo="Activas" color="bg-orange-500" icono="S" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Tarjeta titulo="Traslados Pendientes" valor={datos.trasladosPendientes} subtitulo="Por procesar" color="bg-yellow-500" icono="T" />
        <Tarjeta titulo="Stock Bajo" valor={productosFiltrados.length} subtitulo="Requieren atención" color="bg-red-500" icono="!" />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfica de barras: Ventas vs Compras */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ventas vs Compras (mensual)</h2>
          {datosMensuales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosMensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatearPrecio(value)} />
                <Legend />
                <Bar dataKey="ventas" fill="#10b981" name="Ventas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compras" fill="#3b82f6" name="Compras" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Sin datos de ventas o compras</p>
          )}
        </div>

        {/* Gráfica de pie: Stock por sucursal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Stock por Sucursal</h2>
          {stockPorSucursal.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockPorSucursal}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {stockPorSucursal.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} unidades`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Sin datos de inventario</p>
          )}
        </div>
      </div>

      {/* Tabla de productos con stock bajo */}
      {productosFiltrados.length > 0 && (
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
                      <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">{item.stockActual}</span>
                    </td>
                    <td className="py-3 text-center text-gray-500">{item.stockMinimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Tarjeta({ titulo, valor, subtitulo, color, icono }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl font-bold shrink-0`}>
          {icono || valor}
        </div>
        <div className="ml-4">
          <p className="text-2xl font-bold text-gray-800">{valor}</p>
          <p className="text-sm text-gray-500">{titulo}</p>
          <p className="text-xs text-gray-400">{subtitulo}</p>
        </div>
      </div>
    </div>
  );
}
