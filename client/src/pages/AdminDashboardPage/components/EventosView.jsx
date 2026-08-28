import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, X, Bell, Users, AlertCircle } from 'lucide-react';
import { getEventos, createEvento, updateEvento, deleteEvento } from '../../../services/eventoService';
import { AuthContext } from '../../../context/AuthContext';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const EventosView = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    ev_nombre: '',
    ev_descripcion: '',
    ev_fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // mañana por defecto
  });

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const data = await getEventos();
      setEvents(data || []);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleOpenModal = (event = null) => {
    setErrorMessage('');
    if (event) {
      setEditingEvent(event);
      // Formatear fecha para input datetime-local
      const fecha = event.ev_fecha_hora 
        ? new Date(event.ev_fecha_hora).toISOString().slice(0, 16)
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      setFormData({
        ev_nombre: event.ev_nombre || '',
        ev_descripcion: event.ev_descripcion || '',
        ev_fecha_hora: fecha,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        ev_nombre: '',
        ev_descripcion: '',
        ev_fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setErrorMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.ev_nombre.trim() || !formData.ev_fecha_hora) {
      setErrorMessage('El nombre y la fecha/hora del evento son requeridos.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      if (editingEvent) {
        await updateEvento(editingEvent.ev_id, {
          ...formData
        });
      } else {
        await createEvento({
          ...formData,
          ev_u_id: user?.u_id || null
        });
      }
      await fetchEventos();
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar evento:', err);
      setErrorMessage(err.response?.data?.message || 'Ocurrió un error al guardar el evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        await deleteEvento(id);
        await fetchEventos();
      } catch (err) {
        console.error('Error al eliminar evento:', err);
        alert('No se pudo eliminar el evento.');
      }
    }
  };

  const filteredEvents = events.filter(e => {
    const nombre = e.ev_nombre || '';
    const descripcion = e.ev_descripcion || '';
    const autor = e.autor_nombre || '';

    const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          autor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const eventosFuturos = events.filter(e => new Date(e.ev_fecha_hora) >= new Date()).length;
  const eventosPasados = events.filter(e => new Date(e.ev_fecha_hora) < new Date()).length;

  // Columnas para exportación
  const exportColumns = [
    { key: 'ev_id', header: 'ID', format: (v) => `#${v}` },
    { key: 'ev_nombre', header: 'Nombre' },
    { key: 'ev_descripcion', header: 'Descripción', format: (v) => v ? v.substring(0, 100) + (v.length > 100 ? '...' : '') : '' },
    { key: 'autor_nombre', header: 'Creado por', format: (v) => v || 'Admin BodyHealth' },
    { key: 'ev_fecha_hora', header: 'Fecha y Hora', format: (v) => v ? new Date(v).toLocaleString('es-CO') : 'Sin fecha' },
    { key: 'ev_fecha_creacion', header: 'Fecha Creación', format: (v) => v ? new Date(v).toLocaleString('es-CO') : 'Sin fecha' },
  ];

  const handleExportPDF = () => {
    exportToPDF({
      data: filteredEvents,
      columns: exportColumns,
      title: 'Reporte de Eventos - BodyHealth',
      filename: `eventos_${new Date().toISOString().split('T')[0]}.pdf`,
      orientation: 'landscape',
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left', cellWidth: 40 },
        2: { halign: 'left', cellWidth: 70 }
      }
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      data: filteredEvents,
      columns: exportColumns,
      title: 'Reporte de Eventos - BodyHealth',
      filename: `eventos_${new Date().toISOString().split('T')[0]}.xlsx`
    });
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const dateStrFormatted = date.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long' 
    });

    if (isToday) return `Hoy a las ${timeStr}`;
    if (isTomorrow) return `Mañana a las ${timeStr}`;
    return `${dateStrFormatted} a las ${timeStr}`;
  };

  const getEventStatus = (dateStr) => {
    if (!dateStr) return { label: 'Sin fecha', className: 'badge-warning' };
    const date = new Date(dateStr);
    const now = new Date();
    
    if (date < now) {
      return { label: 'Finalizado', className: 'badge-secondary' };
    }
    
    const diffHours = (date - now) / (1000 * 60 * 60);
    if (diffHours <= 24) {
      return { label: 'Próximo', className: 'badge-warning' };
    }
    return { label: 'Programado', className: 'badge-primary' };
  };

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Eventos</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Crea y gestiona eventos del gimnasio. Al crear un evento, se genera automáticamente una notificación para el administrador.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          Nuevo Evento
        </button>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Eventos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{events.length}</span>
          </div>
          <span className="badge badge-primary">Base de Datos</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Próximos (Futuros)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif', color: 'var(--primary)' }}>{eventosFuturos}</span>
          </div>
          <span className="badge badge-success">Visibles a usuarios</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Finalizados</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{eventosPasados}</span>
          </div>
          <span className="badge badge-secondary">Historial</span>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar por nombre, descripción o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button
            className="btn-secondary"
            onClick={handleExportPDF}
            disabled={filteredEvents.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredEvents.length === 0 ? 0.5 : 1 }}
            title="Exportar a PDF"
          >
            <AlertCircle size={15} />
          </button>
          <button
            className="btn-secondary"
            onClick={handleExportExcel}
            disabled={filteredEvents.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredEvents.length === 0 ? 0.5 : 1 }}
            title="Exportar a Excel"
          >
            <Users size={15} />
          </button>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Nombre / Descripción</th>
                <th>Creado por</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    Cargando eventos de la base de datos...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron eventos.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e) => {
                  const status = getEventStatus(e.ev_fecha_hora);
                  const formattedDate = formatEventDate(e.ev_fecha_hora);

                  return (
                    <tr key={e.ev_id}>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#78716c', fontFamily: 'monospace' }}>#{e.ev_id}</span>
                      </td>
                      <td>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1c1917', marginBottom: '0.25rem' }}>{e.ev_nombre}</p>
                          {e.ev_descripcion && (
                            <p style={{ fontSize: '0.75rem', color: '#78716c', maxWidth: '24rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {e.ev_descripcion}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#57534e', fontWeight: '500' }}>
                          {e.autor_nombre || 'Admin BodyHealth'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} color="#78716c" />
                          <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{formattedDate}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button className="btn-icon" onClick={() => handleOpenModal(e)} title="Editar"><Edit size={18} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete(e.ev_id)} title="Eliminar"><Trash2 size={18} /></button>
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

      {/* Modal Agregar / Editar Evento */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>{editingEvent ? 'Editar Evento' : 'Añadir Nuevo Evento'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            {errorMessage && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', fontSize: '0.875rem', borderRadius: '4px', margin: '1rem 1rem 0 1rem' }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nombre del Evento *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.ev_nombre}
                    onChange={(e) => setFormData({ ...formData, ev_nombre: e.target.value })}
                    placeholder="Ej. Clase de Yoga Matutina, Torneo de CrossFit, Charla Nutrición"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Fecha y Hora del Evento *</label>
                  <input
                    type="datetime-local"
                    className="admin-input"
                    value={formData.ev_fecha_hora}
                    onChange={(e) => setFormData({ ...formData, ev_fecha_hora: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Descripción</label>
                  <textarea
                    className="admin-textarea"
                    rows="4"
                    value={formData.ev_descripcion}
                    onChange={(e) => setFormData({ ...formData, ev_descripcion: e.target.value })}
                    placeholder="Describe los detalles del evento, requisitos, qué traer, etc."
                  />
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Bell size={18} color="#92400e" style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem', color: '#92400e' }}>
                      <strong>Notificación automática:</strong> Al guardar este evento, se creará una notificación en el centro de notificaciones del administrador que lo creó, indicando el tipo "EVENTO_CREADO".
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosView;