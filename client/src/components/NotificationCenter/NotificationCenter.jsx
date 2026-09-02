import React, { useState, useEffect, useContext } from 'react';
import { Bell, X, Check, CheckCircle, Mail, AlertCircle, Calendar, Clock, Trash2, Eye, Filter, Loader2 } from 'lucide-react';
import { getNotificaciones, marcarLeida, marcarTodasLeidas, deleteNotificacion, getNoLeidasCount } from '../../services/notificacionService';
import { AuthContext } from '../../context/AuthContext';

const NotificationCenter = ({ isOpen, onClose, onNotificationClick }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('todas'); // 'todas', 'no-leidas', 'eventos', 'membresia'
  const [saving, setSaving] = useState(null); // ID de notificación que se está procesando

  const userId = user?.u_id || user?.id;

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getNotificaciones({ limit: 50 });
      setNotifications(data || []);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;
    try {
      const count = await getNoLeidasCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error al contar no leídas:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, userId]);

  const handleMarkRead = async (id) => {
    setSaving(id);
    try {
      await marcarLeida(id);
      setNotifications(prev => prev.map(n => n.n_id === id ? { ...n, n_leida: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    } finally {
      setSaving(null);
    }
  };

  const handleMarkAllRead = async () => {
    setSaving('all');
    try {
      await marcarTodasLeidas();
      setNotifications(prev => prev.map(n => ({ ...n, n_leida: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta notificación?')) return;
    setSaving(id);
    try {
      await deleteNotificacion(id);
      setNotifications(prev => prev.filter(n => n.n_id !== id));
      if (notifications.find(n => n.n_id === id)?.n_leida === false) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
    } finally {
      setSaving(null);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'no-leidas') return !n.n_leida;
    if (filter === 'eventos') return n.n_tipo_evento === 'EVENTO_CREADO';
    if (filter === 'membresia') return ['MEMBRESIA_POR_VENCER', 'MEMBRESIA_VENCIDA'].includes(n.n_tipo_evento);
    return true;
  });

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'EVENTO_CREADO': return <Calendar size={16} color="var(--primary)" />;
      case 'MEMBRESIA_POR_VENCER': return <AlertCircle size={16} color="#f59e0b" />;
      case 'MEMBRESIA_VENCIDA': return <AlertCircle size={16} color="var(--error)" />;
      default: return <Bell size={16} color="var(--on-surface-variant)" />;
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'EVENTO_CREADO': return 'Evento';
      case 'MEMBRESIA_POR_VENCER': return 'Membresía por vencer';
      case 'MEMBRESIA_VENCIDA': return 'Membresía vencida';
      default: return 'Información';
    }
  };

  const getTipoBadgeClass = (tipo) => {
    switch (tipo) {
      case 'EVENTO_CREADO': return 'badge-primary';
      case 'MEMBRESIA_POR_VENCER': return 'badge-warning';
      case 'MEMBRESIA_VENCIDA': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notification-header">
          <div className="header-left">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Bell size={20} />
              Centro de Notificaciones
            </h3>
            {unreadCount > 0 && (
              <span className="badge badge-error" style={{ fontSize: '0.625rem' }}>
                {unreadCount} sin leer
              </span>
            )}
          </div>
          <div className="header-right">
            {unreadCount > 0 && (
              <button 
                className="btn-text" 
                onClick={handleMarkAllRead}
                disabled={saving === 'all'}
                style={{ fontSize: '0.75rem' }}
              >
                {saving === 'all' ? <Loader2 size={14} className="spin" /> : 'Marcar todas como leídas'}
              </button>
            )}
            <button className="btn-icon" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="notification-filters">
          <button 
            className={`filter-btn ${filter === 'todas' ? 'active' : ''}`}
            onClick={() => setFilter('todas')}
          >
            Todas
          </button>
          <button 
            className={`filter-btn ${filter === 'no-leidas' ? 'active' : ''}`}
            onClick={() => setFilter('no-leidas')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={14} />
              No leídas
              {unreadCount > 0 && <span className="filter-badge">{unreadCount}</span>}
            </span>
          </button>
          <button 
            className={`filter-btn ${filter === 'eventos' ? 'active' : ''}`}
            onClick={() => setFilter('eventos')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} />
              Eventos
            </span>
          </button>
          <button 
            className={`filter-btn ${filter === 'membresia' ? 'active' : ''}`}
            onClick={() => setFilter('membresia')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={14} />
              Membresía
            </span>
          </button>
        </div>

        {/* List */}
        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">
              <Loader2 size={24} className="spin" />
              <span>Cargando notificaciones...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              <Bell size={48} style={{ opacity: 0.3 }} />
              <p>No hay notificaciones</p>
              <span className="empty-hint">
                {filter === 'no-leidas' ? '¡Todo al día!' : 'Intenta con otro filtro'}
              </span>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.n_id} 
                className={`notification-item ${!notif.n_leida ? 'unread' : ''}`}
                style={{ borderLeftColor: !notif.n_leida ? 'var(--primary)' : 'transparent' }}
              >
                <div className="notification-content" onClick={() => {
                  if (!notif.n_leida) handleMarkRead(notif.n_id);
                  onNotificationClick?.(notif);
                }}>
                  <div className="notification-icon" style={{ backgroundColor: !notif.n_leida ? 'var(--primary-container)' : 'var(--surface-container-high)' }}>
                    {getTipoIcon(notif.n_tipo_evento)}
                  </div>
                  <div className="notification-details" style={{ flex: 1, minWidth: 0 }}>
                    <div className="notification-title-row">
                      <h4 className="notification-title">{notif.n_titulo}</h4>
                      <span className={`badge ${getTipoBadgeClass(notif.n_tipo_evento)} notification-type-badge`}>
                        {getTipoLabel(notif.n_tipo_evento)}
                      </span>
                    </div>
                    <p className="notification-message">{notif.n_mensaje}</p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        <Clock size={12} />
                        {formatDate(notif.n_fecha_envio)}
                      </span>
                      {!notif.n_leida && (
                        <span className="notification-unread-indicator">
                          <CheckCircle size={12} />
                          Nueva
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="notification-actions">
                  {!notif.n_leida && !saving && (
                    <button 
                      className="btn-icon small" 
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.n_id); }}
                      title="Marcar como leída"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button 
                    className="btn-icon small danger" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.n_id); }}
                    title="Eliminar"
                    disabled={saving === notif.n_id}
                  >
                    {saving === notif.n_id ? <Loader2 size={14} className="spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="notification-footer">
          <button className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;