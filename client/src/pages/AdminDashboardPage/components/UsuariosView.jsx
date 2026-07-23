import React, { useState } from 'react';
import { UserPlus, Search, Edit, Trash2, Shield, User, X } from 'lucide-react';

const initialUsers = [
  {
    id: 1,
    name: 'Laura Gómez',
    email: 'laura.gomez@gmail.com',
    role: 'Cliente',
    plan: 'Plan Pro',
    joinDate: '2026-01-15',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Roberto Silva',
    email: 'roberto.s@hotmail.com',
    role: 'Cliente',
    plan: 'Plan VIP Performance',
    joinDate: '2026-03-10',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Elena Valery',
    email: 'elena.valery@bodyhealth.com',
    role: 'Entrenador',
    plan: 'Staff Master',
    joinDate: '2025-08-01',
    status: 'Activo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWT77s3Ob6BZ_xenDfI9nbBvd2AGw67CGVJCU-W2CPtT8tD9gJgGsB66E1HwSsLr5m-t7IBruM8st_NjQ0G2KYOUam-uugnG1SfT9n7xqmusBakEr0-ZrtMi-l5glHCly8ok8obLj8FwrMgOJmf4xe4Hyx1tKpyZ4ViEvVyKYfBPL-2jibpvKhKWRa0FF6QsNs_tiW4mdn7CqeVRaXGm2nPkS8asHJDOpPGM5gsJWUWEq_gW6BK2e5Tu1yWJoSGlyo14K7YNxXwRY'
  },
  {
    id: 4,
    name: 'Ana Belén',
    email: 'anabelen@yahoo.com',
    role: 'Cliente',
    plan: 'Plan Básico',
    joinDate: '2026-05-20',
    status: 'Pendiente',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    name: 'Admin Principal',
    email: 'admin@bodyhealth.com',
    role: 'Admin',
    plan: 'Acceso Total',
    joinDate: '2025-01-01',
    status: 'Activo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvnaVFB5f-Np0XscOQ7ivAuKVccN4UGkoBugiTz10Q0CcrMmS9DZo0nbHV0wTRehUsDwhHgsBWis1QiMakmZeTOryDfE9hHjraMOH2rKC8UvITiGAitQTQ7DLUIOOkkacGGk2FeJkZAAh5iuvpRF-WDpP7A--mjV6X7KjUkQP9fOP3GrEgvguKxZlDKwaJqoo7eowjmKSeqIKQQJJvOpG6nKyeeqkjKyDdK_Z1whhbpbrnzx776gIPXtKillplANYbWAu6lvWVVZI'
  }
];

const UsuariosView = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Cliente',
    plan: 'Plan Pro',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Activo',
    avatar: ''
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Cliente',
        plan: 'Plan Pro',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Activo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...formData, id: editingUser.id } : u));
    } else {
      const newUser = {
        ...formData,
        id: Date.now(),
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      setUsers([newUser, ...users]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || u.role === roleFilter;
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
          <span className="badge badge-success">+15 este mes</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Clientes Activos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {users.filter(u => u.status === 'Activo').length}
            </span>
          </div>
          <span className="badge badge-primary">Membresía OK</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Administradores</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {users.filter(u => u.role === 'Admin').length}
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
            placeholder="Buscar usuario por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ROL:</span>
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Cliente">Cliente</option>
            <option value="Entrenador">Entrenador</option>
            <option value="Admin">Admin</option>
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
                <th>Rol</th>
                <th>Plan Asignado</th>
                <th>Fecha de Registro</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f5f5f4' }}>
                          <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{u.name}</p>
                          <p style={{ fontSize: '0.6875rem', color: '#78716c' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'Admin' ? 'badge-error' :
                        u.role === 'Entrenador' ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{u.plan}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{u.joinDate}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Activo' ? 'badge-success' : 'badge-warning'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(u)} title="Editar"><Edit size={18} /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(u.id)} title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
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
                <div className="admin-form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Laura Gómez"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Rol del Sistema</label>
                    <select
                      className="admin-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Cliente">Cliente</option>
                      <option value="Entrenador">Entrenador</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Plan Asignado</label>
                    <select
                      className="admin-select"
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    >
                      <option value="Plan Básico">Plan Básico</option>
                      <option value="Plan Pro">Plan Pro</option>
                      <option value="Plan VIP Performance">Plan VIP</option>
                      <option value="Pase Diario">Pase Diario</option>
                      <option value="Acceso Total">Acceso Total (Staff)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Fecha Registro</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Estado</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>URL Avatar / Foto</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                  />
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
