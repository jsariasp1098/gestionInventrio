import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Compras() {
  const { usuario } = useAuth();
  const esDueño = usuario?.rol === 'DUEÑO';
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([]);
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
    setDetalles([{ idProducto: '', cantidad: 1, precioCosto: 0, nombre: '' }]);
    setError('');
    api.get('/productos').then((res) => setProductos(res.data));
    setMostrarModal(true);
  };

  const agregarDetalle = () => {
    setDetalles([...detalles, { idProducto: '', cantidad: 1, precioCosto: 0, nombre: '' }]);
  };

  const eliminarDetalle = (index) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = detalles.map((d, i) => {
      if (i !== index) return d;
      const copia = { ...d, [campo]: (campo === 'cantidad' || campo === 'precioCosto') ? Number(valor) : valor };
      if (campo === 'idProducto' && valor) {
        const prod = productos.find((p) => String(p.idProducto) === String(valor));
        if (prod) {
          copia.precioCosto = prod.precioCosto;
          copia.nombre = prod.nombre;
        }
      }
      return copia;
    });
    setDetalles(nuevos);
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + (d.precioCosto * d.cantidad), 0);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    if (detalles.some((d) => !d.idProducto || !d.precioCosto)) {
      setError('Completa todos los campos en cada linea');
      return;
    }
    try {
      await api.post('/compras', {
        idUsuario: usuario.idUsuario,
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
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al registrar compra');
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

  const formatearPrecio = (valor) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  const hoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  if (cargando) return <p className="text-gray-500">Cargando compras...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Compras</h1>
        <button onClick={abrirCrear} className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
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
            {(() => {
              const comprasFiltradas = esDueño ? compras : compras.filter((c) => c.sucursal === usuario.nombreSucursal);
              return comprasFiltradas.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No hay compras registradas</td></tr>
            ) : (
              comprasFiltradas.map((c) => (
                <tr key={c.idCompra} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{c.idCompra}</td>
                  <td className="px-6 py-4">{c.fechaCompra}</td>
                  <td className="px-6 py-4">{c.usuario}</td>
                  <td className="px-6 py-4">{c.sucursal}</td>
                  <td className="px-6 py-4 text-right font-medium text-orange-700">{formatearPrecio(c.total)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">{c.estado}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => eliminar(c.idCompra)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                  </td>
                </tr>
              ))
            ); })()
            }
          </tbody>
        </table>
      </div>

      {/* Modal nueva compra - formulario completo */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-600 text-white p-5 rounded-t-lg">
              <h2 className="text-xl font-bold">Nueva Compra</h2>
              <p className="text-orange-100 text-sm mt-1">Registrar compra de productos a proveedor</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Responsable</p>
                  <p className="text-sm font-semibold text-gray-800">{usuario.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Sucursal destino</p>
                  <p className="text-sm font-semibold text-gray-800">{usuario.nombreSucursal}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Fecha</p>
                  <p className="text-sm font-semibold text-gray-800">{hoy}</p>
                </div>
              </div>

              <form onSubmit={guardar}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Detalle de productos</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                          <th className="px-3 py-2 text-left">Producto</th>
                          <th className="px-3 py-2 text-center w-20">Cant.</th>
                          <th className="px-3 py-2 text-right">P. Costo</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalles.map((det, index) => {
                          const subtotal = det.precioCosto * det.cantidad;
                          return (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2">
                                <select
                                  value={det.idProducto}
                                  onChange={(e) => actualizarDetalle(index, 'idProducto', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                >
                                  <option value="">Seleccionar...</option>
                                  {productos.map((p) => (
                                    <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number" value={det.cantidad} min="1"
                                  onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number" value={det.precioCosto} min="0"
                                  onChange={(e) => actualizarDetalle(index, 'precioCosto', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-medium">
                                {subtotal > 0 ? formatearPrecio(subtotal) : '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button type="button" onClick={() => eliminarDetalle(index)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" onClick={agregarDetalle} className="mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium">
                    + Agregar producto
                  </button>
                </div>

                <div className="flex justify-end mb-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-6 py-3 text-right">
                    <p className="text-xs text-orange-600 uppercase font-medium">Total de la compra</p>
                    <p className="text-2xl font-bold text-orange-700">{formatearPrecio(calcularTotal())}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button type="button" onClick={() => setMostrarModal(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="px-5 py-2.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium">
                    Registrar Compra
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
