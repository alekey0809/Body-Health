import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Home, User, Dumbbell, CreditCard, LogOut, Menu, UserPlus, Edit, Trash2, Star, Shield } from 'lucide-react';
import './AdminDashboardPage.css';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h2 style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>Bodyhealt</h2>
            <p>Admin Terminal</p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvnaVFB5f-Np0XscOQ7ivAuKVccN4UGkoBugiTz10Q0CcrMmS9DZo0nbHV0wTRehUsDwhHgsBWis1QiMakmZeTOryDfE9hHjraMOH2rKC8UvITiGAitQTQ7DLUIOOkkacGGk2FeJkZAAh5iuvpRF-WDpP7A--mjV6X7KjUkQP9fOP3GrEgvguKxZlDKwaJqoo7eowjmKSeqIKQQJJvOpG6nKyeeqkjKyDdK_Z1whhbpbrnzx776gIPXtKillplANYbWAu6lvWVVZI" alt="Admin" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1c1917' }}>{user?.nombre || 'Admin User'}</p>
              <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '700' }}>Manager</p>
            </div>
          </div>

          <nav className="admin-nav">
            <Link to="/admin" className="nav-item active">
              <Home size={20} />
              <span className="nav-item-text">Inicio</span>
            </Link>
            <a href="#" className="nav-item">
              <User size={20} />
              <span className="nav-item-text">Entrenadores</span>
            </a>
            <a href="#" className="nav-item">
              <Dumbbell size={20} />
              <span className="nav-item-text">Planes</span>
            </a>
            <a href="#" className="nav-item">
              <CreditCard size={20} />
              <span className="nav-item-text">Pagos</span>
            </a>
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(216, 194, 191, 0.5)' }}>
            <button onClick={handleLogout} className="nav-item" style={{ color: 'var(--error)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <LogOut size={20} />
              <span className="nav-item-text">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ display: 'md:none', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'none' }}>Bodyhealt</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
              <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--error)' }}></span>
              <span style={{ fontSize: '0.625rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Panel Activo</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          <section className="page-title-section">
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Entrenadores</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
                Panel administrativo para la supervisión y edición de perfiles del equipo técnico.
              </p>
            </div>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.6875rem' }}>
              <UserPlus size={16} />
              Añadir Entrenador
            </button>
          </section>

          {/* Stats */}
          <section className="stats-grid">
            <div className="stat-card">
              <div>
                <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Entrenadores</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>24</span>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--primary)', backgroundColor: 'rgba(224, 23, 23, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>+2 hoy</span>
            </div>
            
            <div className="stat-card">
              <div>
                <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Clases Semanales</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>142</span>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--error)', backgroundColor: 'var(--error-container)', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>Capacidad 88%</span>
            </div>

            <div className="stat-card">
              <div>
                <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Satisfacción Media</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>4.9</span>
                  <Star size={16} color="var(--tertiary)" fill="var(--tertiary)" />
                </div>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: '500', color: 'var(--on-surface-variant)' }}>98 reviews</span>
            </div>
          </section>

          {/* Table */}
          <section className="data-table-container">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Entrenador</th>
                    <th>Especialidad</th>
                    <th>Clases / Sem</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f5f5f4' }}>
                           <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWT77s3Ob6BZ_xenDfI9nbBvd2AGw67CGVJCU-W2CPtT8tD9gJgGsB66E1HwSsLr5m-t7IBruM8st_NjQ0G2KYOUam-uugnG1SfT9n7xqmusBakEr0-ZrtMi-l5glHCly8ok8obLj8FwrMgOJmf4xe4Hyx1tKpyZ4ViEvVyKYfBPL-2jibpvKhKWRa0FF6QsNs_tiW4mdn7CqeVRaXGm2nPkS8asHJDOpPGM5gsJWUWEq_gW6BK2e5Tu1yWJoSGlyo14K7YNxXwRY" alt="Elena Valery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>Elena Valery</p>
                          <p style={{ fontSize: '0.625rem', color: '#78716c', textTransform: 'uppercase' }}>Senior Master</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '700', textTransform: 'uppercase' }}>Yoga</span>
                    </td>
                    <td><span style={{ fontFamily: 'Noto Serif', fontWeight: '700', color: 'var(--primary)' }}>12</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: '#57534e' }}>Disponible</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e' }}><Edit size={18} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f5f5f4' }}>
                           <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-bs7RshKDhpW-NLUqGFbm5UFILHotSGK9h8AQ_viIGuVW4QB1CRhFFrr5Y76OTI0pM3nb1BeKUP-A2sCOnkLe8U80Bj8jUuTMNjKUwRTLzeoLoosvnNW5xeZGK0bSspPC0VrkM_QNMWMq2-TjoPm5leBqCGoVien8FfDw596NySixOCUW2yFLExo1BucmFKVJNt5uVOPEus-4pUAKsqNFuhQdDK-3sjnX1z3aQG1JfUhmU7oPUaYQCnbpb7wk0Jh3ngCbTkxlexg" alt="Marcus Thorne" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>Marcus Thorne</p>
                          <p style={{ fontSize: '0.625rem', color: '#78716c', textTransform: 'uppercase' }}>Strength Lead</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e7e5e4', color: '#57534e', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '700', textTransform: 'uppercase' }}>HIIT</span>
                    </td>
                    <td><span style={{ fontFamily: 'Noto Serif', fontWeight: '700', color: 'var(--primary)' }}>18</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: '#57534e' }}>Ocupado</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e' }}><Edit size={18} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fafaf9', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em' }}>Mostrando 2 de 24 entrenadores</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--outline-variant)', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '700', backgroundColor: 'transparent', cursor: 'pointer' }}>Anterior</button>
                <button style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--outline-variant)', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '700', backgroundColor: 'transparent', cursor: 'pointer' }}>Siguiente</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
