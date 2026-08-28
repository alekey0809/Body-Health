import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Dumbbell, CreditCard, Landmark, Lock, ShieldCheck } from 'lucide-react';
import { getPlanById } from '../../services/planService';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { validateUserRegistration, sanitizeDocumentInput } from '../../utils/validationUtils';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');

  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      setLoadingPlan(true);
      const data = await getPlanById(planId);
      setPlan(data);
      setLoadingPlan(false);
    };
    fetchPlan();
  }, [planId]);
  
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

  const planNombre = plan?.pe_nombre || 'Plan';
  const planPrecio = parseFloat(plan?.pe_precio_base || 0).toLocaleString('es-CO');

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

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    // Si el usuario no está logueado, validamos los datos de registro
    if (!user) {
      const validationError = validateUserRegistration(formData);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (!window.confirm('No has iniciado sesión. ¿Deseas crear una cuenta con estos datos para completar el pago?')) {
        return;
      }
    }

    setLoading(true);
    
    try {
      if (!user) {
        await register({
          ...formData,
          idRol: 2, // Cliente
          idEstadoGen: 1
        });
      }

      // Simular tiempo de procesamiento de pago
      setTimeout(() => {
        setLoading(false);
        navigate('/payment-confirmation');
      }, 1500);

    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al procesar el pago');
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

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.875rem 1rem',
            borderRadius: '0.5rem',
            margin: '1rem auto',
            maxWidth: '80rem',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            ⚠️ {error}
          </div>
        )}

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
                    <input type="tel" name="contacto" value={formData.contacto} onChange={handleChange} placeholder="Ej. 3000000000" maxLength={10} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo Documento</label>
                    <select name="idTipoDoc" value={formData.idTipoDoc} onChange={handleChange}>
                      <option value="1">Cédula de Ciudadanía (10 dígitos)</option>
                      <option value="2">Cédula de Extranjería (6 ó 7 dígitos)</option>
                      <option value="3">Pasaporte</option>
                      <option value="4">Tarjeta de Identidad (10 dígitos)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Número Documento</label>
                    <input 
                      type="text" 
                      name="numeroDoc" 
                      value={formData.numeroDoc} 
                      onChange={handleChange} 
                      placeholder={
                        Number(formData.idTipoDoc) === 1 ? "Ej. 1020304050" :
                        Number(formData.idTipoDoc) === 2 ? "Ej. 123456" :
                        Number(formData.idTipoDoc) === 4 ? "Ej. 1098765432" : "Ej. AB123456"
                      }
                      required 
                    />
                  </div>
                </div>

                {/* Pedir contraseña solo si es usuario nuevo para crearle cuenta */}
                {!user && (
                  <div className="form-row">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Crear Contraseña para tu cuenta</label>
                      <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="••••••••" />
                      <PasswordStrengthMeter password={formData.contrasena} />
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
                      <p className="plan-name">{planNombre}</p>
                    </div>
                  </div>
                  <div className="summary-right">
                    <p className="plan-price">${planPrecio}</p>
                    <p className="tax-text">IVA Incluido</p>
                  </div>
                </div>
              </section>

            </div>

          </div>

          <footer className="checkout-footer">
            <div className="footer-container">
              <button type="submit" disabled={loading} className="btn-primary pay-button">
                {loading ? 'Procesando Pago...' : `Confirmar y Pagar $${planPrecio}`}
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

