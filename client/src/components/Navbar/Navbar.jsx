import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/main" style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ff8c94' }}>
          Body Health
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/main" style={{ color: '#5c4d44', fontWeight: '600' }}>Inicio</Link>
          <a href="#" style={{ color: '#5c4d44', fontWeight: '600' }}>Servicios</a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/dashboard" className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={18} /> Mi Dashboard
            </Link>
            <button onClick={logout} className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#ffb3ba', color: '#ff6b76' }}>
              <LogOut size={18} /> Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogIn  size={18} /> Iniciar Sesión
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', width: 'auto' }}>
              <UserPlus size={18} /> Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
