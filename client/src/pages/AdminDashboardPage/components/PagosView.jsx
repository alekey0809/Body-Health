import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  getPagos,
  createPago,
  deletePago,
  getUserByCedula,
  getPlanesPago
} from '../../../services/pagoService';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const formatDate = (str) => {
  if (!str) return '—';
  return String(str).split('T')[0];
};

/* ─── Component ───────────────────────────────────────────────────────────── */
const PagosView = () => {
  const [pagos, setPagos]               = useState([]);
  const [planes, setPlanes]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [showModal, setShowModal]       = useState(false);

  // Form state
  const [cedula, setCedula]             = useState('');
  const [cedStatus, setCedStatus]       = useState('idle'); // idle | loading | found | error
  const [usuarioInfo, setUsuarioInfo]   = useState(null);  // { u_id, u_nombres, u_apellidos, u_correo_electronico }
  const [peId, setPeId]                 = useState('');
  const [precioBase, setPrecioBase]     = useState('');
  const [saving, setSaving]             = useState(false);
  const [saveMsg, setSaveMsg]           = useState(null);  // { type: 'success'|'error', text }

  const cedulaTimer = useRef(null);

  /* ── Carga inicial ─────────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const [pagosData, planesData] = await Promise.all([getPagos(), getPlanesPago()]);
      setPagos(pagosData);
      setPlanes(planesData);
      setLoading(false);
    })();
  }, []);

  /* ── Autocomplete cédula (debounce 600 ms) ─────────────────────────────── */
  useEffect(() => {
    if (!cedula || cedula.length < 5) {
      setUsuarioInfo(null);
      setCedStatus('idle');
      return;
    }
    clearTimeout(cedulaTimer.current);
    cedulaTimer.current = setTimeout(async () => {
      setCedStatus('loading');
      try {
        const data = await getUserByCedula(cedula);
        if (data.ok && data.user) {
          setUsuarioInfo(data.user);
          setCedStatus('found');
        } else {
          setUsuarioInfo(null);
          setCedStatus('error');
        }
      } catch {
        setUsuarioInfo(null);
        setCedStatus('error');
      }
    }, 600);
    return () => clearTimeout(cedulaTimer.current);
  }, [cedula]);

  /* ── Autocomplete plan → precio ─────────────────────────────────────────── */
  useEffect(() => {
    if (!peId) { setPrecioBase(''); return; }
    const plan = planes.find(p => String(p.pe_id) === String(peId));
    setPrecioBase(plan ? plan.pe_precio_base : '');
  }, [peId, planes]);

  /* ── Modal helpers ─────────────────────────────────────────────────────── */
  const handleOpenModal = () => {
    setCedula('');
    setCedStatus('idle');
    setUsuarioInfo(null);
    setPeId('');
    setPrecioBase('');
    setSaveMsg(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  /* ── Guardar pago ──────────────────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!usuarioInfo || !peId) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const result = await createPago({ cedula, pe_id: peId });
      if (result.ok) {
        setSaveMsg({ type: 'success', text: `Pago registrado · Factura #${result.f_id}` });
        // Recargar tabla
        const pagosData = await getPagos();
        setPagos(pagosData);
        setTimeout(() => handleCloseModal(), 1800);
      } else {
        setSaveMsg({ type: 'error', text: result.message || 'Error al registrar el pago' });
      }
    } catch (err) {
      setSaveMsg({ type: 'error', text: err?.response?.data?.message || 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Eliminar pago ─────────────────────────────────────────────────────── */
  const handleDelete = async (f_id) => {
    if (!window.confirm(`¿Eliminar la factura #${f_id} y su membresía asociada?`)) return;
    await deletePago(f_id);
    setPagos(prev => prev.filter(p => p.f_id !== f_id));
  };

  /* ── Filtrado ──────────────────────────────────────────────────────────── */
  const filteredPagos = pagos.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      String(p.f_id).includes(q) ||
      `${p.u_nombres} ${p.u_apellidos}`.toLowerCase().includes(q) ||
      String(p.u_numero_documento || '').includes(q) ||
      String(p.u_correo_electronico || '').toLowerCase().includes(q) ||
      String(p.pe_nombre || '').toLowerCase().includes(q)
    );
  });

  const totalIngresos = pagos.reduce((acc, p) => acc + Number(p.f_valor_total || 0), 0);

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Administración
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Gestión de Pagos y Membresías
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Registro de cobros, generación de facturas y control de membresías activas.
          </p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Registrar Pago
        </button>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
              Total Ingresos
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {formatCOP(totalIngresos)}
            </span>
          </div>
          <span className="badge badge-success">Registrado</span>
        </div>
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
              Total Facturas
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{pagos.length}</span>
          </div>
          <span className="badge badge-primary">Auditadas</span>
        </div>
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
              Membresías Activas
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {pagos.filter(p => p.m_fecha_vencimiento && new Date(p.m_fecha_vencimiento) >= new Date()).length}
            </span>
          </div>
          <span className="badge badge-warning">Vigentes</span>
        </div>
      </section>

      {/* Search */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar por factura, cliente, cédula, plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Factura #</th>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Monto (COP)</th>
                <th>Fecha</th>
                <th>Membresía vence</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>Cargando...</td></tr>
              ) : filteredPagos.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>No se encontraron registros.</td></tr>
              ) : filteredPagos.map((p) => {
                const vigente = p.m_fecha_vencimiento && new Date(p.m_fecha_vencimiento) >= new Date();
                return (
                  <tr key={p.f_id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.75rem' }}>#{p.f_id}</span>
                    </td>
                    <td>
                      <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{p.u_nombres} {p.u_apellidos}</p>
                      <p style={{ fontSize: '0.6875rem', color: '#78716c' }}>{p.u_correo_electronico}</p>
                      <p style={{ fontSize: '0.6875rem', color: '#a8a29e' }}>C.C. {p.u_numero_documento}</p>
                    </td>
                    <td><span className="badge badge-primary">{p.pe_nombre}</span></td>
                    <td>
                      <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--primary)' }}>
                        {formatCOP(p.f_valor_total)}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '0.75rem', color: '#57534e' }}>{formatDate(p.f_fecha_hora)}</span></td>
                    <td>
                      <span className={`badge ${vigente ? 'badge-success' : 'badge-error'}`}>
                        {formatDate(p.m_fecha_vencimiento)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon danger" onClick={() => handleDelete(p.f_id)} title="Eliminar factura">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>Registrar Nuevo Pago</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">

                {/* Cédula con autocomplete */}
                <div className="admin-form-group">
                  <label>Cédula del cliente <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Ej. 1012345678"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    {cedStatus === 'loading' && (
                      <Loader2 size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite', color: '#78716c' }} />
                    )}
                    {cedStatus === 'found' && (
                      <CheckCircle size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }} />
                    )}
                    {cedStatus === 'error' && cedula.length >= 5 && (
                      <AlertCircle size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--error)' }} />
                    )}
                  </div>
                  {cedStatus === 'error' && cedula.length >= 5 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem' }}>Usuario no encontrado</p>
                  )}
                </div>

                {/* Campos de solo lectura: nombre + correo */}
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Nombres y apellidos</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={usuarioInfo ? `${usuarioInfo.u_nombres} ${usuarioInfo.u_apellidos}` : ''}
                      readOnly
                      placeholder="Autocompletado"
                      style={{ background: 'var(--surface-container-low)', cursor: 'default' }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={usuarioInfo?.u_correo_electronico || ''}
                      readOnly
                      placeholder="Autocompletado"
                      style={{ background: 'var(--surface-container-low)', cursor: 'default' }}
                    />
                  </div>
                </div>

                {/* Plan select dinámico */}
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Plan de entrenamiento <span style={{ color: 'var(--error)' }}>*</span></label>
                    <select
                      className="admin-select"
                      value={peId}
                      onChange={(e) => setPeId(e.target.value)}
                      required
                    >
                      <option value="">— Seleccionar plan —</option>
                      {planes.map(plan => (
                        <option key={plan.pe_id} value={plan.pe_id}>
                          {plan.pe_nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Monto autocompletado (solo lectura) */}
                  <div className="admin-form-group">
                    <label>Monto (COP)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={precioBase ? formatCOP(precioBase) : ''}
                      readOnly
                      placeholder="Autocompletado al elegir plan"
                      style={{ background: 'var(--surface-container-low)', cursor: 'default', fontWeight: '700', color: 'var(--primary)' }}
                    />
                  </div>
                </div>

                {/* Mensaje resultado */}
                {saveMsg && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: saveMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: saveMsg.type === 'success' ? '#166534' : '#991b1b',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    {saveMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {saveMsg.text}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving || cedStatus !== 'found' || !peId}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (cedStatus !== 'found' || !peId) ? 0.6 : 1 }}
                >
                  {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  {saving ? 'Guardando...' : 'Guardar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosView;
