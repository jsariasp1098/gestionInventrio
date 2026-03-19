import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Compras() {
  const { usuario } = useAuth();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([{ idProducto: '', cantidad: 1, precioCosto: '' }]);
  const [error, setError] = useState('');

  const cargarCompras = () => {
    setCargando(true);
    api.get('/compras')
      .then((res) => setCompras(res.data))
      .catch(() => setError('Error al cargar compras'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarCompras(); }, []);

  const abrirCrear = () => {
    setDetalles([{ idProducto: '', cantidad: 1, precioCosto: '' }]);
    setError('');
    api.get('/productos').then((res) => setProductos(res.data));
    setMostrarModal(true);
  };

  const agregarDetalle = () => {
    setDetalles([...detalles, { idProducto: '', cantidad: 1, precioCosto: '' }]);
  };

  const eliminarDetalle = (index) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = detalles.map((d, i) => {
      if (i !== index) return d;
      const copia = { ...d, [campo]: (campo === 'cantidad' || campo === 'precioCosto') ? Number(valor) : valor };
      // Auto-rellenar precio costo al seleccionar producto
      if (campo === 'idProducto' && valor) {
        const prod = productos.find((p) => String(p.idProducto) === String(valor));
        if (prod) copia.precioCosto = prod.precioCosto;
      }
      return copia;
    });
    setDetalles(nuevos);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');

    if (detalles.some((d) => !d.idProducto || !d.precioCosto)) {
      setError('Completa todos los campos en cada línea');
      return;
    }

    try {
      await api.post('/compras', {
        idUsuario: usuario.idSucursal,
        idSucursal: usuario.idSucursal,
        detalles: detalles.map((d) => ({
          idProducto: Number(d.idProducto),
          cantidad: d.cantidad,
          precioCosto: Number(d.precioCosto),
        })),
      });
      setMostrarModal(false);
      cargarCompras();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar compra');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta compra?')) return;
    try {
      await api.delete(`/compras/${id}`);
      cargarCompras();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };

  if (cargando) return <p className="text-gray-500">Cargando compras...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Compras</h1>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          + Nueva Compra
        </button>
      </div>

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
            {compras.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No hay compras registradas</td></tr>
            ) : (
              compras.map((c) => (
                <tr key={c.idCompra} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{c.idCompra}</td>
                  <td className="px-6 py-4">{c.fechaCompra}</td>
                  <td className="px-6 py-4">{c.usuario}</td>
                  <td className="px-6 py-4">{c.sucursal}</td>
                  <td className="px-6 py-4 text-right font-medium text-blue-700">{formatearPrecio(c.total)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => eliminar(c.idCompra)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nueva compra */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Compra</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
                {detalles.map((det, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={det.idProducto}
                      onChange={(e) => actualizarDetalle(index, 'idProducto', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((p) => (
                        <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={det.cantidad}
                      onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                      min="1"
                      placeholder="Cant."
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={det.precioCosto}
                      onChange={(e) => actualizarDetalle(index, 'precioCosto', e.target.value)}
                      min="0"
                      placeholder="Costo"
                      className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Registrar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
