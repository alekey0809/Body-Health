import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Activity, CreditCard, CalendarCheck, Settings, Dumbbell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <Link to="/planes" className="btn-secondary small-btn">Ver Planes</Link>
          <button onClick={handleLogout} className="logout-text-btn">Salir</button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <h2 className="dashboard-welcome">¡Hola, {user.nombre.split(' ')[0]}! 👋</h2>
        
        <div className="dashboard-grid">
          
          {/* 1. Datos Personales */}
          <div className="dash-card">
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
          <div className="dash-card dash-card-wide">
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
          <div className="dash-card">
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

          {/* 4. Control de Asistencias */}
          <div className="dash-card">
            <div className="card-header">
              <CalendarCheck className="card-icon" /> 
              <h3>Mis Asistencias</h3>
            </div>
            <div className="card-body">
              <ul className="attendance-list">
                <li className="attendance-item">
                  <span className="att-day">Hoy</span>
                  <span className="att-time">10:30 AM</span>
                </li>
                <li className="attendance-item">
                  <span className="att-day">Ayer</span>
                  <span className="att-time">09:15 AM</span>
                </li>
                <li className="attendance-item">
                  <span className="att-day">Hace 3 días</span>
                  <span className="att-time">06:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
