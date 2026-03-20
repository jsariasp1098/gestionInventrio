import { useEffect, useState } from 'react';
import api from '../api/axios';

const formVacio = { nombreSucursal: '', direccion: '', telefono: '', email: '' };

export default function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [error, setError] = useState('');

  const cargar = () => {
    setCargando(true);
    api.get('/sucursales')
      .then((res) => setSucursales(res.data))
      .catch(() => setError('Error al cargar sucursales'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(formVacio);
    setError('');
    setMostrarModal(true);
  };

  const abrirEditar = (s) => {
    setEditando(s.idSucursal);
    setForm({ nombreSucursal: s.nombreSucursal, direccion: s.direccion, telefono: s.telefono, email: s.email });
    setError('');
    setMostrarModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nombreSucursal || !form.direccion) {
      setError('Nombre y dirección son obligatorios');
      return;
    }
    try {
      if (editando) {
        await api.put(`/sucursales/${editando}`, form);
      } else {
        await api.post('/sucursales', form);
      }
      setMostrarModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sucursal?')) return;
    try {
      await api.delete(`/sucursales/${id}`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  if (cargando) return <p className="text-gray-500">Cargando sucursales...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sucursales</h1>
        <button onClick={abrirCrear} className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
          + Nueva Sucursal
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-sm text-gray-600 uppercase">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Dirección</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No hay sucursales registradas</td></tr>
            ) : (
              sucursales.map((s) => (
                <tr key={s.idSucursal} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{s.idSucursal}</td>
                  <td className="px-6 py-4 font-medium">{s.nombreSucursal}</td>
                  <td className="px-6 py-4">{s.direccion}</td>
                  <td className="px-6 py-4">{s.telefono}</td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button onClick={() => abrirEditar(s)} className="text-orange-600 hover:text-orange-800 text-sm font-medium">Editar</button>
                    <button onClick={() => eliminar(s.idSucursal)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-orange-600 text-white p-5 rounded-t-lg">
              <h2 className="text-xl font-bold">{editando ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
            </div>
            <div className="p-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" value={form.nombreSucursal} onChange={(e) => setForm({ ...form, nombreSucursal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button type="button" onClick={() => setMostrarModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-5 py-2.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium">{editando ? 'Guardar Cambios' : 'Crear Sucursal'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
