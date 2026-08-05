import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit, Trash2, X } from 'lucide-react';
import { getUsuarios, createUsuario, updateUsuarioAdmin, deleteUsuario } from '../../../services/userService';

const UsuariosView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    u_nombres: '',
    u_apellidos: '',
    u_td_id: 1,
    u_numero_documento: '',
    u_correo_electronico: '',
    u_contrasena: '123456',
    u_r_id: 1,
    u_numero_contacto: '',
    u_eg_id: 1
  });

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getUsuarios();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        u_nombres: user.u_nombres || user.name?.split(' ')[0] || '',
        u_apellidos: user.u_apellidos || user.name?.split(' ').slice(1).join(' ') || '',
        u_td_id: user.u_td_id || 1,
        u_numero_documento: user.u_numero_documento || '',
        u_correo_electronico: user.u_correo_electronico || user.email || '',
        u_contrasena: '',
        u_r_id: user.u_r_id || (user.role === 'Admin' ? 3 : user.role === 'Entrenador' ? 2 : 1),
        u_numero_contacto: user.u_numero_contacto || '',
        u_eg_id: user.u_eg_id !== undefined ? user.u_eg_id : (user.status === 'Activo' ? 1 : 0)
      });
    } else {
      setEditingUser(null);
      setFormData({
        u_nombres: '',
        u_apellidos: '',
        u_td_id: 1,
        u_numero_documento: '',
        u_correo_electronico: '',
        u_contrasena: '123456',
        u_r_id: 1,
        u_numero_contacto: '',
        u_eg_id: 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.u_nombres.trim() || !formData.u_correo_electronico.trim()) return;

    if (editingUser) {
      const id = editingUser.u_id || editingUser.id;
      await updateUsuarioAdmin(id, formData);
      setUsers(users.map(u => ((u.u_id || u.id) === id ? { ...u, ...formData } : u)));
    } else {
      const created = await createUsuario(formData);
      setUsers([created, ...users]);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteUsuario(id);
      setUsers(users.filter(u => (u.u_id || u.id) !== id));
    }
  };

  const getRoleLabel = (r_id) => {
    if (r_id === 3 || r_id === 'Admin') return 'Admin';
    if (r_id === 2 || r_id === 'Entrenador') return 'Entrenador';
    return 'Cliente';
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.u_nombres || u.name || ''} ${u.u_apellidos || ''}`.toLowerCase();
    const email = (u.u_correo_electronico || u.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    
    const roleLabel = getRoleLabel(u.u_r_id || u.role);
    const matchesRole = roleFilter === 'Todos' || roleLabel === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Control de cuentas de miembros, roles del sistema y asignación de suscripciones.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={16} />
          Añadir Usuario
        </button>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Usuarios</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{users.length}</span>
          </div>
          <span className="badge badge-success">Registrados</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Usuarios Activos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {users.filter(u => u.u_eg_id === 1 || u.status === 'Activo').length}
            </span>
          </div>
          <span className="badge badge-primary">Estado OK</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Administradores</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {users.filter(u => u.u_r_id === 3 || u.role === 'Admin').length}
            </span>
          </div>
          <span className="badge badge-neutral">Staff Admin</span>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar usuario por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ROL (u_r_id):</span>
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Cliente">Cliente (r_id = 1)</option>
            <option value="Entrenador">Entrenador (r_id = 2)</option>
            <option value="Admin">Admin (r_id = 3)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Documento</th>
                <th>Contacto</th>
                <th>Rol (u_r_id)</th>
                <th>Estado (u_eg_id)</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const id = u.u_id || u.id;
                  const nombre = u.u_nombres ? `${u.u_nombres} ${u.u_apellidos || ''}` : u.name;
                  const correo = u.u_correo_electronico || u.email;
                  const doc = u.u_numero_documento || 'N/A';
                  const contacto = u.u_numero_contacto || 'N/A';
                  const roleLabel = getRoleLabel(u.u_r_id || u.role);
                  const isActivo = (u.u_eg_id === 1 || u.status === 'Activo');

                  return (
                    <tr key={id}>
                      <td>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{nombre}</p>
                          <p style={{ fontSize: '0.6875rem', color: '#78716c' }}>{correo}</p>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          Doc #{doc} (TD: {u.u_td_id || 1})
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{contacto}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          roleLabel === 'Admin' ? 'badge-error' :
                          roleLabel === 'Entrenador' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {roleLabel} (ID: {u.u_r_id || 1})
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isActivo ? 'badge-success' : 'badge-warning'}`}>
                          {isActivo ? 'Activo (1)' : 'Inactivo (0)'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button className="btn-icon" onClick={() => handleOpenModal(u)} title="Editar"><Edit size={18} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete(id)} title="Eliminar"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Agregar / Editar Usuario */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Nombres (u_nombres)</label>
                    <input
                      type="text"
                      maxLength={35}
                      className="admin-input"
                      value={formData.u_nombres}
                      onChange={(e) => setFormData({ ...formData, u_nombres: e.target.value })}
                      placeholder="Ej. Laura"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Apellidos (u_apellidos)</label>
                    <input
                      type="text"
                      maxLength={35}
                      className="admin-input"
                      value={formData.u_apellidos}
                      onChange={(e) => setFormData({ ...formData, u_apellidos: e.target.value })}
                      placeholder="Ej. Gómez"
                      required
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Tipo Documento (u_td_id)</label>
                    <select
                      className="admin-select"
                      value={formData.u_td_id}
                      onChange={(e) => setFormData({ ...formData, u_td_id: parseInt(e.target.value) || 1 })}
                    >
                      <option value={1}>1 - Cédula de Ciudadanía</option>
                      <option value={2}>2 - Cédula de Extranjería</option>
                      <option value={3}>3 - Pasaporte</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Número Documento (u_numero_documento)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.u_numero_documento}
                      onChange={(e) => setFormData({ ...formData, u_numero_documento: e.target.value })}
                      placeholder="Ej. 1020304050"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Correo Electrónico (u_correo_electronico)</label>
                  <input
                    type="email"
                    maxLength={100}
                    className="admin-input"
                    value={formData.u_correo_electronico}
                    onChange={(e) => setFormData({ ...formData, u_correo_electronico: e.target.value })}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="admin-form-group">
                    <label>Contraseña (u_contrasena)</label>
                    <input
                      type="password"
                      className="admin-input"
                      value={formData.u_contrasena}
                      onChange={(e) => setFormData({ ...formData, u_contrasena: e.target.value })}
                      placeholder="Contraseña inicial"
                      required
                    />
                  </div>
                )}

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Rol del Sistema (u_r_id)</label>
                    <select
                      className="admin-select"
                      value={formData.u_r_id}
                      onChange={(e) => setFormData({ ...formData, u_r_id: parseInt(e.target.value) || 1 })}
                    >
                      <option value={1}>1 - Cliente</option>
                      <option value={2}>2 - Entrenador</option>
                      <option value={3}>3 - Administrador</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Número Contacto (u_numero_contacto)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.u_numero_contacto}
                      onChange={(e) => setFormData({ ...formData, u_numero_contacto: e.target.value })}
                      placeholder="Ej. 3001234567"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Estado General (u_eg_id)</label>
                  <select
                    className="admin-select"
                    value={formData.u_eg_id}
                    onChange={(e) => setFormData({ ...formData, u_eg_id: parseInt(e.target.value) || 1 })}
                  >
                    <option value={1}>1 - Activo</option>
                    <option value={0}>0 - Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosView;
