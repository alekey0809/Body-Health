import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Dumbbell, CreditCard, Landmark, Lock, ShieldCheck } from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Si está logueado, pre-llenar. Si no, vacío.
  const [formData, setFormData] = useState({
    nombres: user?.nombre?.split(' ')[0] || '',
    apellidos: user?.nombre?.split(' ').slice(1).join(' ') || '',
    idTipoDoc: 1,
    numeroDoc: '',
    correo: user?.correo || '',
    contrasena: '', // Requerido si va a registrarse en el checkout
    contacto: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // card | pse
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Si el usuario no está logueado, intentamos registrarlo silenciosamente
      if (!user) {
        await register({
          ...formData,
          idRol: 1,
          idEstadoGen: 1
        });
        // Si el registro falla (ej. correo ya existe), el context tirará un error que podemos agarrar
      }

      // Simular tiempo de procesamiento de pago
      setTimeout(() => {
        setLoading(false);
        navigate('/payment-confirmation');
      }, 1500);

    } catch (error) {
      alert("Error al procesar: " + error);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-layout">
      <header className="checkout-header">
        <div className="header-container">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={24} />
          </button>
          <h1 className="checkout-title">Pagos</h1>
        </div>
      </header>

      <main className="checkout-main">
        {/* Banner Hero */}
        <div className="hero-banner">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb5gfWNV9Vg9B9sgiOtkRF9WCVlhoHChpfMOWWT35gLzxpqOTNQPHh3usz87IJh4b2eX3QOo5m3bGFZODcvt1aPNpcOia2pp_ipvL-iNSOLkLzqNlILQPDFA3i1j2oiXSI89TF2qhd3bm7gf3nnmL3OPDW9vh7Xli9aw2G2Y8gajBipQQ7UjLXrB0xoSh-b1kqB070zjwOIoDGAQa9N5g6rLbwlSML4aDWEadZ5FFzL9Wusv1lXq_3FE50FfSQPGKVboxfuqFCT80" alt="Gym" />
          <div className="hero-overlay"></div>
          <div className="hero-badge">
            <span>Bodyhealt Premium</span>
          </div>
        </div>

        <form onSubmit={handleCheckout}>
          <div className="checkout-grid">
            
            {/* Columna Izquierda: Información de Usuario */}
            <section className="user-info-section">
              <h2 className="section-title">Información del Usuario</h2>
              <p className="section-subtitle">Completa la información de la persona que usará el plan</p>
              
              <div className="form-container">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombres</label>
                    <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Apellidos</label>
                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} required disabled={!!user} />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="contacto" value={formData.contacto} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo Documento</label>
                    <select name="idTipoDoc" value={formData.idTipoDoc} onChange={handleChange}>
                      <option value="1">Cédula de Ciudadanía</option>
                      <option value="2">Cédula de Extranjería</option>
                      <option value="3">Pasaporte</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Número Documento</label>
                    <input type="text" name="numeroDoc" value={formData.numeroDoc} onChange={handleChange} required />
                  </div>
                </div>

                {/* Pedir contraseña solo si es usuario nuevo para crearle cuenta */}
                {!user && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Crear Contraseña para tu cuenta</label>
                      <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="••••••••" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Columna Derecha: Resumen de Compra y Pasarela */}
            <div className="payment-column">
              <section className="summary-section">
                <h2 className="section-title">Resumen de Compra</h2>
                <div className="summary-card">
                  <div className="summary-left">
                    <div className="icon-box">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="plan-name">Plan Trimestral</p>
                      <p className="plan-duration">Vence en 90 días</p>
                    </div>
                  </div>
                  <div className="summary-right">
                    <p className="plan-price">$37.500</p>
                    <p className="tax-text">IVA Incluido</p>
                  </div>
                </div>
              </section>

              <section className="payment-methods-section">
                <h2 className="section-title">Método de pago</h2>
                <div className="methods-container">
                  <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="hidden-radio" />
                    <div className="radio-circle"></div>
                    <div className="method-info">
                      <CreditCard size={20} className={paymentMethod === 'card' ? 'icon-selected' : 'icon-default'} />
                      <span>Tarjeta de Crédito o Débito</span>
                    </div>
                  </label>

                  {/* UI sencilla de tarjeta si está seleccionada */}
                  {paymentMethod === 'card' && (
                    <div className="card-form">
                      <div className="form-group">
                        <input type="text" placeholder="Número de Tarjeta" required />
                      </div>
                      <div className="form-row" style={{ marginTop: '1rem' }}>
                        <div className="form-group">
                          <input type="text" placeholder="MM/YY" required />
                        </div>
                        <div className="form-group">
                          <input type="text" placeholder="CVC" required />
                        </div>
                      </div>
                    </div>
                  )}

                  <label className={`method-option ${paymentMethod === 'pse' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="pse" checked={paymentMethod === 'pse'} onChange={() => setPaymentMethod('pse')} className="hidden-radio" />
                    <div className="radio-circle"></div>
                    <div className="method-info">
                      <Landmark size={20} className={paymentMethod === 'pse' ? 'icon-selected' : 'icon-default'} />
                      <span>PSE (Transferencia Bancaria)</span>
                    </div>
                  </label>
                </div>
              </section>

              <div className="security-banner">
                <ShieldCheck size={20} color="var(--tertiary)" />
                <p>Tus pagos están protegidos con encriptación de grado militar. No almacenamos los datos sensibles de tus tarjetas.</p>
              </div>
            </div>

          </div>

          <footer className="checkout-footer">
            <div className="footer-container">
              <button type="submit" disabled={loading} className="btn-primary pay-button">
                {loading ? 'Procesando Pago...' : 'Confirmar y Pagar $37.500'}
                {!loading && <Lock size={20} />}
              </button>
              <p className="footer-disclaimer">Procesado por Bodyhealt Payment Gateway</p>
            </div>
          </footer>

        </form>
      </main>
    </div>
  );
};

export default CheckoutPage;
