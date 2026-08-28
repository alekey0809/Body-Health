import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Search, Edit, Trash2, X,
  AlertCircle, RefreshCw, Shield, User, Users,
  Mail, Phone, FileText, Key, ToggleLeft, ToggleRight,
  FileSpreadsheet, FileText as FileTextIcon
} from 'lucide-react';
import { getUsuarios, createUsuario, updateUsuarioAdmin, deleteUsuario } from '../../../services/userService';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import PasswordStrengthMeter from '../../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { validateUserRegistration, sanitizeDocumentInput } from '../../../utils/validationUtils';

// ─── Catálogos ────────────────────────────────────────────────────────────────
const TIPOS_DOC = [
  { id: 1, label: 'Cédula de Ciudadanía' },
  { id: 2, label: 'Cédula de Extranjería' },
  { id: 3, label: 'Pasaporte' },
  { id: 4, label: 'Tarjeta de Identidad' },
];

const ROLES = [
  { id: 1, label: 'Administrador', color: '#dc2626', bg: '#fef2f2' },
  { id: 2, label: 'Usuario', color: '#78716c', bg: '#f5f5f4' },
  { id: 3, label: 'Entrenador', color: '#0369a1', bg: '#e0f2fe' },
];

const ESTADOS = [
  { id: 1, label: 'Activo' },
  { id: 0, label: 'Inactivo' },
];

const EMPTY_FORM = {
  u_nombres: '',
  u_apellidos: '',
  u_td_id: 1,
  u_numero_documento: '',
  u_correo_electronico: '',
  u_contrasena: '123456',
  u_r_id: 1,
  u_numero_contacto: '',
  u_eg_id: 1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRol = (r_id) => ROLES.find((r) => r.id === Number(r_id)) || ROLES[0];
const getTipoDoc = (td_id) => TIPOS_DOC.find((t) => t.id === Number(td_id))?.label || 'CC';

// ─── Componente Toast ─────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);

  const palette = {
    success: '#16a34a',
    error: 'var(--error)',
    info: 'var(--primary)',
  };

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: palette[type] || palette.info,
      color: '#fff', padding: '0.875rem 1.25rem',
      borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      fontSize: '0.875rem', fontWeight: '600',
      maxWidth: '380px', animation: 'slideInRight 0.3s ease',
    }}>
      {type === 'success' ? '✓' : '✕'} {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, marginLeft: '0.25rem' }}>
        <X size={13} />
      </button>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const UsuariosView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Columnas para exportación ────────────────────────────────────────────────
  const exportColumns = [
    { key: 'u_nombres', header: 'Nombres' },
    { key: 'u_apellidos', header: 'Apellidos' },
    { key: 'u_correo_electronico', header: 'Correo Electrónico' },
    { key: 'u_numero_documento', header: 'N° Documento' },
    { key: 'u_td_id', header: 'Tipo Doc.', format: (v) => ({ 1: 'CC', 2: 'CE', 3: 'Pasaporte', 4: 'TI' }[v] || v) },
    { key: 'u_numero_contacto', header: 'Contacto' },
    { key: 'u_r_id', header: 'Rol', format: (v) => ({ 1: 'Admin', 2: 'Usuario', 3: 'Entrenador' }[v] || v) },
    { key: 'u_eg_id', header: 'Estado', format: (v) => (v === 1 ? 'Activo' : 'Inactivo') },
    { key: 'u_fecha_creacion', header: 'Fecha Registro', format: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '' }
  ];

  const handleExportPDF = () => {
    exportToPDF({
      data: filteredUsers,
      columns: exportColumns,
      title: 'Reporte de Usuarios - BodyHealth',
      filename: `usuarios_${new Date().toISOString().split('T')[0]}.pdf`,
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'left' }
      }
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      data: filteredUsers,
      columns: exportColumns,
      title: 'Reporte de Usuarios - BodyHealth',
      filename: `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`
    });
  };

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  // ── Carga de datos ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuarios();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudo conectar con la base de datos. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Modal ─────────────────────────────────────────────────────────────────
  const handleOpenModal = (user = null) => {
    setFormError('');
    if (user) {
      setEditingUser(user);
      setFormData({
        u_nombres: user.u_nombres || '',
        u_apellidos: user.u_apellidos || '',
        u_td_id: Number(user.u_td_id) || 1,
        u_numero_documento: user.u_numero_documento || '',
        u_correo_electronico: user.u_correo_electronico || '',
        u_contrasena: '',
        u_r_id: Number(user.u_r_id) || 1,
        u_numero_contacto: user.u_numero_contacto || '',
        u_eg_id: Number(user.u_eg_id) !== undefined ? Number(user.u_eg_id) : 1,
      });
    } else {
      setEditingUser(null);
      setFormData(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  // ── Validación ────────────────────────────────────────────────────────────
  const validate = () => {
    const errorMsg = validateUserRegistration({
      nombres: formData.u_nombres,
      apellidos: formData.u_apellidos,
      correo: formData.u_correo_electronico,
      idTipoDoc: formData.u_td_id,
      numeroDoc: formData.u_numero_documento,
      contacto: formData.u_numero_contacto,
      contrasena: editingUser ? undefined : formData.u_contrasena
    });

    if (errorMsg) {
      setFormError(errorMsg);
      return false;
    }
    setFormError('');
    return true;
  };

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingUser) {
        const updated = await updateUsuarioAdmin(editingUser.u_id, formData);
        // Reconstruir el objeto con los campos originales + los actualizados
        setUsers((prev) => prev.map((u) =>
          u.u_id === editingUser.u_id
            ? {
                ...u,
                u_nombres: updated?.u_nombres ?? formData.u_nombres,
                u_apellidos: updated?.u_apellidos ?? formData.u_apellidos,
                u_td_id: updated?.u_td_id ?? formData.u_td_id,
                u_numero_documento: updated?.u_numero_documento ?? formData.u_numero_documento,
                u_correo_electronico: updated?.u_correo_electronico ?? formData.u_correo_electronico,
                u_r_id: updated?.u_r_id ?? formData.u_r_id,
                u_numero_contacto: updated?.u_numero_contacto ?? formData.u_numero_contacto,
                u_eg_id: updated?.u_eg_id ?? formData.u_eg_id,
              }
            : u
        ));
        showToast('Usuario actualizado correctamente.', 'success');
      } else {
        const created = await createUsuario(formData);
        // Si el backend devuelve el user completo, usarlo; si no, construirlo del form
        const newUser = created?.u_id
          ? created
          : { ...formData, u_id: created?.u_id || `temp-${Date.now()}`, u_fecha_creacion: new Date().toISOString() };
        // Recargar para obtener el registro completo con u_id real
        await fetchUsers();
        showToast('Usuario creado correctamente.', 'success');
        handleCloseModal();
        return;
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      const msg = err?.response?.data?.message || 'Error al guardar. El correo o documento pueden estar duplicados.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario? Esta acción es irreversible.')) return;
    setDeleting(id);
    try {
      await deleteUsuario(id);
      setUsers((prev) => prev.filter((u) => u.u_id !== id));
      showToast('Usuario eliminado correctamente.', 'success');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      const msg = err?.response?.data?.message || 'No se pudo eliminar el usuario.';
      showToast(msg, 'error');
    } finally {
      setDeleting(null);
    }
  };

  // ── Filtros ───────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.u_nombres || ''} ${u.u_apellidos || ''}`.toLowerCase();
    const email = (u.u_correo_electronico || '').toLowerCase();
    const doc = String(u.u_numero_documento || '');
    const term = searchTerm.toLowerCase();
    const matchSearch = fullName.includes(term) || email.includes(term) || doc.includes(term);
    const rolLabel = getRol(u.u_r_id).label;
    const matchRole = roleFilter === 'Todos' || rolLabel === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Estadísticas ──────────────────────────────────────────────────────────
  const totalActivos = users.filter((u) => Number(u.u_eg_id) === 1).length;
  const totalAdmins = users.filter((u) => Number(u.u_r_id) === 1).length;
  const totalEntrenadores = users.filter((u) => Number(u.u_r_id) === 3).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <style>{`
        @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Administración
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Gestión de Usuarios
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            CRUD conectado a la base de datos — tabla <code style={{ background: '#f5f5f4', padding: '0.1em 0.4em', borderRadius: '4px', fontSize: '0.8em' }}>usuario</code>.
            Crea, edita y elimina cuentas con control de roles y estados.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            onClick={fetchUsers}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Recargar
          </button>
          <button
            className="btn-primary"
            onClick={() => handleOpenModal()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={16} />
            Añadir Usuario
          </button>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
              Total Usuarios
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{users.length}</span>
          </div>
          <span className="badge badge-success">Registrados</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
              Activos (u_eg_id = 1)
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{totalActivos}</span>
          </div>
          <span className="badge badge-primary">Estado OK</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
              Entrenadores
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{totalEntrenadores}</span>
          </div>
          <span className="badge badge-neutral">u_r_id = 3</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
              Administradores
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{totalAdmins}</span>
          </div>
          <span className="badge badge-error" style={{ fontSize: '0.65rem' }}>u_r_id = 1</span>
        </div>
      </section>

      {/* ── Barra de búsqueda y filtro ───────────────────────────────────── */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar por nombre, correo o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="admin-filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ROL:</span>
          <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="Todos">Todos</option>
            {ROLES.map((r) => (
              <option key={r.id} value={r.label}>{r.label} (u_r_id={r.id})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button
            className="btn-secondary"
            onClick={handleExportPDF}
            disabled={filteredUsers.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredUsers.length === 0 ? 0.5 : 1 }}
            title="Exportar a PDF"
          >
            <FileTextIcon size={15} />
            <span style={{ display: 'none' }}>PDF</span>
          </button>
          <button
            className="btn-secondary"
            onClick={handleExportExcel}
            disabled={filteredUsers.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredUsers.length === 0 ? 0.5 : 1 }}
            title="Exportar a Excel"
          >
            <FileSpreadsheet size={15} />
            <span style={{ display: 'none' }}>Excel</span>
          </button>
        </div>
      </div>

      {/* ── Error de carga ───────────────────────────────────────────────── */}
      {error && (
        <div style={{
          margin: '1rem 0', padding: '1rem 1.25rem',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          color: '#dc2626', fontSize: '0.875rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={fetchUsers} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={13} /> Usuario</div></th>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={13} /> Documento</div></th>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={13} /> Contacto</div></th>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={13} /> Rol</div></th>
                <th>Estado</th>
                <th>Registro</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', border: '3px solid var(--outline-variant)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: '0.875rem' }}>Cargando usuarios desde la base de datos...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={32} style={{ opacity: 0.3 }} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay usuarios registrados.'}
                      </span>
                      {!searchTerm && (
                        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                          Crear primero
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const rol = getRol(u.u_r_id);
                  const isActivo = Number(u.u_eg_id) === 1;

                  return (
                    <tr key={u.u_id} style={{ opacity: deleting === u.u_id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                      {/* Usuario */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${rol.bg}, ${rol.color}22)`,
                            border: `2px solid ${rol.color}33`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: '700', color: rol.color,
                            flexShrink: 0,
                          }}>
                            {(u.u_nombres || '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.1rem' }}>
                              {u.u_nombres} {u.u_apellidos}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: '#78716c' }}>{u.u_correo_electronico}</p>
                          </div>
                        </div>
                      </td>

                      {/* Documento */}
                      <td>
                        <div>
                          <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: '600' }}>
                            {u.u_numero_documento || '—'}
                          </p>
                          <p style={{ fontSize: '0.65rem', color: '#a8a29e' }}>
                            {getTipoDoc(u.u_td_id)} (u_td_id: {u.u_td_id})
                          </p>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#57534e', fontFamily: 'monospace' }}>
                          {u.u_numero_contacto || '—'}
                        </span>
                      </td>

                      {/* Rol */}
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          background: rol.bg, color: rol.color,
                          border: `1px solid ${rol.color}33`,
                          borderRadius: '999px', padding: '0.2rem 0.65rem',
                          fontSize: '0.7rem', fontWeight: '700',
                        }}>
                          {rol.id === 1 ? <Shield size={11} /> : rol.id === 3 ? <User size={11} /> : null}
                          {rol.label}
                        </span>
                      </td>

                      {/* Estado */}
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          background: isActivo ? '#f0fdf4' : '#fef2f2',
                          color: isActivo ? '#16a34a' : '#dc2626',
                          border: `1px solid ${isActivo ? '#bbf7d0' : '#fecaca'}`,
                          borderRadius: '999px', padding: '0.2rem 0.65rem',
                          fontSize: '0.7rem', fontWeight: '700',
                        }}>
                          {isActivo ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                          {isActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Fecha registro */}
                      <td>
                        <span style={{ fontSize: '0.7rem', color: '#78716c' }}>
                          {u.u_fecha_creacion
                            ? new Date(u.u_fecha_creacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
                            : '—'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            className="btn-icon"
                            onClick={() => handleOpenModal(u)}
                            title="Editar usuario"
                            disabled={deleting === u.u_id}
                          >
                            <Edit size={17} />
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDelete(u.u_id)}
                            title="Eliminar usuario"
                            disabled={deleting === u.u_id}
                          >
                            {deleting === u.u_id
                              ? <div style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                              : <Trash2 size={17} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.875rem 1.5rem', backgroundColor: '#fafaf9', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em' }}>
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </span>
          <span style={{ fontSize: '0.625rem', color: '#a8a29e' }}>
            Tabla: <code>usuario</code> — Base de datos PostgreSQL
          </span>
        </div>
      </section>

      {/* ── Modal Crear / Editar ─────────────────────────────────────────── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className="admin-modal-container" style={{ maxWidth: '560px' }}>
            {/* Header */}
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>
                  {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>
                  {editingUser
                    ? `Editando: ${editingUser.u_nombres} ${editingUser.u_apellidos} · ID: ${editingUser.u_id}`
                    : 'Todos los campos marcados con * son obligatorios.'}
                </p>
              </div>
              <button className="btn-icon" onClick={handleCloseModal} disabled={saving}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                {/* Error */}
                {formError && (
                  <div style={{
                    padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem',
                  }}>
                    <AlertCircle size={15} />
                    {formError}
                  </div>
                )}

                {/* Nombres + Apellidos */}
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Nombres * <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_nombres)</small></label>
                    <input
                      type="text" maxLength={35} className="admin-input"
                      value={formData.u_nombres}
                      onChange={(e) => setFormData({ ...formData, u_nombres: e.target.value })}
                      placeholder="Ej. Laura" required autoFocus
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Apellidos * <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_apellidos)</small></label>
                    <input
                      type="text" maxLength={35} className="admin-input"
                      value={formData.u_apellidos}
                      onChange={(e) => setFormData({ ...formData, u_apellidos: e.target.value })}
                      placeholder="Ej. Gómez" required
                    />
                  </div>
                </div>

                {/* Tipo Documento + Número Documento */}
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Tipo Doc. <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_td_id)</small></label>
                    <select className="admin-select" value={formData.u_td_id}
                      onChange={(e) => {
                        const newType = parseInt(e.target.value) || 1;
                        setFormData({
                          ...formData,
                          u_td_id: newType,
                          u_numero_documento: sanitizeDocumentInput(newType, formData.u_numero_documento)
                        });
                      }}>
                      {TIPOS_DOC.map((t) => (
                        <option key={t.id} value={t.id}>{t.id} — {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>N° Documento <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_numero_documento)</small></label>
                    <input
                      type="text" className="admin-input"
                      value={formData.u_numero_documento}
                      onChange={(e) => setFormData({ ...formData, u_numero_documento: sanitizeDocumentInput(formData.u_td_id, e.target.value) })}
                      placeholder={
                        Number(formData.u_td_id) === 1 ? "Ej. 1020304050 (10 dígitos)" :
                        Number(formData.u_td_id) === 2 ? "Ej. 123456 (6 ó 7 dígitos)" :
                        Number(formData.u_td_id) === 4 ? "Ej. 1098765432 (10 dígitos)" : "Ej. AB123456"
                      }
                    />
                  </div>
                </div>

                {/* Correo */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={12} /> Correo Electrónico * <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_correo_electronico)</small>
                  </label>
                  <input
                    type="email" maxLength={100} className="admin-input"
                    value={formData.u_correo_electronico}
                    onChange={(e) => setFormData({ ...formData, u_correo_electronico: e.target.value })}
                    placeholder="usuario@ejemplo.com" required
                  />
                </div>

                {/* Contraseña — solo al crear */}
                {!editingUser && (
                  <div className="admin-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Key size={12} /> Contraseña * <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_contrasena)</small>
                    </label>
                    <input
                      type="password" className="admin-input"
                      value={formData.u_contrasena}
                      onChange={(e) => setFormData({ ...formData, u_contrasena: e.target.value })}
                      placeholder="Mínimo 8 caracteres" required
                    />
                    <PasswordStrengthMeter password={formData.u_contrasena} />
                  </div>
                )}

                {/* Rol + Contacto */}
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Shield size={12} /> Rol del Sistema <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_r_id)</small>
                    </label>
                    <select className="admin-select" value={formData.u_r_id}
                      onChange={(e) => setFormData({ ...formData, u_r_id: parseInt(e.target.value) || 1 })}>
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>{r.id} — {r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={12} /> N° Contacto <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_numero_contacto)</small>
                    </label>
                    <input
                      type="text" className="admin-input" maxLength={10}
                      value={formData.u_numero_contacto}
                      onChange={(e) => setFormData({ ...formData, u_numero_contacto: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="Ej. 3001234567"
                    />
                  </div>
                </div>

                {/* Estado general */}
                <div className="admin-form-group">
                  <label>Estado General <small style={{ color: '#a8a29e', fontWeight: 400 }}>(u_eg_id)</small></label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                    {ESTADOS.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, u_eg_id: e.id })}
                        style={{
                          flex: 1, padding: '0.625rem 1rem',
                          borderRadius: '0.5rem', cursor: 'pointer',
                          fontWeight: '700', fontSize: '0.8rem',
                          border: `2px solid ${formData.u_eg_id === e.id
                            ? (e.id === 1 ? '#16a34a' : '#dc2626')
                            : 'var(--outline-variant)'}`,
                          background: formData.u_eg_id === e.id
                            ? (e.id === 1 ? '#f0fdf4' : '#fef2f2')
                            : '#fff',
                          color: formData.u_eg_id === e.id
                            ? (e.id === 1 ? '#16a34a' : '#dc2626')
                            : '#78716c',
                          transition: 'all 0.15s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        }}
                      >
                        {e.id === 1 ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        {e.id} — {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {saving
                    ? (<><div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Guardando...</>)
                    : (editingUser ? 'Guardar Cambios' : 'Crear Usuario')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosView;
