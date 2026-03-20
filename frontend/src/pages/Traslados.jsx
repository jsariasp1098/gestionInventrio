import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ESTADO_COLORS = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  EN_TRANSITO: 'bg-blue-100 text-blue-700',
  RECIBIDO_COMPLETO: 'bg-green-100 text-green-700',
  RECIBIDO_CON_FALTANTE: 'bg-orange-100 text-orange-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

const ESTADO_LABEL = {
  PENDIENTE: 'Pendiente',
  EN_TRANSITO: 'En Tránsito',
  RECIBIDO_COMPLETO: 'Recibido',
  RECIBIDO_CON_FALTANTE: 'Recibido (faltante)',
  CANCELADO: 'Cancelado',
};

export default function Traslados() {
  const { usuario } = useAuth();
  const [traslados, setTraslados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [error, setError] = useState('');

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEnviar, setModalEnviar] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [trasladoActivo, setTrasladoActivo] = useState(null);

  // Form nueva solicitud
  const [formProducto, setFormProducto] = useState('');
  const [formSucursalOrigen, setFormSucursalOrigen] = useState('');
  const [formCantidad, setFormCantidad] = useState(1);

  // Form enviar
  const [cantidadEnviada, setCantidadEnviada] = useState('');
  // Form confirmar
  const [cantidadRecibida, setCantidadRecibida] = useState('');
  const [observacionesRecepcion, setObservacionesRecepcion] = useState('');

  const cargarTraslados = () => {
    setCargando(true);
    api.get('/traslados')
      .then((res) => setTraslados(res.data))
      .catch(() => setError('Error al cargar traslados'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarTraslados();
    api.get('/productos').then((res) => setProductos(res.data));
    api.get('/inventario').then((res) => setInventario(res.data));
  }, []);

  const hoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // Sucursales que TIENEN el producto seleccionado (excluyendo mi sucursal)
  const sucursalesConProducto = formProducto
    ? inventario
        .filter((inv) => inv.idProducto === Number(formProducto) && Number(inv.idSucursal) !== Number(usuario.idSucursal) && inv.stockActual > 0)
        .map((inv) => ({ idSucursal: inv.idSucursal, sucursal: inv.sucursal, stock: inv.stockActual }))
    : [];

  const stockMaximo = sucursalesConProducto.find((s) => s.idSucursal === Number(formSucursalOrigen))?.stock || 0;

  // === CREAR SOLICITUD ===
  const abrirCrear = () => {
    setFormProducto('');
    setFormSucursalOrigen('');
    setFormCantidad(1);
    setError('');
    setModalCrear(true);
  };

  const crearSolicitud = async (e) => {
    e.preventDefault();
    setError('');
    if (!formProducto || !formSucursalOrigen) {
      setError('Selecciona un producto y la sucursal a la que deseas pedir');
      return;
    }
    if (formCantidad < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }
    if (formCantidad > stockMaximo) {
      setError(`La sucursal seleccionada solo tiene ${stockMaximo} unidades disponibles`);
      return;
    }
    try {
      await api.post('/traslados', {
        sucursalOrigen: Number(formSucursalOrigen),
        sucursalDestino: usuario.idSucursal,
        idProducto: Number(formProducto),
        idUsuarioSolicita: usuario.idUsuario,
        cantidadSolicitada: Number(formCantidad),
      });
      setModalCrear(false);
      cargarTraslados();
      // Refrescar inventario después de crear
      api.get('/inventario').then((res) => setInventario(res.data));
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al crear solicitud');
    }
  };

  // === ENVIAR TRASLADO ===
  const abrirEnviar = (t) => {
    setTrasladoActivo(t);
    setCantidadEnviada(t.cantidadSolicitada);
    setError('');
    setModalEnviar(true);
  };

  const enviarTraslado = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/traslados/${trasladoActivo.idSolicitud}/enviar?cantidadEnviada=${Number(cantidadEnviada)}`);
      setModalEnviar(false);
      cargarTraslados();
      api.get('/inventario').then((res) => setInventario(res.data));
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al enviar');
    }
  };

  // === CONFIRMAR RECEPCIÓN ===
  const abrirConfirmar = (t) => {
    setTrasladoActivo(t);
    setCantidadRecibida(t.cantidadEnviada || t.cantidadSolicitada);
    setObservacionesRecepcion('');
    setError('');
    setModalConfirmar(true);
  };

  const confirmarRecepcion = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let url = `/traslados/${trasladoActivo.idSolicitud}/confirmar?cantidadRecibida=${Number(cantidadRecibida)}`;
      if (observacionesRecepcion) url += `&observaciones=${encodeURIComponent(observacionesRecepcion)}`;
      await api.put(url);
      setModalConfirmar(false);
      cargarTraslados();
      api.get('/inventario').then((res) => setInventario(res.data));
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al confirmar');
    }
  };

  // === CANCELAR ===
  const cancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta solicitud de traslado?')) return;
    try {
      await api.put(`/traslados/${id}/cancelar`);
      cargarTraslados();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al cancelar');
    }
  };

  // Determinar acciones según estado y sucursal del usuario
  const puedeEnviar = (t) => t.estado === 'PENDIENTE' && t.sucursalOrigen === usuario.idSucursal;
  const puedeCancelar = (t) => t.estado === 'PENDIENTE';
  const puedeConfirmar = (t) => t.estado === 'EN_TRANSITO' && t.sucursalDestino === usuario.idSucursal;
  const esFinalizado = (t) => ['RECIBIDO_COMPLETO', 'RECIBIDO_CON_FALTANTE', 'CANCELADO'].includes(t.estado);

  if (cargando) return <p className="text-gray-500">Cargando traslados...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Traslados entre Sucursales</h1>
          <p className="text-gray-500 text-sm mt-1">Solicita productos de otras sucursales y gestiona envíos</p>
        </div>
        <button onClick={abrirCrear} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
          + Solicitar Producto
        </button>
      </div>

      {/* Resumen por estado */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {['PENDIENTE', 'EN_TRANSITO', 'RECIBIDO_COMPLETO', 'RECIBIDO_CON_FALTANTE', 'CANCELADO'].map((estado) => {
          const count = traslados.filter((t) => t.estado === estado).length;
          return (
            <div key={estado} className="bg-white rounded-lg shadow p-3 text-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[estado]}`}>
                {ESTADO_LABEL[estado]}
              </span>
              <p className="text-xl font-bold text-gray-800 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-xs text-gray-600 uppercase">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Remitente (tiene)</th>
              <th className="px-4 py-3">Solicitante (pide)</th>
              <th className="px-4 py-3 text-center">Solicit.</th>
              <th className="px-4 py-3 text-center">Enviado</th>
              <th className="px-4 py-3 text-center">Recibido</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3">Quién pidió</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {traslados.length === 0 ? (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-400">No hay traslados registrados</td></tr>
            ) : (
              traslados.map((t) => (
                <tr key={t.idSolicitud} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">#{t.idSolicitud}</td>
                  <td className="px-4 py-3">{t.fechaSolicitud}</td>
                  <td className="px-4 py-3 font-medium">{t.nombreProducto}</td>
                  <td className="px-4 py-3">{t.nombreSucursalOrigen}</td>
                  <td className="px-4 py-3">{t.nombreSucursalDestino}</td>
                  <td className="px-4 py-3 text-center font-semibold">{t.cantidadSolicitada}</td>
                  <td className="px-4 py-3 text-center">{t.cantidadEnviada ?? '-'}</td>
                  <td className="px-4 py-3 text-center">{t.cantidadRecibida ?? '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[t.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {ESTADO_LABEL[t.estado] || t.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.nombreUsuarioSolicita}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {puedeEnviar(t) && (
                        <button onClick={() => abrirEnviar(t)} className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded">
                          Enviar
                        </button>
                      )}
                      {puedeCancelar(t) && (
                        <button onClick={() => cancelar(t.idSolicitud)} className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 bg-red-50 rounded">
                          Cancelar
                        </button>
                      )}
                      {puedeConfirmar(t) && (
                        <button onClick={() => abrirConfirmar(t)} className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 bg-green-50 rounded">
                          Confirmar Recepción
                        </button>
                      )}
                      {esFinalizado(t) && (
                        <span className="text-gray-400 text-xs">Finalizado</span>
                      )}
                      {t.estado === 'EN_TRANSITO' && t.sucursalDestino !== usuario.idSucursal && (
                        <span className="text-blue-400 text-xs italic">En camino...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== MODAL CREAR SOLICITUD ==================== */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="bg-purple-600 text-white p-5 rounded-t-lg">
              <h2 className="text-xl font-bold">Solicitar Producto a otra Sucursal</h2>
              <p className="text-purple-100 text-sm mt-1">Selecciona el producto, mira qué sucursales lo tienen y pide la cantidad que necesitas</p>
            </div>
            <div className="p-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

              {/* Info del solicitante */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Solicitante</p>
                  <p className="text-sm font-semibold text-gray-800">{usuario.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Fecha</p>
                  <p className="text-sm font-semibold text-gray-800">{hoy}</p>
                </div>
              </div>

              <form onSubmit={crearSolicitud} className="space-y-4">
                {/* Paso 1: Seleccionar producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    1. ¿Qué producto necesitas?
                  </label>
                  <select
                    value={formProducto}
                    onChange={(e) => { setFormProducto(e.target.value); setFormSucursalOrigen(''); setFormCantidad(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Seleccionar producto...</option>
                    {productos.map((p) => (
                      <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Paso 2: Mostrar sucursales que tienen el producto */}
                {formProducto && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      2. ¿A qué sucursal le quieres pedir?
                    </label>
                    {sucursalesConProducto.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                        Ninguna otra sucursal tiene stock disponible de este producto.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sucursalesConProducto.map((s) => (
                          <label
                            key={s.idSucursal}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              formSucursalOrigen === String(s.idSucursal)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="sucursalOrigen"
                                value={s.idSucursal}
                                checked={formSucursalOrigen === String(s.idSucursal)}
                                onChange={(e) => { setFormSucursalOrigen(e.target.value); setFormCantidad(1); }}
                                className="text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-medium text-gray-800">{s.sucursal}</span>
                            </div>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              {s.stock} en stock
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Paso 3: Cantidad */}
                {formSucursalOrigen && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      3. ¿Cuántas unidades necesitas? <span className="text-gray-400 font-normal">(máx. {stockMaximo})</span>
                    </label>
                    <input
                      type="number"
                      value={formCantidad}
                      min="1"
                      max={stockMaximo}
                      onChange={(e) => setFormCantidad(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button type="button" onClick={() => setModalCrear(false)} className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!formProducto || !formSucursalOrigen || formCantidad < 1}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL ENVIAR (para la sucursal remitente) ==================== */}
      {modalEnviar && trasladoActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-blue-600 text-white p-5 rounded-t-lg">
              <h2 className="text-xl font-bold">Enviar Producto — Solicitud #{trasladoActivo.idSolicitud}</h2>
              <p className="text-blue-100 text-sm mt-1">Al enviar, se descontará del inventario de tu sucursal y quedará en tránsito</p>
            </div>
            <div className="p-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2 text-sm">
                <p><span className="font-medium text-gray-600">Producto:</span> {trasladoActivo.nombreProducto}</p>
                <p><span className="font-medium text-gray-600">Tu sucursal (remitente):</span> {trasladoActivo.nombreSucursalOrigen}</p>
                <p><span className="font-medium text-gray-600">Solicita:</span> {trasladoActivo.nombreSucursalDestino}</p>
                <p><span className="font-medium text-gray-600">Cantidad solicitada:</span> <span className="font-bold text-purple-700">{trasladoActivo.cantidadSolicitada}</span></p>
                <p><span className="font-medium text-gray-600">Solicitado por:</span> {trasladoActivo.nombreUsuarioSolicita}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm">
                <strong>Nota:</strong> Al confirmar el envío, las unidades se descontarán del inventario de tu sucursal y el producto quedará <strong>en tránsito</strong> hasta que la sucursal solicitante confirme la recepción.
              </div>

              <form onSubmit={enviarTraslado} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a enviar</label>
                  <input type="number" value={cantidadEnviada} min="1"
                    onChange={(e) => setCantidadEnviada(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button type="button" onClick={() => setModalEnviar(false)} className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Confirmar Envío</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CONFIRMAR RECEPCIÓN ==================== */}
      {modalConfirmar && trasladoActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-green-600 text-white p-5 rounded-t-lg">
              <h2 className="text-xl font-bold">Confirmar Recepción — #{trasladoActivo.idSolicitud}</h2>
              <p className="text-green-100 text-sm mt-1">Verifica la mercancía recibida. Al confirmar se sumará a tu inventario.</p>
            </div>
            <div className="p-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2 text-sm">
                <p><span className="font-medium text-gray-600">Producto:</span> {trasladoActivo.nombreProducto}</p>
                <p><span className="font-medium text-gray-600">Enviado por:</span> {trasladoActivo.nombreSucursalOrigen}</p>
                <p><span className="font-medium text-gray-600">Tu sucursal:</span> {trasladoActivo.nombreSucursalDestino}</p>
                <p><span className="font-medium text-gray-600">Cantidad enviada:</span> <span className="font-bold text-blue-700">{trasladoActivo.cantidadEnviada}</span></p>
              </div>

              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm">
                <strong>Nota:</strong> Al confirmar la recepción, las unidades se <strong>sumarán al inventario</strong> de tu sucursal. Si recibiste menos de lo enviado, indica la cantidad real.
              </div>

              <form onSubmit={confirmarRecepcion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad recibida</label>
                  <input type="number" value={cantidadRecibida} min="0" max={trasladoActivo.cantidadEnviada}
                    onChange={(e) => setCantidadRecibida(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
                  <textarea value={observacionesRecepcion}
                    onChange={(e) => setObservacionesRecepcion(e.target.value)}
                    rows="2" placeholder="Producto en buen estado, faltaron 2 unidades, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button type="button" onClick={() => setModalConfirmar(false)} className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">Confirmar Recepción</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
