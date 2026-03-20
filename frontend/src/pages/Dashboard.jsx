import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORES_PIE = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#9a3412'];

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  const esDueño = usuario?.rol === 'DUEÑO';
  const miSucursal = usuario?.nombreSucursal;

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

  // --- Filtrar por sucursal si no es DUEÑO ---
  const ventasFiltradas = esDueño ? ventas : ventas.filter((v) => v.sucursal === miSucursal);
  const comprasFiltradas = esDueño ? compras : compras.filter((c) => c.sucursal === miSucursal);
  const inventarioFiltrado = esDueño ? inventario : inventario.filter((i) => Number(i.idSucursal) === Number(usuario.idSucursal));

  // --- Métricas calculadas desde datos filtrados ---
  const mesActual = new Date().toISOString().substring(0, 7);
  const ventasDelMes = ventasFiltradas.filter((v) => String(v.fechaVenta).startsWith(mesActual));
  const comprasDelMes = comprasFiltradas.filter((c) => String(c.fechaCompra).startsWith(mesActual));
  const totalVentasMes = ventasDelMes.length;
  const ingresoVentasMes = ventasDelMes.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalComprasMes = comprasDelMes.length;
  const gastoComprasMes = comprasDelMes.reduce((sum, c) => sum + (c.total || 0), 0);

  // --- Datos para gráfica de barras: Ventas vs Compras por mes ---
  const construirDatosMensuales = () => {
    const meses = {};
    ventasFiltradas.forEach((v) => {
      const mes = String(v.fechaVenta).substring(0, 7);
      if (!meses[mes]) meses[mes] = { mes, ventas: 0, compras: 0 };
      meses[mes].ventas += v.total || 0;
    });
    comprasFiltradas.forEach((c) => {
      const mes = String(c.fechaCompra).substring(0, 7);
      if (!meses[mes]) meses[mes] = { mes, ventas: 0, compras: 0 };
      meses[mes].compras += c.total || 0;
    });
    return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);
  };

  // --- DUEÑO: stock por sucursal (pie) | Otros: stock por producto (barras horizontales) ---
  const construirStockPorSucursal = () => {
    const porSucursal = {};
    inventario.forEach((item) => {
      const nombre = item.sucursal || 'Sin sucursal';
      if (!porSucursal[nombre]) porSucursal[nombre] = 0;
      porSucursal[nombre] += item.stockActual || 0;
    });
    return Object.entries(porSucursal).map(([name, value]) => ({ name, value }));
  };

  const construirStockPorProducto = () => {
    return inventarioFiltrado
      .map((item) => ({ name: item.producto, stock: item.stockActual, minimo: item.stockMinimo }))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);
  };

  const datosMensuales = construirDatosMensuales();
  const stockPorSucursal = esDueño ? construirStockPorSucursal() : [];
  const stockPorProducto = !esDueño ? construirStockPorProducto() : [];

  const productosFiltrados = datos.productosStockBajo
    ? (esDueño ? datos.productosStockBajo : datos.productosStockBajo.filter((item) => Number(item.idSucursal) === Number(usuario.idSucursal)))
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {!esDueño && (
          <p className="text-sm text-orange-600 font-medium mt-1">Sucursal: {miSucursal}</p>
        )}
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tarjeta titulo="Ventas del Mes" valor={totalVentasMes} subtitulo={formatearPrecio(ingresoVentasMes)} color="bg-orange-500" icono="$" />
        <Tarjeta titulo="Compras del Mes" valor={totalComprasMes} subtitulo={formatearPrecio(gastoComprasMes)} color="bg-orange-600" icono="C" />
        <Tarjeta titulo={esDueño ? 'Total Productos' : 'Productos en Sucursal'} valor={esDueño ? datos.totalProductos : inventarioFiltrado.length} subtitulo={esDueño ? 'Registrados' : 'En inventario'} color="bg-orange-700" icono="P" />
        {esDueño
          ? <Tarjeta titulo="Sucursales" valor={datos.totalSucursales} subtitulo="Activas" color="bg-orange-800" icono="S" />
          : <Tarjeta titulo="Total Stock" valor={inventarioFiltrado.reduce((s, i) => s + (i.stockActual || 0), 0)} subtitulo="Unidades en sucursal" color="bg-orange-800" icono="S" />
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Tarjeta titulo="Traslados Pendientes" valor={datos.trasladosPendientes} subtitulo="Por procesar" color="bg-amber-500" icono="T" />
        <Tarjeta titulo="Stock Bajo" valor={productosFiltrados.length} subtitulo="Requieren atención" color="bg-red-500" icono="!" />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfica de barras: Ventas vs Compras */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Ventas vs Compras (mensual){!esDueño && <span className="text-sm text-gray-400 font-normal ml-2">— {miSucursal}</span>}
          </h2>
          {datosMensuales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosMensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatearPrecio(value)} />
                <Legend />
                <Bar dataKey="ventas" fill="#ea580c" name="Ventas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compras" fill="#fdba74" name="Compras" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Sin datos de ventas o compras</p>
          )}
        </div>

        {/* DUEÑO: Pie stock por sucursal | Otros: Barras stock por producto */}
        <div className="bg-white rounded-lg shadow p-6">
          {esDueño ? (
            <>
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
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Stock por Producto <span className="text-sm text-gray-400 font-normal">— {miSucursal}</span>
              </h2>
              {stockPorProducto.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockPorProducto} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#ea580c" name="Stock Actual" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="minimo" fill="#fed7aa" name="Stock Mínimo" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-12">Sin datos de inventario</p>
              )}
            </>
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
