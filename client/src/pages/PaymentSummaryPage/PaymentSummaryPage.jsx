import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  ArrowLeft, Dumbbell, CreditCard, Lock, ShieldCheck,
  User, CheckCircle2, ArrowRight, AlertCircle, Loader2,
} from 'lucide-react';
import { getPlanById } from '../../services/planService';
import { createPago } from '../../services/pagoService';
import './PaymentSummaryPage.css';

const PaymentSummaryPage = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const planId = searchParams.get('planId') || location.state?.planId;

  const [plan, setPlan]               = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError]             = useState('');
  const [confirming, setConfirming]   = useState(false);

  // Cédula: necesaria para crear la factura vía API
  const [cedula, setCedula]           = useState('');
  const [cedulaError, setCedulaError] = useState('');

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/register-paid', { state: { planId }, replace: true });
    }
  }, [authLoading, user, navigate, planId]);

  // Cargar plan
  useEffect(() => {
    if (!planId) {
      setError('No se ha seleccionado un plan');
      setLoadingPlan(false);
      return;
    }
    setLoadingPlan(true);
    getPlanById(planId)
      .then(data => setPlan(data))
      .catch(() => setError('Error al cargar el plan'))
      .finally(() => setLoadingPlan(false));
  }, [planId]);

  const planNombre = plan?.pe_nombre || 'Plan';
  const planPrecio = parseFloat(plan?.pe_precio_base || 0).toLocaleString('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  });
  const userNombre = user?.nombre || 'Usuario';
  const userCorreo = user?.correo  || 'Correo no disponible';

  /* ── Confirmar: crear factura y saltar directo a payment-confirmation ──── */
  const handleConfirm = async () => {
    setCedulaError('');

    // Validar cédula
    const cedulaClean = cedula.trim().replace(/\D/g, '');
    if (!cedulaClean || cedulaClean.length < 6) {
      setCedulaError('Ingresa tu número de cédula para continuar.');
      return;
    }

    setConfirming(true);
    setError('');
    try {
      const result = await createPago({ cedula: cedulaClean, pe_id: plan.pe_id });
      if (result.ok) {
        navigate('/payment-confirmation', {
          state: {
            invoiceId: result.f_id,
            amount:    plan.pe_precio_base,
            planName:  planNombre,
            date:      result.f_fecha_hora,
          },
        });
      } else {
        setError(result.message || 'No se pudo crear la factura. Verifica tu cédula.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error de conexión con el servidor';
      setError(msg);
    } finally {
      setConfirming(false);
    }
  };

  /* ── Loading / Error states ──────────────────────────────────────────── */
  if (authLoading || loadingPlan) {
    return (
      <div className="summary-layout">
        <header className="summary-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={24} />
          </button>
          <h1 className="summary-title">Resumen de Pago</h1>
        </header>
        <main className="summary-main">
          <div className="summary-loading">
            <div className="loading-spinner" />
            <p>Cargando plan...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="summary-layout">
        <header className="summary-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={24} />
          </button>
          <h1 className="summary-title">Resumen de Pago</h1>
        </header>
        <main className="summary-main">
          <div className="summary-error">
            <p>{error}</p>
            <Link to="/planes" className="btn-primary">Volver a Planes</Link>
          </div>
        </main>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────────────────────── */
  return (
    <div className="summary-layout">
      <header className="summary-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="summary-title">Resumen de Pago</h1>
      </header>

      <main className="summary-main">
        <div className="summary-container">

          {/* Plan Selection Card */}
          <section className="summary-section plan-section">
            <h2 className="section-title">
              <Dumbbell size={20} />
              Plan Seleccionado
            </h2>
            <div className="plan-card">
              <div className="plan-info">
                <div className="plan-icon">
                  <Dumbbell size={28} />
                </div>
                <div className="plan-details">
                  <h3 className="plan-name">{planNombre}</h3>
                  <p className="plan-price">{planPrecio}</p>
                </div>
              </div>
              <div className="plan-badge">
                <CheckCircle2 size={16} fill="var(--primary)" color="var(--on-primary)" />
                <span>Confirmado</span>
              </div>
            </div>
          </section>

          {/* User Info Card */}
          <section className="summary-section user-section">
            <h2 className="section-title">
              <User size={20} />
              Información del Usuario
            </h2>
            <div className="user-card">
              <div className="user-info-row">
                <div className="user-icon-wrapper">
                  <User size={24} />
                </div>
                <div className="user-details">
                  <p className="user-name">{userNombre}</p>
                  <p className="user-email">{userCorreo}</p>
                </div>
              </div>

              {/* Campo de cédula inline */}
              <div style={{ marginTop: '1rem' }}>
                <label
                  htmlFor="summary-cedula"
                  style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' }}
                >
                  Número de cédula <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  id="summary-cedula"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej. 1012345678"
                  value={cedula}
                  onChange={e => {
                    setCedula(e.target.value.replace(/\D/g, ''));
                    if (cedulaError) setCedulaError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${cedulaError ? 'var(--error)' : 'var(--outline-variant)'}`,
                    fontSize: '0.9375rem',
                    background: 'var(--surface-container-low)',
                    color: 'var(--on-surface)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  maxLength={12}
                />
                {cedulaError && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={13} /> {cedulaError}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Security/Trust Indicators */}
          <section className="summary-section trust-section">
            <div className="trust-indicators">
              <div className="trust-item">
                <ShieldCheck size={20} />
                <span>Pago seguro</span>
              </div>
              <div className="trust-item">
                <Lock size={20} />
                <span>Datos protegidos</span>
              </div>
              <div className="trust-item">
                <CreditCard size={20} />
                <span>Múltiples métodos</span>
              </div>
            </div>
          </section>

          {/* Error general */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Confirm Button */}
          <footer className="summary-footer">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="btn-primary confirm-btn full-width"
            >
              {confirming ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar y continuar</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            <p className="footer-hint">
              Se generará tu factura y serás redirigido a los datos de pago
            </p>
            <Link to="/planes" className="back-link">
              <ArrowLeft size={16} />
              Cambiar de plan
            </Link>
          </footer>

        </div>
      </main>
    </div>
  );
};

export default PaymentSummaryPage;