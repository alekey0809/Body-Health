import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Dumbbell } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // No mostrar navbar en login, registro, checkout ni admin
  const hideNavbarRoutes = ['/login', '/register', '/checkout', '/payment-confirmation', '/admin'];
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="global-navbar">
      <div className="navbar-container">
        <Link to="/main" className="navbar-brand">
          <Dumbbell className="brand-icon" size={28} />
          <span className="brand-text">Bodyhealt</span>
        </Link>
        
        <nav className="navbar-links">
          <a href="/main#planes" className="nav-link">Planes</a>
          <a href="/main#ubicacion" className="nav-link">Ubicación</a>
          <a href="/main#noticias" className="nav-link">Noticias</a>
        </nav>
        
        <div className="navbar-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <Link to={user.idRol === 2 ? "/admin" : "/dashboard"} className="nav-link" style={{ fontWeight: '700' }}>
                 Dashboard
               </Link>
               <button onClick={handleLogout} className="logout-text-btn">Salir</button>
            </div>
          ) : (
             <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}>
                Inscribite
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
