import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Inventario() {
  const { usuario } = useAuth();
  const esDueño = usuario?.rol === 'DUEÑO';

  const [inventario, setInventario] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(usuario?.idSucursal);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [error, setError] = useState('');

  // Cargar inventario por sucursal
  const cargarInventario = (idSucursal) => {
    setCargando(true);
    api.get(`/inventario/sucursal/${idSucursal}`)
      .then((res) => setInventario(res.data))
      .catch(() => setError('Error al cargar inventario'))
      .finally(() => setCargando(false));
  };

  // Cargar sucursales si es DUEÑO (para el selector)
  useEffect(() => {
    if (esDueño) {
      api.get('/sucursales').then((res) => setSucursales(res.data));
    }
    cargarInventario(sucursalSeleccionada);
  }, []);

  // Cambiar sucursal
  const cambiarSucursal = (id) => {
    setSucursalSeleccionada(Number(id));
    cargarInventario(id);
  };

  // Abrir modal para editar stock
  const abrirEditarStock = (item) => {
    setItemEditar(item);
    setNuevoStock(item.stockActual);
    setError('');
    setMostrarModal(true);
  };

  // Guardar nuevo stock
  const guardarStock = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.patch(`/inventario/${itemEditar.idInventarioSucursal}/stock?nuevoStock=${Number(nuevoStock)}`);
      setMostrarModal(false);
      cargarInventario(sucursalSeleccionada);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar stock');
    }
  };

  // Formatear precio
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };

  // Color del stock según nivel
  const colorStock = (actual, minimo) => {
    if (actual <= minimo) return 'bg-red-100 text-red-700';
    if (actual <= minimo * 2) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>

        {/* Selector de sucursal solo para DUEÑO */}
        {esDueño && (
          <select
            value={sucursalSeleccionada}
            onChange={(e) => cambiarSucursal(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {sucursales.map((s) => (
              <option key={s.idSucursal} value={s.idSucursal}>{s.nombreSucursal}</option>
            ))}
          </select>
        )}
      </div>

      {cargando ? (
        <p className="text-gray-500">Cargando inventario...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-left text-sm text-gray-600 uppercase">
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3 text-right">Precio Costo</th>
                <th className="px-6 py-3 text-right">Precio Venta</th>
                <th className="px-6 py-3 text-center">Stock Actual</th>
                <th className="px-6 py-3 text-center">Stock Mínimo</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No hay inventario en esta sucursal</td></tr>
              ) : (
                inventario.map((item) => (
                  <tr key={item.idInventarioSucursal} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.producto}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{formatearPrecio(item.precioCosto)}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-700">{formatearPrecio(item.precioVenta)}</td>
                    <td className="px-6 py-4 text-center font-bold">{item.stockActual}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{item.stockMinimo}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorStock(item.stockActual, item.stockMinimo)}`}>
                        {item.stockActual <= item.stockMinimo ? 'Bajo' : item.stockActual <= item.stockMinimo * 2 ? 'Medio' : 'OK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => abrirEditarStock(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal editar stock */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ajustar Stock</h2>
            <p className="text-gray-500 text-sm mb-4">{itemEditar?.producto}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={guardarStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Stock</label>
                <input
                  type="number"
                  value={nuevoStock}
                  onChange={(e) => setNuevoStock(e.target.value)}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
