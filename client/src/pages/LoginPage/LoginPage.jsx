import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Eye, EyeOff, Award } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.correo, formData.contrasena);
      // AuthContext.jsx ya maneja la redirección al dashboard (AppRouter)
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Background Content (Simulated Home Page) */}
      <div className="background-simulation">
        <header className="bg-header">
          <div className="bg-header-left">
            <Menu className="text-primary" size={24} />
            <h1 className="bg-brand">BODYHEALT</h1>
          </div>
          <div className="bg-avatar">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDObkVnZ7kIfgJgJBqgnx1ICfy-d7ah8ZiYeBpyCMqzDXzkfu6TnBWKubdU8x_ZR-240Dbt5nHtmYvWrs3Jq2DyeDCmL5lZbLlEcFB5yg57OUGOlmw23rkg0eKkJ5uGfR9J2EiUuHDohXbTsFpCmPHx5FMEUyBduh_JiGSM_6JLcR1mXFbHgdCDTvuJg7w7GeIJP0hIXFFjLzoJ7-As4OLNGt2a0OAKTVbThkBTUrWxMTcZaDJNNFrlDbZxb15Zj3rkDOcJZx0wgG0" alt="Avatar" />
          </div>
        </header>

        <main className="bg-main">
          <section className="bg-hero">
            <div className="bg-hero-image-wrapper">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1o4uWOjh1G3UFD93jC898Jwsdf_nE8xcruxE5jPuBQPdR_uOHfFG6Oj1iC0I8ukB0hKZk6HC5SGfqtb8s4jxDleiozfe2Ujonp8xq0NuSfkWwiiJWJMucmPwhPRLvJA1TIsvWsw_sGxyZcavCTJ0KKD7uFvAAzMa8gGmYRA27wLYTvx397KFMPOcknnisZyDd5Crn2MYxFT3Q4jGjWGXcUhn4pjgociLT16AS3ubfFUJH13CVpAwxinAF5kNz-JZP01S8AgCRoP4" alt="Yoga studio" />
              <div className="bg-hero-overlay">
                <span className="bg-badge">Editorial Selection</span>
                <h2>Elevate Your Physical Intelligence.</h2>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Login Modal Overlay */}
      <div className="login-modal-overlay">
        <div className="login-modal-content">
          
          <button onClick={() => navigate('/main')} className="close-btn">
            <X size={24} />
          </button>

          <div className="modal-header">
            <div className="modal-icon-wrapper">
              <Award size={48} className="modal-icon" />
            </div>
            <h2>Iniciar Sesión</h2>
            <p>Regresa a tu curaduría de bienestar personal.</p>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group-spacing">
              <div className="input-group">
                <label htmlFor="correo">Email</label>
                <input 
                  type="email" 
                  id="correo" 
                  name="correo" 
                  placeholder="bodyhealt@editorial.com" 
                  value={formData.correo} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-group">
                <label htmlFor="contrasena">Contraseña</label>
                <div className="password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="contrasena" 
                    name="contrasena" 
                    placeholder="••••••••" 
                    value={formData.contrasena} 
                    onChange={handleChange} 
                    required 
                  />
                  <button type="button" className="toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="remember-forgot-row">
              <label className="remember-me">
                <div className="custom-checkbox">
                  <input type="checkbox" className="peer-checkbox" />
                  <div className="checkbox-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-mark">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <span>Recordarme</span>
              </label>
              
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'INGRESANDO...' : 'ENTRAR'}
            </button>

            <div className="modal-footer-text">
              <p>¿No tienes una cuenta? <Link to="/register" className="register-link">Registrarme</Link></p>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;