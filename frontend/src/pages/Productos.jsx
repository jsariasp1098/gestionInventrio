import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precioCosto: '', precioVenta: '' });
  const [error, setError] = useState('');

  // Cargar productos al montar
  const cargarProductos = () => {
    setCargando(true);
    api.get('/productos')
      .then((res) => setProductos(res.data))
      .catch(() => setError('Error al cargar productos'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarProductos(); }, []);

  // Abrir modal para crear
  const abrirCrear = () => {
    setProductoEditar(null);
    setForm({ nombre: '', descripcion: '', precioCosto: '', precioVenta: '' });
    setError('');
    setMostrarModal(true);
  };

  // Abrir modal para editar
  const abrirEditar = (producto) => {
    setProductoEditar(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precioCosto: producto.precioCosto,
      precioVenta: producto.precioVenta,
    });
    setError('');
    setMostrarModal(true);
  };

  // Guardar (crear o editar)
  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const datos = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precioCosto: Number(form.precioCosto),
        precioVenta: Number(form.precioVenta),
      };

      if (productoEditar) {
        await api.put(`/productos/${productoEditar.idProducto}`, datos);
      } else {
        await api.post('/productos', datos);
      }

      setMostrarModal(false);
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar');
    }
  };

  // Eliminar producto
  const eliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargarProductos();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  // Formatear precio
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };

  if (cargando) return <p className="text-gray-500">Cargando productos...</p>;

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button onClick={abrirCrear} className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
          + Nuevo Producto
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-sm text-gray-600 uppercase">
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Descripción</th>
              <th className="px-6 py-3 text-right">Precio Costo</th>
              <th className="px-6 py-3 text-right">Precio Venta</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No hay productos registrados</td></tr>
            ) : (
              productos.map((p) => (
                <tr key={p.idProducto} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.nombre}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{p.descripcion}</td>
                  <td className="px-6 py-4 text-right">{formatearPrecio(p.precioCosto)}</td>
                  <td className="px-6 py-4 text-right font-medium text-orange-700">{formatearPrecio(p.precioVenta)}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => abrirEditar(p)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Editar
                    </button>
                    <button onClick={() => eliminar(p.idProducto)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Costo</label>
                  <input
                    type="number"
                    value={form.precioCosto}
                    onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
                  <input
                    type="number"
                    value={form.precioVenta}
                    onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
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
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  {productoEditar ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
