import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Ventas() {
  const { usuario } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([{ idProducto: '', cantidad: 1 }]);
  const [error, setError] = useState('');

  const cargarVentas = () => {
    setCargando(true);
    api.get('/ventas')
      .then((res) => setVentas(res.data))
      .catch(() => setError('Error al cargar ventas'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarVentas(); }, []);

  // Abrir modal de nueva venta
  const abrirCrear = () => {
    setDetalles([{ idProducto: '', cantidad: 1 }]);
    setError('');
    // Cargar productos disponibles
    api.get('/productos').then((res) => setProductos(res.data));
    setMostrarModal(true);
  };

  // Agregar fila de detalle
  const agregarDetalle = () => {
    setDetalles([...detalles, { idProducto: '', cantidad: 1 }]);
  };

  // Eliminar fila de detalle
  const eliminarDetalle = (index) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  // Actualizar detalle
  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[index][campo] = campo === 'cantidad' ? Number(valor) : valor;
    setDetalles(nuevos);
  };

  // Guardar venta
  const guardar = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que todos los detalles tengan producto seleccionado
    if (detalles.some((d) => !d.idProducto)) {
      setError('Selecciona un producto en cada línea');
      return;
    }

    try {
      await api.post('/ventas', {
        idUsuario: usuario.idSucursal, // Se usará el usuario logueado
        idSucursal: usuario.idSucursal,
        detalles: detalles.map((d) => ({
          idProducto: Number(d.idProducto),
          cantidad: d.cantidad,
        })),
      });
      setMostrarModal(false);
      cargarVentas();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar venta');
    }
  };

  // Eliminar venta
  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta venta?')) return;
    try {
      await api.delete(`/ventas/${id}`);
      cargarVentas();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };

  if (cargando) return <p className="text-gray-500">Cargando ventas...</p>;

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
        <button onClick={abrirCrear} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
          + Nueva Venta
        </button>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-sm text-gray-600 uppercase">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Sucursal</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No hay ventas registradas</td></tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.idVenta} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{v.idVenta}</td>
                  <td className="px-6 py-4">{v.fechaVenta}</td>
                  <td className="px-6 py-4">{v.usuario}</td>
                  <td className="px-6 py-4">{v.sucursal}</td>
                  <td className="px-6 py-4 text-right font-medium text-green-700">{formatearPrecio(v.total)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {v.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => eliminar(v.idVenta)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nueva venta */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Venta</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={guardar} className="space-y-4">
              {/* Detalles de la venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
                {detalles.map((det, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={det.idProducto}
                      onChange={(e) => actualizarDetalle(index, 'idProducto', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((p) => (
                        <option key={p.idProducto} value={p.idProducto}>
                          {p.nombre} - {formatearPrecio(p.precioVenta)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={det.cantidad}
                      onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarDetalle(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={agregarDetalle}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  + Agregar producto
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Registrar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
