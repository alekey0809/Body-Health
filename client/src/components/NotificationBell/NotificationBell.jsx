import React, { useState, useContext } from 'react';
import { Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getNoLeidasCount } from '../../services/notificacionService';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user?.u_id) return;
    try {
      const count = await getNoLeidasCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error al contar no leídas:', err);
    }
  };

  // Fetch on mount and when user changes
  React.useEffect(() => {
    setMounted(true);
    fetchUnreadCount();
  }, [user?.u_id]);

  // Poll for updates every 30 seconds
  React.useEffect(() => {
    if (!user?.u_id) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.u_id]);

  const handleNotificationClick = (notif) => {
    // Si la notificación tiene un evento relacionado, podríamos navegar a la vista del evento
    if (notif.n_evento_id) {
      console.log('Navegar a evento:', notif.n_evento_id);
      // Podrías usar navigate aquí si tienes acceso al router
    }
    // Cerrar el panel después de click
    setIsOpen(false);
  };

  if (!mounted || !user) return null;

  return (
    <div className="notification-bell-wrapper">
      <button 
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} notificaciones sin leer`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};

export default NotificationBell;