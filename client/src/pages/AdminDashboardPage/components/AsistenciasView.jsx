import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, X, Edit, Trash2, Calendar, User,
  AlertCircle, RefreshCw, FileSpreadsheet, FileText as FileTextIcon,
  ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { getAllAttendancesAdmin, updateAttendanceAdmin, deleteAttendanceAdmin } from '../../../services/asistenciaService';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const ESTADOS_ASISTENCIA = [
  { id: 'confirmada', label: 'Confirmada', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'anulada', label: 'Anulada', color: '#dc2626', bg: '#fef2f2' },
  { id: 'corregida', label: 'Corregida', color: '#0369a1', bg: '#e0f2fe' },
];

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

const AsistenciasView = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [toast, setToast] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [editObservacion, setEditObservacion] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAttendancesAdmin();
      if (data.ok) {
        const attendancesWithStatus = (data.attendances || []).map(a => ({
          ...a,
          estado: a.a_observacion?.toLowerCase().includes('anulada') ? 'anulada' :
                  a.a_observacion?.toLowerCase().includes('correg') ? 'corregida' : 'confirmada'
        }));
        setAttendances(attendancesWithStatus);
      } else {
        setError(data.message || 'Error al cargar asistencias');
      }
    } catch (err) {
      console.error('Error al cargar asistencias:', err);
      setError('No se pudo conectar con la base de datos. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAttendances(); }, [fetchAttendances]);

  const filteredAttendances = attendances.filter((a) => {
    const fullName = `${a.u_nombres || ''} ${a.u_apellidos || ''}`.toLowerCase();
    const email = (a.u_correo_electronico || '').toLowerCase();
    const doc = String(a.u_numero_documento || '');
    const term = searchTerm.toLowerCase();
    const matchSearch = fullName.includes(term) || email.includes(term) || doc.includes(term);
    
    const matchDate = !dateFilter || (a.a_fecha_hora && new Date(a.a_fecha_hora).toISOString().split('T')[0] === dateFilter);
    const matchStatus = statusFilter === 'Todos' || a.estado === statusFilter;
    
    return matchSearch && matchDate && matchStatus;
  });

  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);
  const paginatedAttendances = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenEdit = (attendance) => {
    setEditingAttendance(attendance);
    setEditObservacion(attendance.a_observacion || '');
  };

  const handleCloseEdit = () => {
    if (saving) return;
    setEditingAttendance(null);
    setEditObservacion('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAttendance) return;
    setSaving(true);
    try {
      const result = await updateAttendanceAdmin(editingAttendance.a_id, editObservacion);
      if (result.ok) {
        setAttendances(prev => prev.map(a => 
          a.a_id === editingAttendance.a_id 
            ? { ...a, a_observacion: editObservacion, estado: editObservacion.toLowerCase().includes('anulada') ? 'anulada' : editObservacion.toLowerCase().includes('correg') ? 'corregida' : 'confirmada' }
            : a
        ));
        showToast('Asistencia actualizada correctamente.', 'success');
        handleCloseEdit();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      showToast(err.response?.data?.message || 'Error al actualizar la asistencia.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta asistencia? Esta acción es irreversible.')) return;
    setDeleting(id);
    try {
      const result = await deleteAttendanceAdmin(id);
      if (result.ok) {
        setAttendances(prev => prev.filter(a => a.a_id !== id));
        showToast('Asistencia eliminada correctamente.', 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      showToast(err.response?.data?.message || 'No se pudo eliminar la asistencia.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleExportPDF = () => {
    const columns = [
      { key: 'a_fecha_hora', header: 'Fecha/Hora', format: (v) => v ? new Date(v).toLocaleString('es-CO') : '' },
      { key: 'u_nombres', header: 'Nombres' },
      { key: 'u_apellidos', header: 'Apellidos' },
      { key: 'u_correo_electronico', header: 'Correo' },
      { key: 'u_numero_documento', header: 'Documento' },
      { key: 'estado', header: 'Estado', format: (v) => ESTADOS_ASISTENCIA.find(e => e.id === v)?.label || v },
      { key: 'a_observacion', header: 'Observación' },
    ];
    exportToPDF({
      data: filteredAttendances,
      columns,
      title: 'Reporte de Asistencias - BodyHealth',
      filename: `asistencias_${new Date().toISOString().split('T')[0]}.pdf`,
    });
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'a_fecha_hora', header: 'Fecha/Hora', format: (v) => v ? new Date(v).toLocaleString('es-CO') : '' },
      { key: 'u_nombres', header: 'Nombres' },
      { key: 'u_apellidos', header: 'Apellidos' },
      { key: 'u_correo_electronico', header: 'Correo' },
      { key: 'u_numero_documento', header: 'Documento' },
      { key: 'estado', header: 'Estado', format: (v) => ESTADOS_ASISTENCIA.find(e => e.id === v)?.label || v },
      { key: 'a_observacion', header: 'Observación' },
    ];
    exportToExcel({
      data: filteredAttendances,
      columns,
      title: 'Reporte de Asistencias - BodyHealth',
      filename: `asistencias_${new Date().toISOString().split('T')[0]}.xlsx`,
    });
  };

  const getStatusBadge = (estado) => {
    const config = ESTADOS_ASISTENCIA.find(e => e.id === estado) || ESTADOS_ASISTENCIA[0];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: config.bg, color: config.color,
        border: `1px solid ${config.color}33`,
        borderRadius: '999px', padding: '0.2rem 0.65rem',
        fontSize: '0.65rem', fontWeight: '700',
      }}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('es-CO', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

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
            Ajustar Manualmente las Asistencias
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Módulo para corregir/anular registros de asistencia por fallos técnicos. 
            Visualiza, edita observaciones y elimina registros incorrectos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            onClick={fetchAttendances}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Recargar
          </button>
          <button
            className="btn-secondary"
            onClick={handleExportPDF}
            disabled={filteredAttendances.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredAttendances.length === 0 ? 0.5 : 1 }}
            title="Exportar a PDF"
          >
            <FileTextIcon size={15} />
          </button>
          <button
            className="btn-secondary"
            onClick={handleExportExcel}
            disabled={filteredAttendances.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredAttendances.length === 0 ? 0.5 : 1 }}
            title="Exportar a Excel"
          >
            <FileSpreadsheet size={15} />
          </button>
        </div>
      </section>

      {/* ── Barra de búsqueda y filtros ───────────────────────────────────── */}
      <div className="admin-toolbar">
        <div className="admin-search-box" style={{ flex: 1, maxWidth: '400px' }}>
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
        <div className="admin-filter-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>FECHA:</span>
          <input
            type="date"
            className="admin-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ width: '160px' }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ESTADO:</span>
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '140px' }}>
            <option value="Todos">Todos</option>
            {ESTADOS_ASISTENCIA.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
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
          <button onClick={fetchAttendances} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
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
                <th style={{ width: '160px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={13} /> Fecha / Hora</div></th>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={13} /> Usuario</div></th>
                <th style={{ width: '200px' }}>Correo</th>
                <th style={{ width: '140px' }}>Documento</th>
                <th style={{ width: '120px' }}>Estado</th>
                <th>Observación</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', border: '3px solid var(--outline-variant)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: '0.875rem' }}>Cargando asistencias desde la base de datos...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedAttendances.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={32} style={{ opacity: 0.3 }} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {searchTerm || dateFilter || statusFilter !== 'Todos' ? 'Sin resultados para los filtros actuales' : 'No hay asistencias registradas.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAttendances.map((a) => (
                  <tr key={a.a_id} style={{ opacity: deleting === a.a_id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {formatDateTime(a.a_fecha_hora)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)',
                          flexShrink: 0,
                        }}>
                          {(a.u_nombres || '?')[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                          {a.u_nombres} {a.u_apellidos}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e' }}>
                        {a.u_correo_electronico || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#78716c' }}>
                        {a.u_numero_documento || '—'}
                      </span>
                    </td>
                    <td>{getStatusBadge(a.estado)}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e', maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.a_observacion || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {editingAttendance?.a_id === a.a_id ? (
                          <>
                            <form onSubmit={handleSaveEdit} style={{ display: 'flex', gap: '0.4rem' }}>
                              <input
                                type="text"
                                className="admin-input"
                                value={editObservacion}
                                onChange={(e) => setEditObservacion(e.target.value)}
                                placeholder="Observación..."
                                style={{ width: '200px', fontSize: '0.75rem' }}
                                autoFocus
                              />
                              <button type="submit" className="btn-icon" disabled={saving} title="Guardar" style={{ color: '#16a34a', padding: '0.35rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>OK</span>
                              </button>
                              <button type="button" className="btn-icon" onClick={handleCloseEdit} disabled={saving} title="Cancelar" style={{ color: '#78716c', padding: '0.35rem' }}>
                                <X size={15} />
                              </button>
                            </form>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-icon"
                              onClick={() => handleOpenEdit(a)}
                              title="Editar observación"
                              disabled={deleting === a.a_id || saving}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon danger"
                              onClick={() => handleDelete(a.a_id)}
                              title="Eliminar asistencia"
                              disabled={deleting === a.a_id || saving}
                            >
                              {deleting === a.a_id
                                ? <div style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                : <Trash2 size={16} />
                              }
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ padding: '0.875rem 1.5rem', backgroundColor: '#fafaf9', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em' }}>
              Mostrando {paginatedAttendances.length} de {filteredAttendances.length} asistencias (Página {currentPage} de {totalPages})
            </span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                className="btn-icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div style={{ padding: '0.875rem 1.5rem', backgroundColor: '#fafaf9', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em' }}>
            Total: {filteredAttendances.length} asistencias
          </span>
          <span style={{ fontSize: '0.625rem', color: '#a8a29e' }}>
            Tabla: <code>asistencia</code> + <code>usuario</code> — PostgreSQL
          </span>
        </div>
      </section>

      {/* Leyenda de estados */}
      <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fafaf9', borderTop: '1px solid var(--outline-variant)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.7rem' }}>
        {ESTADOS_ASISTENCIA.map(e => (
          <span key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: e.bg, border: `2px solid ${e.color}`,
            }} />
            {e.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AsistenciasView;