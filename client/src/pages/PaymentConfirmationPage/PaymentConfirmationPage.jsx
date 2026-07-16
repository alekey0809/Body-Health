import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import './PaymentConfirmation.css';

const PaymentConfirmationPage = () => {
  return (
    <div className="confirmation-layout">
      {/* TopAppBar */}
      <header className="confirmation-header">
        <div className="header-inner">
          <Link to="/main" className="logo-group">
            <Dumbbell size={32} className="logo-icon" />
            <span className="logo-text">Bodyhealt</span>
          </Link>
          <nav className="header-nav">
            <Link to="/main" className="nav-link">Planes</Link>
            <span className="nav-link">Ubicación</span>
            <span className="nav-link active">Inscripción Completada</span>
          </nav>
        </div>
      </header>

      <main className="confirmation-main">
        {/* Breadcrumb / Narrative Flow */}
        <div className="text-center-wrapper">
          <p className="step-label">Paso Final — Éxito</p>
          <h1 className="confirmation-title">¡Bienvenido a Bodyhealt!</h1>
        </div>

        <div className="confirmation-grid">
          {/* Left Side: Visual Anchor */}
          <div className="visual-anchor">
            <div className="image-wrapper">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBFrTMbygD9LrHsTDd_rOKmNSkkHUeelxGIz7iVUsyCDQMDzzpShYxrx1JgCDFblaPE5147oj1I8xDG68XE9ayRz17Jdp3VhpBmd5aAtOXPyVn9ox7THZpwrbkQTFaMa5Wfg-c20ds7IRgTbC6Lct-zE7AUqY7raqnZwoc2qthkahSj5JYNQljuojvbL1DexNLhmpb8-9Oi-eLJ5SUK-q2vZp4fbtjv7pyL4ysZiH5dPsk6f42YMPjbDgAGfimpMYSCW_DkgtDHnk" alt="Gym Premium" />
              <div className="image-overlay"></div>
              <div className="image-content">
                <div className="badge">
                  <CheckCircle2 size={16} fill="var(--primary)" color="var(--on-primary)" />
                  <span>Suscripción Activa</span>
                </div>
                <h2>Membresía Trimestral — El Estándar Bodyhealt</h2>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="order-summary-side">
            <div className="summary-card-premium">
              <div className="card-header">
                <div>
                  <h3>Transacción Exitosa</h3>
                  <p>Tu pago ha sido procesado correctamente.</p>
                </div>
                <div className="price-tag">
                  <p className="price">$37.500</p>
                  <p className="label">Pagado</p>
                </div>
              </div>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon"><CheckCircle2 size={16} /></div>
                  <div>
                    <p className="feature-title">Todos los beneficios Mensuales</p>
                    <p className="feature-desc">Acceso completo a áreas de fuerza, cardio y vestidores premium.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><CheckCircle2 size={16} /></div>
                  <div>
                    <p className="feature-title">2 Invitaciones p/mes</p>
                    <p className="feature-desc">Comparte la experiencia Bodyhealt con colegas y familiares.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><CheckCircle2 size={16} /></div>
                  <div>
                    <p className="feature-title">1 Sesión de Coaching</p>
                    <p className="feature-desc">Sesión de diagnóstico y programación personalizada de 60 min.</p>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="total-row">
                  <span>Referencia de Pago</span>
                  <span className="ref-number">#BH-849201</span>
                </div>
                
                <div className="actions-group">
                  <Link to="/dashboard" className="btn-primary full-width-btn">
                    Ir a Mi Dashboard <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="trust-signal">
              <ShieldCheck size={24} className="trust-icon" />
              <p>Tus datos han sido procesados bajo protocolos de encriptación de grado bancario. Se ha enviado un recibo a tu correo electrónico.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentConfirmationPage;
