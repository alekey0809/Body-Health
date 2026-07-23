import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Dumbbell, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // No mostrar navbar en login, registro, checkout ni admin
  const hideNavbarRoutes = ['/login', '/register', '/checkout', '/payment-confirmation', '/admin'];
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="global-navbar">
      <div className="navbar-container">
        <Link to="/main" className="navbar-brand" onClick={closeMobileMenu}>
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
            <div className="user-nav-group">
               <Link to={user.u_r_id === 1 ? "/admin" : "/dashboard"} className="nav-link" style={{ fontWeight: '700' }}>
                 Dashboard
               </Link>
               <button onClick={handleLogout} className="logout-text-btn">Salir</button>
            </div>
          ) : (
             <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}>
                Cuenta
            </Link>
          )}
        </div>

        {/* Toggle Hamburger Button */}
        <button 
          className="navbar-hamburger-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <nav className="mobile-nav-links">
            <a href="/main#planes" className="mobile-nav-link" onClick={closeMobileMenu}>Planes</a>
            <a href="/main#ubicacion" className="mobile-nav-link" onClick={closeMobileMenu}>Ubicación</a>
            <a href="/main#noticias" className="mobile-nav-link" onClick={closeMobileMenu}>Noticias</a>
          </nav>
          <div className="mobile-nav-actions">
            {user ? (
              <div className="mobile-user-actions">
                <Link to={user.u_r_id === 1 ? "/admin" : "/dashboard"} className="mobile-nav-link active-link" onClick={closeMobileMenu}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="logout-text-btn">Salir</button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.85rem' }} onClick={closeMobileMenu}>
                Cuenta
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

