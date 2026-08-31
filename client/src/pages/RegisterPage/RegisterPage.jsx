import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { validateUserRegistration, sanitizeDocumentInput } from '../../utils/validationUtils';
import './RegisterPage.css';

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    idTipoDoc: 1, // Por defecto CC
    numeroDoc: '',
    correo: '',
    contrasena: '',
    idRol: 2, // Cliente por defecto
    contacto: '',
    idEstadoGen: 1 // Activo por defecto
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'numeroDoc') {
      const sanitized = sanitizeDocumentInput(formData.idTipoDoc, value);
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
    } else if (name === 'idTipoDoc') {
      const newTipoDoc = parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        idTipoDoc: newTipoDoc,
        numeroDoc: sanitizeDocumentInput(newTipoDoc, prev.numeroDoc)
      }));
    } else if (name === 'contacto') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, contacto: onlyDigits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateUserRegistration(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

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
    <div className="register-layout">
      {/* TopAppBar */}
      <header className="register-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={24} />
        </Link>
      </header>

      <main className="register-main">
        {/* Left Column: Editorial Content */}
        <section className="register-editorial">
          <div className="tag-pill">Unión y Bienestar</div>
          <h2 className="editorial-title">Crear Cuenta</h2>
          <p className="editorial-text">
            Únete a la comunidad de Bodyhealt y comienza tu viaje hacia una vida más saludable con nuestro equipo de expertos y tecnología de vanguardia.
          </p>
          
          <div className="editorial-image-container">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYGFYg2Sv1bcavwrUFAkyPI38PbziXkmOGdZ6dVyKe-1D2zWg4XOpO2v3eCTj095xOjkrKBO8oDAHh-cfQiwq9GivsGg8Y9N14YWokZ2BgGk3Fa8rwnbT0Z62AAL5OZAt4sMa_MKpX5Rf_SpGdJUw1z8wv-xVqFHEdYCMxmXt83n2ac0BnvL60t2umwCUeDqUKrQbTyAhNaHCjlrrVgoB3_3kSLjcseWvLGDtC1kG7sMScNvSzpR7MGqi700HFntNB7tHp82qtuRY" alt="Gym" />
            <div className="image-overlay"></div>
            <div className="image-quote">
              <p>"La excelencia no es un acto, sino un hábito."</p>
            </div>
          </div>
        </section>

        {/* Right Column: Registration Form */}
        <section className="register-form-section">
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.875rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombres">Nombres</label>
                <input type="text" id="nombres" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Ej. Juan Ignacio" required />
              </div>
              <div className="form-group">
                <label htmlFor="apellidos">Apellidos</label>
                <input type="text" id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ej. Pérez García" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico</label>
                <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} placeholder="juan@ejemplo.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="contacto">Número de Teléfono</label>
                <input type="tel" id="contacto" name="contacto" value={formData.contacto} onChange={handleChange} placeholder="Ej. 3000000000" maxLength={10} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idTipoDoc">Tipo de Documento</label>
                <select id="idTipoDoc" name="idTipoDoc" value={formData.idTipoDoc} onChange={handleChange} required>
                  <option value="1">Cédula de Ciudadanía (10 dígitos)</option>
                  <option value="2">Cédula de Extranjería (6 ó 7 dígitos)</option>
                  <option value="3">Pasaporte</option>
                  <option value="4">Tarjeta de Identidad (10 dígitos)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="numeroDoc">Número de Documento</label>
                <input 
                  type="text" 
                  id="numeroDoc" 
                  name="numeroDoc" 
                  value={formData.numeroDoc} 
                  onChange={handleChange} 
                  placeholder={
                    Number(formData.idTipoDoc) === 1 ? "Ej. 1020304050 (10 dígitos)" :
                    Number(formData.idTipoDoc) === 2 ? "Ej. 123456 (6 ó 7 dígitos)" :
                    Number(formData.idTipoDoc) === 4 ? "Ej. 1098765432 (10 dígitos)" : "Ej. AB123456"
                  } 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="contrasena">Contraseña del Sistema</label>
                <input 
                  type="password" 
                  id="contrasena" 
                  name="contrasena" 
                  value={formData.contrasena} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  required 
                />
                <PasswordStrengthMeter password={formData.contrasena} />
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem' }}>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
                {loading ? 'Procesando...' : 'Crear Cuenta'}
              </button>
              <p className="login-link-container">
                ¿Ya tienes una cuenta? <Link to="/login" className="login-link">Iniciar Sesión</Link>
              </p>
            </div>
            
            <div className="form-footer-links">
              <a href="#">Términos de Servicio</a>
              <span>•</span>
              <a href="#">Privacidad</a>
              <span>•</span>
              <a href="#">Ayuda</a>
            </div>
          </form>
        </section>
      </main>

      <footer className="register-footer">
        <div className="footer-content">
          <div className="footer-logo">BODYHEALT</div>
          <div className="footer-copy">© 2024 Bodyhealt Excellence in Fitness</div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;