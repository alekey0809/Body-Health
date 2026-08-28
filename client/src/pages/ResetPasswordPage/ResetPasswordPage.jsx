import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { resetPassword } from '../../services/userService';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { validatePassword } from '../../utils/validationUtils';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    contrasena: '',
    confirmContrasena: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('El token de restablecimiento es inválido o ha caducado. Vuelve a solicitar el enlace.');
      return;
    }

    // 1. Validar reglas de contraseña segura
    const passVal = validatePassword(formData.contrasena);
    if (!passVal.isValid) {
      setError(passVal.errorMessage);
      return;
    }

    // 2. Validar coincidencia de contraseñas
    if (formData.contrasena !== formData.confirmContrasena) {
      setError('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, formData.contrasena);
      setSuccess(true);
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      const msg = err.response?.data?.message || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page-wrapper">
      <div className="reset-modal-overlay">
        <div className="reset-modal-content">

          <div className="modal-header">
            <div className="modal-icon-wrapper">
              <ShieldCheck size={48} className="modal-icon" />
            </div>
            <h2>Restablecer Contraseña</h2>
            <p>Crea tu nueva contraseña de acceso segura para BodyHealth.</p>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {!token && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>No se encontró un token válido en el enlace. Solicita nuevamente la recuperación.</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="success-container">
                <div className="alert alert-success">
                  <CheckCircle2 size={24} />
                  <div>
                    <strong>¡Contraseña Actualizada!</strong>
                    <p>Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva clave.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="submit-btn"
                  style={{ marginTop: '1rem' }}
                >
                  IR A INICIAR SESIÓN
                </button>
              </div>
            ) : (
              <>
                <div className="form-group-spacing">
                  {/* Nueva Contraseña */}
                  <div className="input-group">
                    <label htmlFor="contrasena">Nueva Contraseña</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="contrasena"
                        name="contrasena"
                        placeholder="••••••••"
                        value={formData.contrasena}
                        onChange={handleChange}
                        required
                        disabled={!token}
                      />
                      <button type="button" className="toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={formData.contrasena} />
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="input-group" style={{ marginTop: '0.5rem' }}>
                    <label htmlFor="confirmContrasena">Confirmar Nueva Contraseña</label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmContrasena"
                        name="confirmContrasena"
                        placeholder="••••••••"
                        value={formData.confirmContrasena}
                        onChange={handleChange}
                        required
                        disabled={!token}
                      />
                      <button type="button" className="toggle-pwd-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading || !token} className="submit-btn" style={{ marginTop: '1rem' }}>
                  {loading ? 'RESTABLECIENDO...' : 'CAMBIAR CONTRASEÑA'}
                </button>

                <div className="modal-footer-text">
                  <p>¿Recordaste tu contraseña? <Link to="/login" className="register-link">Volver al Login</Link></p>
                </div>
              </>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
