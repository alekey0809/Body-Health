import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, Dumbbell, Calendar, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-brand">
          <Dumbbell className="brand-icon" />
          <h1 className="dashboard-logo">BODYHEALT</h1>
        </div>
        <div className="header-actions">
          <div className="user-profile">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDObkVnZ7kIfgJgJBqgnx1ICfy-d7ah8ZiYeBpyCMqzDXzkfu6TnBWKubdU8x_ZR-240Dbt5nHtmYvWrs3Jq2DyeDCmL5lZbLlEcFB5yg57OUGOlmw23rkg0eKkJ5uGfR9J2EiUuHDohXbTsFpCmPHx5FMEUyBduh_JiGSM_6JLcR1mXFbHgdCDTvuJg7w7GeIJP0hIXFFjLzoJ7-As4OLNGt2a0OAKTVbThkBTUrWxMTcZaDJNNFrlDbZxb15Zj3rkDOcJZx0wgG0" alt="Avatar" className="user-avatar" />
            <div className="user-info-text">
              <span className="user-name">{user?.nombre || 'Usuario'}</span>
              <span className="user-role">Miembro Premium</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <div className="welcome-text">
            <h2>Bienvenido a tu Curaduría, {user?.nombre?.split(' ')[0] || 'Atleta'}</h2>
            <p>Aquí tienes el resumen de tu progreso y beneficios de esta semana.</p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="glass-container stat-card">
            <div className="stat-icon-wrapper red-wrapper">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">12</span>
              <span className="stat-label">Clases Asistidas</span>
            </div>
          </div>
          <div className="glass-container stat-card">
            <div className="stat-icon-wrapper orange-wrapper">
              <Target size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">4</span>
              <span className="stat-label">Metas Cumplidas</span>
            </div>
          </div>
          <div className="glass-container stat-card">
            <div className="stat-icon-wrapper yellow-wrapper">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">Trimestral</span>
              <span className="stat-label">Plan Activo</span>
            </div>
          </div>
        </section>

        <section className="dashboard-content-grid">
          <div className="glass-container content-card">
            <h3>Próximas Sesiones</h3>
            <div className="session-list">
              <div className="session-item">
                <div className="session-time">
                  <span className="time-strong">07:00 AM</span>
                  <span className="date-weak">Mañana</span>
                </div>
                <div className="session-details">
                  <h4>Yoga Flow Avanzado</h4>
                  <p>Salón Zen • Elena Valery</p>
                </div>
                <button className="btn-secondary small-btn">Cancelar</button>
              </div>
              <div className="session-item">
                <div className="session-time">
                  <span className="time-strong">18:30 PM</span>
                  <span className="date-weak">Jueves</span>
                </div>
                <div className="session-details">
                  <h4>Powerlifting Masterclass</h4>
                  <p>Zona Fuerza • Marcus Thorne</p>
                </div>
                <button className="btn-secondary small-btn">Cancelar</button>
              </div>
            </div>
            <button className="btn-primary full-btn" style={{ marginTop: '1.5rem' }}>Reservar Nueva Sesión</button>
          </div>

          <div className="glass-container content-card">
            <h3>Tu Progreso Físico</h3>
            <div className="progress-metrics">
              <div className="metric-group">
                <div className="metric-header">
                  <span>Resistencia Cardiovascular</span>
                  <span>78%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: '78%', background: 'linear-gradient(90deg, #e01717, #f66b0e)' }}></div>
                </div>
              </div>
              <div className="metric-group">
                <div className="metric-header">
                  <span>Fuerza Core</span>
                  <span>65%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: '65%', background: 'linear-gradient(90deg, #f66b0e, #ffcc00)' }}></div>
                </div>
              </div>
            </div>
            <div className="coach-note">
              <strong>Nota del Entrenador:</strong> Excelente mejora en tu ritmo cardíaco en recuperación. Sigamos trabajando la fuerza de agarre.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
