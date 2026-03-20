import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLES = ['ADMINISTRADOR', 'DUEÑO', 'VENDEDOR'];
const formVacio = { nombreUsuario: '', direccion: '', telefono: '', email: '', password: '', tipo: 'VENDEDOR', idSucursal: '' };

const ROL_COLORS = {
  ADMINISTRADOR: 'bg-red-100 text-red-700',
  'DUEÑO': 'bg-yellow-100 text-yellow-700',
  VENDEDOR: 'bg-green-100 text-green-700',
};

export default function Usuarios() {
  const { usuario } = useAuth();
  const esDueño = usuario?.rol === 'DUEÑO';
  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [error, setError] = useState('');

  const cargar = () => {
    setCargando(true);
    api.get('/usuarios')
      .then((res) => {
        // ADMINISTRADOR solo ve usuarios de su sucursal
        const data = esDueño ? res.data : res.data.filter((u) => Number(u.idSucursal) === Number(usuario.idSucursal));
        setUsuarios(data);
      })
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    api.get('/sucursales').then((res) => setSucursales(res.data));
  }, []);

  const abrirCrear = () => {
    setEditando(null);
    // ADMINISTRADOR: asignar automáticamente su sucursal
    setForm(esDueño ? formVacio : { ...formVacio, idSucursal: usuario.idSucursal });
    setError('');
    setMostrarModal(true);
  };

  const abrirEditar = (u) => {
    setEditando(u.idUsuario);
    setForm({
      nombreUsuario: u.nombreUsuario,
      direccion: u.direccion,
      telefono: u.telefono,
      email: u.email,
      password: '',
      tipo: u.tipo,
      idSucursal: u.idSucursal || '',
    });
    setError('');
    setMostrarModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nombreUsuario || !form.email || !form.idSucursal) {
      setError('Nombre, email y sucursal son obligatorios');
      return;
    }
    if (!editando && !form.password) {
      setError('La contraseña es obligatoria para nuevos usuarios');
      return;
    }
    try {
      const payload = { ...form, idSucursal: Number(form.idSucursal) };
      if (editando && !payload.password) delete payload.password;
      if (editando) {
        await api.put(`/usuarios/${editando}`, payload);
      } else {
        await api.post('/usuarios', payload);
      }
      setMostrarModal(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  if (cargando) return <p className="text-gray-500">Cargando usuarios...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button onClick={abrirCrear} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors">
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b text-left text-sm text-gray-600 uppercase">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3 text-center">Rol</th>
              <th className="px-6 py-3">Sucursal</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No hay usuarios registrados</td></tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.idUsuario} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{u.idUsuario}</td>
                  <td className="px-6 py-4 font-medium">{u.nombreUsuario}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.telefono}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROL_COLORS[u.tipo] || 'bg-gray-100 text-gray-600'}`}>{u.tipo}</span>
                  </td>
                  <td className="px-6 py-4">{u.nombreSucursal}</td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button onClick={() => abrirEditar(u)} className="text-teal-600 hover:text-teal-800 text-sm font-medium">Editar</button>
                    <button onClick={() => eliminar(u.idUsuario)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-teal-600 text-white p-5 rounded-t-lg">
              <h2 className="text-xl font-bold">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            </div>
            <div className="p-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input type="text" value={form.nombreUsuario} onChange={(e) => setForm({ ...form, nombreUsuario: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editando && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
                  </label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required={!editando} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className={esDueño ? 'grid grid-cols-2 gap-4' : ''}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {esDueño && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                      <select value={form.idSucursal} onChange={(e) => setForm({ ...form, idSucursal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                        <option value="">Seleccionar...</option>
                        {sucursales.map((s) => (
                          <option key={s.idSucursal} value={s.idSucursal}>{s.nombreSucursal}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 border-t pt-4">
                  <button type="button" onClick={() => setMostrarModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium">{editando ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
