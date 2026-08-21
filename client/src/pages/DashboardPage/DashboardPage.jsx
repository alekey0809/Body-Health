import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Activity, CreditCard, CalendarCheck, Dumbbell, Menu, X, LogOut, CheckCircle, PlusCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './DashboardPage.css';

const dataGrafica = [
  { name: 'Lun', calorias: 400 },
  { name: 'Mar', calorias: 300 },
  { name: 'Mie', calorias: 550 },
  { name: 'Jue', calorias: 200 },
  { name: 'Vie', calorias: 600 },
  { name: 'Sab', calorias: 700 },
  { name: 'Dom', calorias: 350 },
];

const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados de Asistencia
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const getUserId = () => user?.id || user?.u_id || user?._id;

  // Cargar estado de asistencia al montar el componente
  useEffect(() => {
    const currentUserId = getUserId();
    if (currentUserId) {
      fetchAttendanceData(currentUserId);
    }
  }, [user]);

  const fetchAttendanceData = async (activeUserId) => {
    const uid = activeUserId || getUserId();
    if (!uid) return;

    try {
      // 1. Obtener estado del día actual
      const statusRes = await api.get(`/api/asistencia/today/${uid}`);
      if (statusRes.data.ok) {
        setHasAttendedToday(statusRes.data.hasAttendedToday);
        setTodayRecord(statusRes.data.todayRecord);
      }

      // 2. Obtener historial completo de asistencias
      const historyRes = await api.get(`/api/asistencia/user/${uid}`);
      if (historyRes.data.ok) {
        setAttendances(historyRes.data.attendances);
      }
    } catch (err) {
      console.warn('Error al cargar datos de asistencia:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMobileLinkClick = (action) => {
    setIsMobileMenuOpen(false);
    if (action === 'planes') {
      navigate('/planes');
    } else if (action === 'perfil') {
      navigate('/perfil');
    } else {
      const element = document.getElementById(action);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Registrar asistencia directamente con 1 solo clic
  const handleRegisterAttendance = async () => {
    if (hasAttendedToday || isSubmitting) return;

    const currentUserId = getUserId();
    if (!currentUserId) {
      setFeedbackMessage('Error: No se encontró el ID del usuario en sesión.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage('');

    try {
      const response = await api.post('/api/asistencia/register', {
        userId: currentUserId
      });

      if (response.data.ok) {
        setHasAttendedToday(true);
        setTodayRecord(response.data.attendance);
        setFeedbackMessage('¡Asistencia registrada con éxito! ✓');
        // Actualizar el historial inmediatamente desde la BD
        fetchAttendanceData(currentUserId);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Error al registrar la asistencia';
      setFeedbackMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper para formatear fecha y hora
  const formatAttendanceDate = (dateStr) => {
    if (!dateStr) return { date: 'Hoy', time: '' };
    const dateObj = new Date(dateStr);
    const today = new Date();

    const isToday = dateObj.toDateString() === today.toDateString();
    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return { date: 'Hoy', time: formattedTime };
    }
    
    const formattedDate = dateObj.toLocaleDateString([], { day: '2-digit', month: 'short' });
    return { date: formattedDate, time: formattedTime };
  };

  if (!user) return <div className="dashboard-loading">Cargando datos del usuario...</div>;

  return (
    <div className="dashboard-layout">
      {/* Dashboard Topbar */}
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <Dumbbell className="topbar-logo-icon" />
          <h1 className="topbar-logo-text">BODYHEALT</h1>
        </div>
        <div className="topbar-right">
          <Link to="/planes" className="btn-secondary small-btn desktop-only">Ver Planes</Link>
          <button onClick={handleLogout} className="logout-text-btn desktop-only">Salir</button>
          
          {/* Toggle Hamburger Button */}
          <button 
            className="user-dashboard-hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Hamburger Menu */}
      {isMobileMenuOpen && (
        <div className="user-mobile-drawer">
          <nav className="user-mobile-nav">
            <button 
              onClick={() => handleMobileLinkClick('pagos')} 
              className="user-mobile-nav-link"
            >
              <CreditCard size={20} />
              <span>Pagos</span>
            </button>

            <button 
              onClick={() => handleMobileLinkClick('planes')} 
              className="user-mobile-nav-link"
            >
              <Dumbbell size={20} />
              <span>Planes</span>
            </button>

            <button 
              onClick={() => handleMobileLinkClick('perfil')} 
              className="user-mobile-nav-link"
            >
              <User size={20} />
              <span>Perfil</span>
            </button>

            <button 
              onClick={() => handleMobileLinkClick('asistencia')} 
              className="user-mobile-nav-link"
            >
              <CalendarCheck size={20} />
              <span>Asistencia</span>
            </button>

            <button 
              onClick={handleLogout} 
              className="user-mobile-nav-link danger"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      )}

      <main className="dashboard-main-content">
        <h2 className="dashboard-welcome">¡Hola, {user.nombre ? user.nombre.split(' ')[0] : 'Usuario'}! 👋</h2>
        
        <div className="dashboard-grid">
          
          {/* 1. Datos Personales */}
          <div className="dash-card" id="perfil">
            <div className="card-header">
              <User className="card-icon" /> 
              <h3>Mis Datos</h3>
            </div>
            <div className="card-body personal-data">
              <div className="data-row">
                <span className="data-label">Nombre:</span>
                <span className="data-value">{user.nombre}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Correo:</span>
                <span className="data-value">{user.correo}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Teléfono:</span>
                <span className="data-value">{user.contacto || 'No registrado'}</span>
              </div>
              <button onClick={() => navigate('/perfil')} className="btn-secondary card-btn">Editar Perfil</button>
            </div>
          </div>

          {/* 2. Gráficas (Salud/Progreso) */}
          <div className="dash-card dash-card-wide" id="progreso">
            <div className="card-header">
              <Activity className="card-icon" /> 
              <h3>Progreso de Actividad</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafica}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                  <XAxis dataKey="name" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="calorias" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Estado de Pagos */}
          <div className="dash-card" id="pagos">
            <div className="card-header">
              <CreditCard className="card-icon" /> 
              <h3>Estado de Pagos</h3>
            </div>
            <div className="card-body">
              <div className="payment-status-box">
                <div>
                  <p className="payment-plan">Membresía Trimestral</p>
                  <p className="payment-date">Vence: 15/Ago/2026</p>
                </div>
                <span className="status-badge-green">Al día</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn-secondary card-btn" style={{ flex: 1 }}>Historial</button>
                <button onClick={() => navigate('/planes')} className="btn-primary card-btn" style={{ flex: 1 }}>Renovar</button>
              </div>
            </div>
          </div>

          {/* 4. Control de Asistencias (1 Clic Directo por Día) */}
          <div className="dash-card" id="asistencia">
            <div className="card-header">
              <CalendarCheck className="card-icon" /> 
              <h3>Mis Asistencias</h3>
            </div>
            <div className="card-body">
              {/* Mensaje de confirmación temporal */}
              {feedbackMessage && (
                <div className={`asistencia-feedback-msg ${hasAttendedToday ? 'success' : 'error'}`}>
                  {feedbackMessage}
                </div>
              )}

              {/* Botón Directo de Marcar Asistencia de Hoy */}
              <div className="asistencia-action-box">
                {hasAttendedToday ? (
                  <button className="asistencia-btn asistencia-btn-completed" disabled>
                    <CheckCircle size={18} />
                    <span>Asistencia Registrada Hoy ✓</span>
                  </button>
                ) : (
                  <button 
                    className="asistencia-btn asistencia-btn-active" 
                    onClick={handleRegisterAttendance}
                    disabled={isSubmitting}
                  >
                    <PlusCircle size={18} />
                    <span>{isSubmitting ? 'Registrando...' : 'Marcar Asistencia de Hoy'}</span>
                  </button>
                )}
              </div>

              {/* Listado del Historial de Asistencias desde la BD */}
              <div className="attendance-history-title">Historial de Asistencias</div>
              {attendances.length === 0 ? (
                <p className="no-attendance-text">No has registrado asistencias aún.</p>
              ) : (
                <ul className="attendance-list">
                  {attendances.map((att) => {
                    const formatted = formatAttendanceDate(att.a_fecha_hora);
                    return (
                      <li key={att.a_id} className="attendance-item">
                        <div className="att-left">
                          <span className="att-day">{formatted.date}</span>
                          <span className="att-type-badge">Asistencia Confirmada ✓</span>
                        </div>
                        <div className="att-time flex-align-center">
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          {formatted.time}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
