
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogIn, User, Lock, ArrowLeft } from 'lucide-react'; // 1. Importamos ArrowLeft
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(correo, contrasena);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      
      {/* Botón flotante para regresar al Home */}
      <Link to="/main" className="btn-navbar-secondary" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        padding: '0.5rem 1rem'
      }}>
        <ArrowLeft size={18} /> Volver al Inicio
      </Link>

      <div className="glass-container" style={{ width: '100%', maxWidth: '400px', marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <LogIn style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Iniciar Sesión
        </h2>
        
        {error && <div style={{ color: '#ff6b76', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={20} />
              <input 
                type="email" 
                value={correo} 
                onChange={(e) => setCorreo(e.target.value)} 
                required 
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                placeholder="tu@correo.com"
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={20} />
              <input 
                type="password" 
                value={contrasena} 
                onChange={(e) => setContrasena(e.target.value)} 
                required 
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Cargando...' : 'Entrar al Dashboard'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;