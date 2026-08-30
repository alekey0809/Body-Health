import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, CheckCircle2, ShieldCheck, ArrowRight, Banknote, CreditCard, Copy, Mail, AlertCircle } from 'lucide-react';
import { bankAccounts, supportEmail } from '../../utils/bankAccounts';
import './PaymentConfirmation.css';

const PaymentConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceData = location.state || {};

  const {
    invoiceId,
    amount,
    planName,
    date
  } = invoiceData;

  const formattedAmount = amount ? parseFloat(amount).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }) : '$0';
  const reference = invoiceId ? `#BH-${String(invoiceId).padStart(6, '0')}` : '#BH-000000';
  const subject = `Adjuntar comprobante para activar membresía - ${reference}/${planName || 'Plan'}`;
  const body = `Hola equipo de BodyHealth,\n\nAdjunto el comprobante de pago para activar mi membresía.\n\nDetalles:\n- Referencia: ${reference}\n- Plan: ${planName || 'Plan'}\n- Monto: ${formattedAmount}\n- Fecha: ${date ? new Date(date).toLocaleDateString('es-CO') : 'Hoy'}\n\nQuedo atento a la confirmación.\n\nSaludos,\n[Tu Nombre]\n[Tu Teléfono]`;
  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copiado: ${text}`);
    }).catch(() => {
      alert('Error al copiar');
    });
  };

  if (!invoiceId) {
    useEffect(() => {
      const timer = setTimeout(() => navigate('/planes'), 3000);
      return () => clearTimeout(timer);
    }, [navigate]);

    return (
      <div className="confirmation-layout">
        <main className="confirmation-main">
          <div className="text-center-wrapper">
            <AlertCircle size={64} className="warning-icon" />
            <h1 className="confirmation-title">Sin datos de factura</h1>
            <p>Redirigiendo a planes en 3 segundos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="confirmation-layout">
      {/* TopAppBar */}
      <header className="confirmation-header">
        <div className="header-inner">
          <Link to="/main" className="logo-group">
            <Dumbbell size={32} className="logo-icon" />
            <span className="logo-text">BodyHealth</span>
          </Link>
          <nav className="header-nav">
            <Link to="/planes" className="nav-link">Planes</Link>
            <span className="nav-link">Ubicación</span>
            <span className="nav-link active">Confirmar Pago</span>
          </nav>
        </div>
      </header>

      <main className="confirmation-main">
        {/* Step indicator */}
        <div className="text-center-wrapper">
          <p className="step-label">Paso 2 de 2 — Comprobante de Pago</p>
          <h1 className="confirmation-title">Completa tu Inscripción</h1>
          <p className="confirmation-subtitle">Realiza la transferencia y envía el comprobante para activar tu membresía</p>
        </div>

        <div className="confirmation-grid">
          {/* Left Side: Payment Details */}
          <div className="payment-details-side">
            <div className="summary-card-premium">
              <div className="card-header">
                <div>
                  <h3>Resumen de tu Compra</h3>
                  <p>Plan seleccionado: <strong>{planName}</strong></p>
                </div>
                <div className="price-tag">
                  <p className="price">{formattedAmount}</p>
                  <p className="label">Total a Pagar</p>
                </div>
              </div>

              <div className="reference-box">
                <div className="ref-label">Referencia de Pago</div>
                <div className="ref-value-row">
                  <span className="ref-number">{reference}</span>
                  <button 
                    type="button"
                    className="copy-btn"
                    onClick={() => copyToClipboard(reference, 'Referencia')}
                    aria-label="Copiar referencia"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="ref-hint">Usa esta referencia al hacer la transferencia</p>
              </div>

              {/* Bank Accounts */}
              <div className="bank-accounts-section">
                <h4 className="section-title">
                  <Banknote size={18} />
                  Cuentas Bancarias para Transferencia
                </h4>
                <p className="section-hint">Selecciona una cuenta y realiza el pago</p>
                
                <div className="bank-accounts-grid">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="bank-account-card">
                      <div className="bank-header">
                        <span className="bank-name">{account.banco}</span>
                        <span className="account-type">{account.tipoCuenta}</span>
                      </div>
                      <div className="bank-details">
                        <div className="detail-row">
                          <span className="detail-label">Número:</span>
                          <div className="detail-value-row">
                            <span className="detail-value">{account.numeroCuenta}</span>
                            <button 
                              type="button"
                              className="copy-btn small"
                              onClick={() => copyToClipboard(account.numeroCuenta, 'Número de cuenta')}
                              aria-label="Copiar número de cuenta"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Titular:</span>
                          <span className="detail-value">{account.titular}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">NIT:</span>
                          <span className="detail-value">{account.nit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="instructions-box">
                <h4 className="instructions-title">
                  <CreditCard size={18} />
                  Instrucciones
                </h4>
                <ol className="instructions-list">
                  <li>Realiza la transferencia a una de las cuentas arriba indicadas</li>
                  <li>Usa la <strong>referencia {reference}</strong> en el concepto</li>
                  <li>Guarda el comprobante (captura de pantalla o PDF)</li>
                  <li>Haz clic en "Continuar" para enviar el comprobante por correo</li>
                </ol>
              </div>

              {/* Continue Button - Mailto */}
              <div className="actions-group">
                <a 
                  href={mailtoLink}
                  className="btn-primary full-width-btn mailto-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Mail size={20} />
                  Continuar - Enviar Comprobante
                </a>
                <p className="mailto-hint">
                  Se abrirá tu cliente de correo con los datos prellenados
                </p>
              </div>
            </div>

            <div className="trust-signal">
              <ShieldCheck size={24} className="trust-icon" />
              <p>Tu membresía se activará una vez verifiquemos el comprobante (máx. 24h hábiles)</p>
            </div>
          </div>

          {/* Right Side: Visual Anchor */}
          <div className="visual-anchor">
            <div className="image-wrapper">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBFrTMbygD9LrHsTDd_rOKmNSkkHUeelxGIz7iVUsyCDQMDzzpShYxrx1JgCDFblaPE5147oj1I8xDG68XE9ayRz17Jdp3VhpBmd5aAtOXPyVn9ox7THZpwrbkQTFaMa5Wfg-c20ds7IRgTbC6Lct-zE7AUqY7raqnZwoc2qthkahSj5JYNQljuojvbL1DexNLhmpb8-9Oi-eLJ5SUK-q2vZp4fbtjv7pyL4ysZiH5dPsk6f42YMPjbDgAGfimpMYSCW_DkgtDHnk" alt="Gym Premium" />
              <div className="image-overlay"></div>
              <div className="image-content">
                <div className="badge">
                  <CheckCircle2 size={16} fill="var(--primary)" color="var(--on-primary)" />
                  <span>Pendiente de Verificación</span>
                </div>
                <h2>{planName}</h2>
                <p className="plan-price">{formattedAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentConfirmationPage;