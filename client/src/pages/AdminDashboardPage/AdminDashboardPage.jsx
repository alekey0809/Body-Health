import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Home, User, Dumbbell, CreditCard, Users, FileText, LogOut, Menu, X, LayoutDashboard, ExternalLink, Calendar, Database } from 'lucide-react';
import './AdminDashboardPage.css';
import { useNavigate } from 'react-router-dom';

import InicioView from './components/InicioView';
import EntrenadoresView from './components/EntrenadoresView';
import PlanesView from './components/PlanesView';
import PagosView from './components/PagosView';
import UsuariosView from './components/UsuariosView';
import PublicacionesView from './components/PublicacionesView';
import RutinasView from './components/RutinasView';
import RespaldoView from './components/RespaldoView';
import EventosView from './components/EventosView';
  
const AdminDashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Desktop */}
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
            <button
              onClick={() => setActiveTab('inicio')}
              className={`nav-item ${activeTab === 'inicio' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Home size={20} />
              <span className="nav-item-text">Inicio Admin</span>
            </button>

            <button
              onClick={() => setActiveTab('entrenadores')}
              className={`nav-item ${activeTab === 'entrenadores' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <User size={20} />
              <span className="nav-item-text">Entrenadores</span>
            </button>

            <button
              onClick={() => setActiveTab('planes')}
              className={`nav-item ${activeTab === 'planes' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Dumbbell size={20} />
              <span className="nav-item-text">Planes</span>
            </button>

            <button
              onClick={() => setActiveTab('pagos')}
              className={`nav-item ${activeTab === 'pagos' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <CreditCard size={20} />
              <span className="nav-item-text">Pagos</span>
            </button>

            <button
              onClick={() => setActiveTab('eventos')}
              className={`nav-item ${activeTab === 'eventos' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Calendar size={20} />
              <span className="nav-item-text">Eventos</span>
            </button>

            <button
              onClick={() => setActiveTab('usuarios')}
              className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Users size={20} />
              <span className="nav-item-text">Usuarios</span>
            </button>

            <button
              onClick={() => setActiveTab('publicaciones')}
              className={`nav-item ${activeTab === 'publicaciones' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <FileText size={20} />
              <span className="nav-item-text">Publicaciones</span>
            </button>

            <button
              onClick={() => setActiveTab('rutinas')}
              className={`nav-item ${activeTab === 'rutinas' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Calendar size={20} />
              <span className="nav-item-text">Rutinas PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('respaldo')}
              className={`nav-item ${activeTab === 'respaldo' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Database size={20} />
              <span className="nav-item-text">Respaldo BD</span>
            </button>
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(216, 194, 191, 0.5)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="nav-item" 
              style={{ color: '#0284c7', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <LayoutDashboard size={20} />
              <span className="nav-item-text">Ir a Dashboard Usuario</span>
            </button>
            <button 
              onClick={() => navigate('/main')} 
              className="nav-item" 
              style={{ color: '#57534e', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <ExternalLink size={20} />
              <span className="nav-item-text">Ver Landing Page</span>
            </button>
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
            <button 
              className="admin-hamburger-btn" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="admin-header-title">BODYHEALT ADMIN</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
              <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--error)' }}></span>
              <span style={{ fontSize: '0.625rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Panel Activo</span>
            </div>
          </div>
        </header>

        {/* Mobile Hamburger Drawer */}
        {isMobileMenuOpen && (
          <div className="admin-mobile-drawer">
            <nav className="admin-mobile-nav">
              <button
                onClick={() => { setActiveTab('inicio'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'inicio' ? 'active' : ''}`}
              >
                <Home size={20} />
                <span>Inicio Admin</span>
              </button>

              <button
                onClick={() => { setActiveTab('entrenadores'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'entrenadores' ? 'active' : ''}`}
              >
                <User size={20} />
                <span>Entrenadores</span>
              </button>

              <button
                onClick={() => { setActiveTab('planes'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'planes' ? 'active' : ''}`}
              >
                <Dumbbell size={20} />
                <span>Planes</span>
              </button>

              <button
                onClick={() => { setActiveTab('pagos'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
              >
                <CreditCard size={20} />
                <span>Pagos</span>
              </button>

              <button
                onClick={() => { setActiveTab('eventos'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'eventos' ? 'active' : ''}`}
              >
                <Calendar size={20} />
                <span>Eventos</span>
              </button>

              <button
                onClick={() => { setActiveTab('usuarios'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'usuarios' ? 'active' : ''}`}
              >
                <Users size={20} />
                <span>Usuarios</span>
              </button>

              <button
                onClick={() => { setActiveTab('publicaciones'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'publicaciones' ? 'active' : ''}`}
              >
                <FileText size={20} />
                <span>Publicaciones</span>
              </button>

              <button
                onClick={() => { setActiveTab('rutinas'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'rutinas' ? 'active' : ''}`}
              >
                <Calendar size={20} />
                <span>Rutinas PDF</span>
              </button>

              <button
                onClick={() => { setActiveTab('respaldo'); setIsMobileMenuOpen(false); }}
                className={`admin-mobile-nav-link ${activeTab === 'respaldo' ? 'active' : ''}`}
              >
                <Database size={20} />
                <span>Respaldo BD</span>
              </button>

              <button
                onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                className="admin-mobile-nav-link"
                style={{ color: '#0284c7' }}
              >
                <LayoutDashboard size={20} />
                <span>Ir al Dashboard Usuario</span>
              </button>

              <button
                onClick={() => { navigate('/main'); setIsMobileMenuOpen(false); }}
                className="admin-mobile-nav-link"
              >
                <ExternalLink size={20} />
                <span>Ver Landing Page</span>
              </button>

              <button
                onClick={handleLogout}
                className="admin-mobile-nav-link danger"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        )}

        {/* Content Area */}
        <div className="admin-content">
          {activeTab === 'inicio' && <InicioView setActiveTab={setActiveTab} />}
          {activeTab === 'entrenadores' && <EntrenadoresView />}
          {activeTab === 'planes' && <PlanesView />}
          {activeTab === 'pagos' && <PagosView />}
          {activeTab === 'usuarios' && <UsuariosView />}
          {activeTab === 'publicaciones' && <PublicacionesView />}
          {activeTab === 'rutinas' && <RutinasView />}
          {activeTab === 'respaldo' && <RespaldoView />}
          {activeTab === 'eventos' && <EventosView />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
