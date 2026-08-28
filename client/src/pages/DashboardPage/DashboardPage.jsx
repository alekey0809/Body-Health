import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Activity, CreditCard, CalendarCheck, Dumbbell, Menu, X, LogOut, CheckCircle, PlusCircle, Clock, History, XCircle, FileText, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getMembresiasByUsuario } from '../../services/pagoService';
import './DashboardPage.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
  const [hasActiveMembership, setHasActiveMembership] = useState(true);
  const [membershipInfo, setMembershipInfo] = useState(null);

  // Estados de Historial de Pagos
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentStats, setPaymentStats] = useState({ total: 0, vigentes: 0, vencidas: 0 });
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);

  // Estados de Rutina PDF
  const [rutinaPdfExists, setRutinaPdfExists] = useState(false);
  const [rutinaLoading, setRutinaLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(() => new Date().getDay() || 7); // 1=Lunes, 7=Domingo

  useEffect(() => {
    checkRutinaPdf();
  }, [currentDay]);

  const checkRutinaPdf = async () => {
    setRutinaLoading(true);
    try {
      const res = await api.get(`/api/rutinas/status/all`);
      if (res.data.ok) {
        const dayData = res.data.days.find(d => d.day === currentDay);
        setRutinaPdfExists(dayData?.exists || false);
      }
    } catch (err) {
      console.warn('Error al verificar rutina PDF:', err);
      setRutinaPdfExists(false);
    } finally {
      setRutinaLoading(false);
    }
  };

  const openRutinaPdf = () => {
    window.open(`${BACKEND_URL}/api/rutinas/${currentDay}`, '_blank');
  };

  const getDayName = (day) => {
    const names = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return names[day] || '';
  };

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

    console.log('🔍 fetchAttendanceData called with uid:', uid);

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

      // 3. Verificar membresía activa
      const membershipRes = await api.get(`/api/asistencia/membership/${uid}`);
      console.log('🔍 Membership response:', membershipRes.data);
      if (membershipRes.data.ok) {
        setHasActiveMembership(membershipRes.data.hasActiveMembership);
        setMembershipInfo(membershipRes.data.membership);
      }
    } catch (err) {
      console.warn('Error al cargar datos de asistencia:', err);
    }
  };

  const fetchPaymentHistory = async () => {
    const currentUserId = getUserId();
    if (!currentUserId) return;

    setLoadingPaymentHistory(true);
    try {
      const data = await getMembresiasByUsuario(currentUserId);
      setPaymentHistory(data.membresias || data);
      setPaymentStats({
        total: data.total || data.length,
        vigentes: data.vigentes || data.filter(m => m.es_vigente).length,
        vencidas: data.vencidas || data.filter(m => !m.es_vigente).length
      });
    } catch (err) {
      console.error('Error al cargar historial de pagos:', err);
    } finally {
      setLoadingPaymentHistory(false);
    }
  };

  const handleOpenPaymentHistory = () => {
    setShowPaymentHistory(true);
    fetchPaymentHistory();
  };

  const handleClosePaymentHistory = () => {
    setShowPaymentHistory(false);
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
    console.log('🔍 handleRegisterAttendance - currentUserId:', currentUserId);
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
      console.log('🔍 Register attendance response:', response.data);

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
      
      // Si el error es 403 (requiere pago), actualizar estado de membresía
      if (err.response?.status === 403 && err.response?.data?.requiresPayment) {
        setHasActiveMembership(false);
        setMembershipInfo(err.response.data);
        setTimeout(() => {
          navigate('/planes');
        }, 3000);
      }
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
          <Link to="/main" className="btn-secondary small-btn desktop-only">Ir al Landing</Link>
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
              onClick={() => { setIsMobileMenuOpen(false); navigate('/main'); }} 
              className="user-mobile-nav-link"
            >
              <Activity size={20} />
              <span>Ir al Landing</span>
            </button>

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
                {membershipInfo ? (
                  <>
                    <div>
                      <p className="payment-plan">{membershipInfo.pe_nombre}</p>
                      <p className="payment-date">
                        {hasActiveMembership ? 'Vence: ' : 'Venció: '}
                        {new Date(membershipInfo.m_fecha_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`status-badge ${hasActiveMembership ? 'status-badge-green' : 'status-badge-red'}`}>
                      {hasActiveMembership ? 'Al día' : 'Vencida'}
                    </span>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="payment-plan">Sin Membresía Activa</p>
                      <p className="payment-date">No registra pagos</p>
                    </div>
                    <span className="status-badge status-badge-red">Sin Membresía</span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  className="btn-secondary card-btn" 
                  style={{ flex: 1 }}
                  onClick={handleOpenPaymentHistory}
                >
                  <History size={14} style={{ marginRight: '4px' }} />
                  Historial
                </button>
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

              {/* Alerta si no tiene membresía activa */}
              {!hasActiveMembership && (
                <div className="asistencia-feedback-msg error" style={{ marginBottom: '1rem' }}>
                  <strong>⚠ Sin membresía activa</strong> - {membershipInfo?.message || 'Debes tener una membresía vigente para registrar asistencia.'}
                  <button 
                    onClick={() => navigate('/planes')} 
                    className="btn-primary card-btn" 
                    style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}
                  >
                    Ver Planes
                  </button>
                </div>
              )}

              {/* Botón Directo de Marcar Asistencia de Hoy */}
              <div className="asistencia-action-box">
                {hasAttendedToday ? (
                  <button className="asistencia-btn asistencia-btn-completed" disabled>
                    <CheckCircle size={18} />
                    <span>Asistencia Registrada Hoy ✓</span>
                  </button>
                ) : !hasActiveMembership ? (
                  <button className="asistencia-btn asistencia-btn-disabled" disabled>
                    <Clock size={18} />
                    <span>Membresía requerida para marcar asistencia</span>
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
           
           {/* 5. Rutina del Día (PDF) */}
           <div className="dash-card" id="rutina">
             <div className="card-header">
               <FileText className="card-icon" /> 
               <h3>Rutina de Hoy</h3>
             </div>
             <div className="card-body">
               <div className="rutina-card-content">
                 <div className="rutina-day-info">
                   <span className="rutina-day-label">Día actual:</span>
                   <span className="rutina-day-name">{getDayName(currentDay)}</span>
                 </div>
                 {rutinaLoading ? (
                   <div className="rutina-loading">Verificando rutina...</div>
                 ) : rutinaPdfExists ? (
                   <div className="rutina-available">
                     <p className="rutina-message">Hay una rutina disponible para hoy</p>
                     <button className="btn-primary card-btn rutina-open-btn" onClick={openRutinaPdf}>
                       <FileText size={16} style={{ marginRight: '6px' }} />
                       Abrir PDF en nueva pestaña
                       <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                     </button>
                   </div>
                 ) : (
                   <div className="rutina-unavailable">
                     <p className="rutina-message">No hay rutina subida para hoy</p>
                     <p className="rutina-hint">El administrador debe subir el PDF correspondiente</p>
                   </div>
                 )}
               </div>
             </div>
           </div>
           
         </div>
      </main>

      {/* Modal Historial de Pagos */}
      {showPaymentHistory && (
        <div className="payment-history-modal-overlay" onClick={handleClosePaymentHistory}>
          <div className="payment-history-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="payment-history-modal-header">
              <h3>
                <History size={20} />
                Historial de Compras
              </h3>
              <button className="close-modal-btn" onClick={handleClosePaymentHistory} aria-label="Cerrar">
                <XCircle size={24} />
              </button>
            </div>

            <div className="payment-history-modal-body">
              {loadingPaymentHistory ? (
                <div className="payment-history-loading">Cargando historial...</div>
              ) : paymentHistory.length === 0 ? (
                <div className="payment-history-empty">
                  <CreditCard size={48} />
                  <p>No has realizado compras aún</p>
                  <button className="btn-primary" onClick={() => { handleClosePaymentHistory(); navigate('/planes'); }}>
                    Ver Planes Disponibles
                  </button>
                </div>
              ) : (
                <>
                  {/* Stats Summary */}
                  <div className="payment-history-stats">
                    <div className="stat-item">
                      <span className="stat-value">{paymentStats.total}</span>
                      <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-item active">
                      <span className="stat-value">{paymentStats.vigentes}</span>
                      <span className="stat-label">Vigentes</span>
                    </div>
                    <div className="stat-item expired">
                      <span className="stat-value">{paymentStats.vencidas}</span>
                      <span className="stat-label">Vencidas</span>
                    </div>
                  </div>

                  <ul className="payment-history-list">
                    {paymentHistory.map((membresia) => (
                      <li key={membresia.m_id || membresia.f_id} className="payment-history-item">
                        <div className="payment-item-main">
                          <div className="payment-item-info">
                            <span className="payment-plan-name">{membresia.plan?.pe_nombre || membresia.pe_nombre}</span>
                            <span className="payment-date">
                              {new Date(membresia.factura?.f_fecha_hora || membresia.f_fecha_hora).toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className={`payment-status-badge ${membresia.es_vigente ? 'status-approved' : 'status-cancelled'}`}>
                            {membresia.es_vigente ? 'Vigente' : 'Vencida'}
                          </span>
                        </div>
                        <div className="payment-item-details">
                          <span className="payment-amount">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(membresia.factura?.f_valor_total || membresia.f_valor_total)}
                          </span>
                          {membresia.fecha_vencimiento && (
                            <span className={`payment-expiry ${!membresia.es_vigente ? 'expired' : ''}`}>
                              {membresia.es_vigente ? 'Vence: ' : 'Venció: '}
                              {new Date(membresia.fecha_vencimiento).toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          <span className="payment-status-text">
                            Pago: {membresia.factura?.estado_pago || membresia.estado_pago || '—'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions para el estado del pago
const getPaymentStatusText = (epId) => {
  const statusMap = {
    1: 'PENDIENTE',
    2: 'APROBADO',
    3: 'RECHAZADO',
    4: 'EN PROCESO',
    5: 'ANULADO'
  };
  return statusMap[epId] || 'DESCONOCIDO';
};

const getPaymentStatusClass = (epId) => {
  const classMap = {
    1: 'status-pending',
    2: 'status-approved',
    3: 'status-rejected',
    4: 'status-processing',
    5: 'status-cancelled'
  };
  return classMap[epId] || 'status-unknown';
};

export default DashboardPage;
