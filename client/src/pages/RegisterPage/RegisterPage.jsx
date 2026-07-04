import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    idTipoDoc: 1, // Por defecto
    numeroDoc: '',
    correo: '',
    contrasena: '',
    idRol: 1, // Cliente por defecto
    contacto: '',
    idEstadoGen: 1 // Activo por defecto
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="glass-container" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <UserPlus style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Registro Body Health
        </h2>
        
        {error && <div style={{ color: '#ff6b76', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          
          <div className="input-group">
            <label>Nombres</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={18} />
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>
          
          <div className="input-group">
            <label>Apellidos</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={18} />
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Tipo Documento (ID)</label>
            <div style={{ position: 'relative' }}>
              <Hash style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={18} />
              <input type="number" name="idTipoDoc" value={formData.idTipoDoc} onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>
          
          <div className="input-group">
            <label>Número Documento</label>
            <div style={{ position: 'relative' }}>
              <Hash style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={18} />
              <input type="text" name="numeroDoc" value={formData.numeroDoc} onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>
          
          <div className="input-group">
            <label>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={18} />
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>
          
          <div className="input-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={18} />
              <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>
          
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Número de Contacto</label>
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', top: '12px', left: '10px', color: '#8a7c73' }} size={18} />
              <input type="text" name="contacto" value={formData.contacto} onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
