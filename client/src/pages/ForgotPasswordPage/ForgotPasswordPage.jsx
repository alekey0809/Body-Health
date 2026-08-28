import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { requestPasswordReset } from '../../services/userService';
import { validateEmail } from '../../utils/validationUtils';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!correo.trim() || !validateEmail(correo)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(correo);
      setSuccessMessage(res.message || 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.');
    } catch (err) {
      console.error('Error al solicitar recuperación:', err);
      const msg = err.response?.data?.message || 'Ocurrió un error al procesar tu solicitud. Intenta más tarde.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page-wrapper">
      <div className="forgot-modal-overlay">
        <div className="forgot-modal-content">

          <button onClick={() => navigate('/login')} className="close-btn" title="Volver al Login">
            <ArrowLeft size={24} />
          </button>

          <div className="modal-header">
            <div className="modal-icon-wrapper">
              <KeyRound size={48} className="modal-icon" />
            </div>
            <h2>¿Olvidaste tu Contraseña?</h2>
            <p>Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para restablecerla.</p>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {successMessage ? (
              <div className="success-container">
                <div className="alert alert-success">
                  <CheckCircle2 size={22} />
                  <div>
                    <strong>¡Solicitud procesada!</strong>
                    <p>{successMessage}</p>
                  </div>
                </div>
                <p className="success-hint">
                  Revisa tu bandeja de entrada o carpeta de spam. El enlace expira en 15 minutos.
                </p>
                <Link to="/login" className="submit-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: '1rem' }}>
                  VOLVER A INICIAR SESIÓN
                </Link>
              </div>
            ) : (
              <>
                <div className="form-group-spacing">
                  <div className="input-group">
                    <label htmlFor="correo">Correo Electrónico</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        id="correo"
                        name="correo"
                        placeholder="tu-correo@ejemplo.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                        autoFocus
                      />
                      <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline-variant)' }} />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
                </button>

                <div className="modal-footer-text">
                  <p>¿Recordaste tu contraseña? <Link to="/login" className="register-link">Iniciar Sesión</Link></p>
                </div>
              </>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
