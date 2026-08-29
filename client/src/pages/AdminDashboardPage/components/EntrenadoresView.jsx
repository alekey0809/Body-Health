import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Edit, Trash2, Star, X, AlertCircle, RefreshCw, DollarSign, Clock, Hash, FileText, FileSpreadsheet, Calculator, ArrowUpRight, ArrowDownRight, CreditCard, Receipt, Plus, Calendar, Save, Loader2, Settings } from 'lucide-react';
import {
  getEntrenadores,
  getUsuariosDisponiblesParaEntrenador,
  createEntrenador,
  updateEntrenador,
  deleteEntrenador,
  getSalarioHistorial,
} from '../../../services/entrenadorService';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import {
  getHistorialSueldos,
  getResumenSueldosEntrenadores,
  getHistorialSueldoByTrainer,
  createHistorialSueldo,
  updateHistorialSueldo,
  deleteHistorialSueldo,
} from '../../../services/historialSueldoService';

// ─── Formulario vacío base ────────────────────────────────────────────────────
const EMPTY_FORM = {
  en_u_id: '',
  en_sueldo_base: '',
  en_horario_assigned: '',
};

// ─── Horarios predefinidos ────────────────────────────────────────────────────
const HORARIOS = [
  'Lunes a Viernes (06:00 AM - 02:00 PM)',
  'Lunes a Viernes (08:00 AM - 04:00 PM)',
  'Lunes a Viernes (02:00 PM - 10:00 PM)',
  'Lunes a Sábado (06:00 AM - 02:00 PM)',
  'Lunes a Sábado (02:00 PM - 10:00 PM)',
  'Martes a Domingo (06:00 AM - 02:00 PM)',
  'Martes a Domingo (02:00 PM - 10:00 PM)',
  'Tiempo Completo (Rotativo)',
];

// ─── Toast de notificación ────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: '#16a34a', icon: '✓' },
    error: { bg: 'var(--error)', icon: '✕' },
    info: { bg: 'var(--primary)', icon: 'ℹ' },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: c.bg, color: '#fff',
      padding: '0.875rem 1.25rem', borderRadius: '0.75rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      fontSize: '0.875rem', fontWeight: '600',
      animation: 'slideInRight 0.3s ease',
      maxWidth: '360px',
    }}>
      <span style={{ fontSize: '1rem' }}>{c.icon}</span>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.5rem', opacity: 0.7 }}>
        <X size={14} />
      </button>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const EntrenadoresView = () => {
  const [trainers, setTrainers] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('trainers');

  // ── Estados para modal de pagos ─────────────────────────────────────────────
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    hs_en_u_id: '',
    hs_monto_pagado: '',
    hs_fecha_pago: '',
    hs_periodo_correspondiente: '',
  });
  const [paymentFormError, setPaymentFormError] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);

  // ── Columnas para exportación ────────────────────────────────────────────────
  const exportColumns = [
    { key: 'en_u_id', header: 'UUID' },
    { key: 'u_nombres', header: 'Nombres' },
    { key: 'u_apellidos', header: 'Apellidos' },
    { key: 'u_correo_electronico', header: 'Correo' },
    { key: 'en_horario_assigned', header: 'Horario Asignado' },
    { key: 'en_sueldo_base', header: 'Sueldo Base', format: (v) => Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { key: 'en_fecha_contratacion', header: 'Fecha Contratación', format: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '' }
  ];

  const handleExportPDF = () => {
    exportToPDF({
      data: filteredTrainers,
      columns: exportColumns,
      title: 'Reporte de Entrenadores - BodyHealth',
      filename: `entrenadores_${new Date().toISOString().split('T')[0]}.pdf`,
      columnStyles: {
        0: { halign: 'left', cellWidth: 45 },
        1: { halign: 'left' },
        2: { halign: 'left' }
      }
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      data: filteredTrainers,
      columns: exportColumns,
      title: 'Reporte de Entrenadores - BodyHealth',
      filename: `entrenadores_${new Date().toISOString().split('T')[0]}.xlsx`
    });
  };

  // ── Mostrar notificación ──────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── Cargar entrenadores desde la API ──────────────────────────────────────
  const fetchEntrenadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEntrenadores();
      setTrainers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar entrenadores:', err);
      setError('No se pudo conectar con la base de datos. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cargar historial de sueldos ──────────────────────────────────────────
  const fetchSalarioHistorial = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getSalarioHistorial();
      setSalaryHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar historial de sueldos:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchEntrenadores();
    fetchSalarioHistorial();
  }, [fetchEntrenadores, fetchSalarioHistorial]);

  // ── Abrir modal (crear o editar) ──────────────────────────────────────────
  const handleOpenModal = async (trainer = null) => {
    setFormError('');
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        en_u_id: trainer.en_u_id || '',
        en_sueldo_base: trainer.en_sueldo_base ?? '',
        en_horario_assigned: trainer.en_horario_assigned || '',
      });
    } else {
      setEditingTrainer(null);
      setFormData(EMPTY_FORM);
      // Cargar usuarios disponibles con rol 3 que no son entrenadores aún
      try {
        const users = await getUsuariosDisponiblesParaEntrenador();
        setAvailableUsers(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error('Error al cargar usuarios disponibles:', err);
        setAvailableUsers([]);
      }
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingTrainer(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  // ── Validar formulario ────────────────────────────────────────────────────
  const validateForm = () => {
    if (!editingTrainer && !formData.en_u_id) {
      setFormError('Debe seleccionar un usuario para registrar como entrenador.');
      return false;
    }
    if (!formData.en_sueldo_base || Number(formData.en_sueldo_base) <= 0) {
      setFormError('El sueldo base debe ser un valor mayor a 0.');
      return false;
    }
    if (!formData.en_horario_assigned.trim()) {
      setFormError('El horario asignado es obligatorio.');
      return false;
    }
    setFormError('');
    return true;
  };

  // ── Guardar (crear o actualizar) ──────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        en_sueldo_base: parseFloat(formData.en_sueldo_base),
        en_horario_assigned: formData.en_horario_assigned.trim(),
      };

      if (editingTrainer) {
        // Actualizar entrenador existente
        const updated = await updateEntrenador(editingTrainer.en_u_id, payload);
        setTrainers((prev) =>
          prev.map((t) => (t.en_u_id === editingTrainer.en_u_id ? { ...t, ...updated } : t))
        );
        showToast('Entrenador actualizado correctamente.', 'success');
      } else {
        // Crear nuevo entrenador
        const created = await createEntrenador({ en_u_id: formData.en_u_id, ...payload });
        setTrainers((prev) => [created, ...prev]);
        showToast('Entrenador registrado correctamente.', 'success');
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar entrenador:', err);
      const msg = err?.response?.data?.message || 'Error al guardar. Verifica que el usuario exista y no esté ya registrado como entrenador.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar entrenador ───────────────────────────────────────────────────
  const handleDelete = async (en_u_id) => {
    if (!window.confirm('¿Estás seguro de eliminar este entrenador? Esta acción no se puede deshacer.')) return;
    setDeleting(en_u_id);
    try {
      await deleteEntrenador(en_u_id);
      setTrainers((prev) => prev.filter((t) => t.en_u_id !== en_u_id));
      showToast('Entrenador eliminado correctamente.', 'success');
    } catch (err) {
      console.error('Error al eliminar entrenador:', err);
      const msg = err?.response?.data?.message || 'No se pudo eliminar el entrenador.';
      showToast(msg, 'error');
    } finally {
      setDeleting(null);
    }
  };

  // ── Ver detalle de pagos ───────────────────────────────────────────────────
  const showPaymentDetail = (trainer) => {
    setPaymentDetail(trainer);
  };

  const handleClosePaymentDetail = () => {
    setPaymentDetail(null);
  };

  // ── Modal Registrar Pago ─────────────────────────────────────────────────────
  const handleOpenPaymentModal = (trainer) => {
    setPaymentDetail(trainer);
    setPaymentFormData({
      hs_en_u_id: trainer.en_u_id,
      hs_monto_pagado: '',
      hs_fecha_pago: new Date().toISOString().slice(0, 16), // formato datetime-local
      hs_periodo_correspondiente: new Date().toISOString().slice(0, 7), // formato YYYY-MM
    });
    setPaymentFormError('');
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    if (paymentSaving) return;
    setShowPaymentModal(false);
    setPaymentFormData({
      hs_en_u_id: '',
      hs_monto_pagado: '',
      hs_fecha_pago: '',
      hs_periodo_correspondiente: '',
    });
    setPaymentFormError('');
  };

  const validatePaymentForm = () => {
    if (!paymentFormData.hs_monto_pagado || parseFloat(paymentFormData.hs_monto_pagado) <= 0) {
      setPaymentFormError('El monto pagado debe ser un valor mayor a 0.');
      return false;
    }
    if (!paymentFormData.hs_fecha_pago) {
      setPaymentFormError('La fecha de pago es obligatoria.');
      return false;
    }
    if (!paymentFormData.hs_periodo_correspondiente) {
      setPaymentFormError('El período correspondiente es obligatorio (formato YYYY-MM).');
      return false;
    }
    setPaymentFormError('');
    return true;
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;
    setPaymentSaving(true);
    try {
      const payload = {
        hs_en_u_id: paymentFormData.hs_en_u_id,
        hs_monto_pagado: parseFloat(paymentFormData.hs_monto_pagado),
        hs_fecha_pago: paymentFormData.hs_fecha_pago,
        hs_periodo_correspondiente: paymentFormData.hs_periodo_correspondiente,
      };
      await createHistorialSueldo(payload);
      showToast('Pago de sueldo registrado correctamente.', 'success');
      // Recargar historial de sueldos
      fetchSalarioHistorial();
      // Recargar detalle si está abierto
      if (paymentDetail) {
        const updated = await getHistorialSueldoByTrainer(paymentDetail.en_u_id);
        setPaymentDetail(updated);
      }
      handleClosePaymentModal();
    } catch (err) {
      console.error('Error al registrar pago:', err);
      const msg = err?.response?.data?.message || 'Error al registrar el pago de sueldo.';
      setPaymentFormError(msg);
    } finally {
      setPaymentSaving(false);
    }
  };

  // ── Filtrar entrenadores ──────────────────────────────────────────────────
  const filteredTrainers = trainers.filter((t) => {
    const fullName = `${t.u_nombres || ''} ${t.u_apellidos || ''}`.toLowerCase();
    const horario = (t.en_horario_assigned || '').toLowerCase();
    const uuid = (t.en_u_id || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || horario.includes(term) || uuid.includes(term);
  });

  // ── Filtrar historial de sueldos ──────────────────────────────────────────
  const filteredSalaryHistory = salaryHistory.filter((t) => {
    const fullName = `${t.u_nombres || ''} ${t.u_apellidos || ''}`.toLowerCase();
    const email = (t.u_correo_electronico || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  // ── Exportar historial de sueldos a PDF ─────────────────────────────────────
  const salaryExportColumns = [
    { key: 'en_u_id', header: 'UUID' },
    { key: 'u_nombres', header: 'Nombres' },
    { key: 'u_apellidos', header: 'Apellidos' },
    { key: 'u_correo_electronico', header: 'Correo' },
    { key: 'en_sueldo_base', header: 'Sueldo Base', format: (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { key: 'total_pagado', header: 'Total Pagado', format: (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { key: 'en_fecha_contratacion', header: 'Fecha Contratación', format: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '' }
  ];

  const handleExportSalaryPDF = () => {
    exportToPDF({
      data: filteredSalaryHistory,
      columns: salaryExportColumns,
      title: 'Reporte de Sueldos Pagados - BodyHealth',
      filename: `sueldos_pagados_${new Date().toISOString().split('T')[0]}.pdf`,
      columnStyles: {
        0: { halign: 'left', cellWidth: 45 },
        1: { halign: 'left' },
        2: { halign: 'left' }
      }
    });
  };

  const handleExportSalaryExcel = () => {
    exportToExcel({
      data: filteredSalaryHistory,
      columns: salaryExportColumns,
      title: 'Reporte de Sueldos Pagados - BodyHealth',
      filename: `sueldos_pagados_${new Date().toISOString().split('T')[0]}.xlsx`
    });
  };

  // ── Estadísticas ──────────────────────────────────────────────────────────
  const sueldoPromedio = trainers.length > 0
    ? trainers.reduce((acc, t) => acc + Number(t.en_sueldo_base || 0), 0) / trainers.length
    : 0;

  const sueldoMax = trainers.length > 0
    ? Math.max(...trainers.map((t) => Number(t.en_sueldo_base || 0)))
    : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Toast notificación */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* CSS para animación del toast */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Administración
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Gestión de Entrenadores
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            CRUD conectado a la base de datos — tabla <code style={{ background: '#f5f5f4', padding: '0.1em 0.4em', borderRadius: '4px', fontSize: '0.8em' }}>entrenador</code>.
            Registra, edita y elimina entrenadores en tiempo real.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.25rem', background: '#fafaf9', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)' }}>
            <button
              onClick={() => setViewMode('trainers')}
              className={`btn-icon ${viewMode === 'trainers' ? 'active' : ''}`}
              style={{ background: viewMode === 'trainers' ? 'var(--primary)' : 'none', color: viewMode === 'trainers' ? '#fff' : 'var(--on-surface)', border: 'none', borderRadius: '0.375rem', padding: '0.5rem' }}
              title="Ver entrenadores"
            >
              <UserPlus size={16} />
            </button>
            <button
              onClick={() => setViewMode('salary')}
              className={`btn-icon ${viewMode === 'salary' ? 'active' : ''}`}
              style={{ background: viewMode === 'salary' ? 'var(--primary)' : 'none', color: viewMode === 'salary' ? '#fff' : 'var(--on-surface)', border: 'none', borderRadius: '0.375rem', padding: '0.5rem' }}
              title="Ver sueldos pagados"
            >
              <CreditCard size={16} />
            </button>
          </div>
          <button
            className="btn-secondary"
            onClick={viewMode === 'trainers' ? fetchEntrenadores : fetchSalarioHistorial}
            disabled={viewMode === 'trainers' ? loading : loadingHistory}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Recargar desde la base de datos"
          >
            <RefreshCw size={15} style={{ animation: (viewMode === 'trainers' ? loading : loadingHistory) ? 'spin 1s linear infinite' : 'none' }} />
            Recargar
          </button>
          {viewMode === 'trainers' && (
            <button
              className="btn-primary"
              onClick={() => handleOpenModal()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserPlus size={16} />
              Añadir Entrenador
            </button>
          )}
        </div>
      </section>

      {/* ── Tarjetas de estadísticas ────────────────────────────────────────────────── */}
      {viewMode === 'trainers' && (
        <section className="stats-grid">
          <div className="stat-card">
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                Total Entrenadores
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{trainers.length}</span>
            </div>
            <span className="badge badge-primary">Equipo Activo</span>
          </div>

          <div className="stat-card">
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                Sueldo Promedio
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
                ${sueldoPromedio.toFixed(2)}
              </span>
            </div>
            <span className="badge badge-success">Nivel Base</span>
          </div>

          <div className="stat-card">
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                Sueldo Máximo
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
                  ${sueldoMax.toFixed(2)}
                </span>
                <Star size={16} color="var(--tertiary)" fill="var(--tertiary)" />
              </div>
            </div>
            <span style={{ fontSize: '0.625rem', fontWeight: '500', color: 'var(--on-surface-variant)' }}>Top del equipo</span>
          </div>
        </section>
      )}

      {viewMode === 'salary' && (
        <section className="stats-grid">
          <div className="stat-card">
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                Total Entrenadores
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{salaryHistory.length}</span>
            </div>
            <span className="badge badge-primary">Con Pagos</span>
          </div>

          <div className="stat-card">
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                Total Pagado
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif', color: '#16a34a' }}>
                ${salaryHistory.reduce((acc, t) => acc + Number(t.total_pagado || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="badge badge-success">Acumulado</span>
          </div>

          <div className="stat-card">
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                Promedio por Entrenador
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
                ${salaryHistory.length > 0 ? (salaryHistory.reduce((acc, t) => acc + Number(t.total_pagado || 0), 0) / salaryHistory.length).toFixed(2) : '0.00'}
              </span>
            </div>
            <span style={{ fontSize: '0.625rem', fontWeight: '500', color: 'var(--on-surface-variant)' }}>Por persona</span>
          </div>
        </section>
      )}

      {/* ── Barra de búsqueda ───────────────────────────────────────────── */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder={viewMode === 'trainers' ? 'Buscar por nombre, horario o UUID...' : 'Buscar por nombre, email o periodo...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {viewMode === 'trainers' && (
            <>
              <button
                className="btn-secondary"
                onClick={handleExportPDF}
                disabled={filteredTrainers.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredTrainers.length === 0 ? 0.5 : 1 }}
                title="Exportar a PDF"
              >
                <FileText size={15} />
              </button>
              <button
                className="btn-secondary"
                onClick={handleExportExcel}
                disabled={filteredTrainers.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredTrainers.length === 0 ? 0.5 : 1 }}
                title="Exportar a Excel"
              >
                <FileSpreadsheet size={15} />
              </button>
            </>
          )}
          {viewMode === 'salary' && (
            <>
              <button
                className="btn-secondary"
                onClick={handleExportSalaryPDF}
                disabled={filteredSalaryHistory.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredSalaryHistory.length === 0 ? 0.5 : 1 }}
                title="Exportar a PDF"
              >
                <FileText size={15} />
              </button>
              <button
                className="btn-secondary"
                onClick={handleExportSalaryExcel}
                disabled={filteredSalaryHistory.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredSalaryHistory.length === 0 ? 0.5 : 1 }}
                title="Exportar a Excel"
              >
                <FileSpreadsheet size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Error de carga ──────────────────────────────────────────────── */}
      {error && (
        <div style={{
          margin: '1rem 0',
          padding: '1rem 1.25rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#dc2626',
          fontSize: '0.875rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={fetchEntrenadores}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Tabla de entrenadores / Sueldos Pagados ───────────────────────────────────────── */}
      {viewMode === 'trainers' && (
        <section className="data-table-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Hash size={13} /> UUID / Entrenador
                    </div>
                  </th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} /> Horario Asignado
                    </div>
                  </th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <DollarSign size={13} /> Sueldo Base
                    </div>
                  </th>
                  <th>Contratación</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '28px', height: '28px', border: '3px solid var(--outline-variant)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: '0.875rem' }}>Cargando entrenadores desde la base de datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTrainers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={32} style={{ opacity: 0.3 }} />
                        <span style={{ fontSize: '0.875rem' }}>
                          {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay entrenadores registrados.'}
                        </span>
                        {!searchTerm && (
                          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                            Registrar primero
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTrainers.map((t) => (
                    <tr key={t.en_u_id} style={{ opacity: deleting === t.en_u_id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                      {/* UUID + Nombre */}
                      <td>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.15rem' }}>
                            {t.u_nombres ? `${t.u_nombres} ${t.u_apellidos || ''}`.trim() : '—'}
                          </p>
                          <p style={{ fontSize: '0.6rem', color: '#a8a29e', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {t.en_u_id}
                          </p>
                          {t.u_correo_electronico && (
                            <p style={{ fontSize: '0.7rem', color: '#78716c' }}>{t.u_correo_electronico}</p>
                          )}
                        </div>
                      </td>

                      {/* Horario */}
                      <td>
                        <span style={{
                          display: 'inline-block',
                          background: '#f0f9ff',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
                          borderRadius: '999px',
                          padding: '0.2rem 0.65rem',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                        }}>
                          {t.en_horario_assigned || '—'}
                        </span>
                      </td>

                      {/* Sueldo */}
                      <td>
                        <span style={{ fontFamily: 'Noto Serif', fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>
                          ${Number(t.en_sueldo_base || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Fecha contratación */}
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#78716c' }}>
                          {t.en_fecha_contratacion
                            ? new Date(t.en_fecha_contratacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
                            : '—'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            className="btn-icon"
                            onClick={() => handleOpenModal(t)}
                            title="Editar entrenador"
                            disabled={deleting === t.en_u_id}
                          >
                            <Edit size={17} />
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDelete(t.en_u_id)}
                            title="Eliminar entrenador"
                            disabled={deleting === t.en_u_id}
                          >
                            {deleting === t.en_u_id
                              ? <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                              : <Trash2 size={17} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de la tabla */}
          <div style={{
            padding: '0.875rem 1.5rem',
            backgroundColor: '#fafaf9',
            borderTop: '1px solid var(--outline-variant)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em' }}>
              Mostrando {filteredTrainers.length} de {trainers.length} entrenadores
            </span>
            <span style={{ fontSize: '0.625rem', color: '#a8a29e' }}>
              Tabla: <code>entrenador</code> — Base de datos PostgreSQL
            </span>
          </div>
        </section>
      )}

      {viewMode === 'salary' && (
        <section className="data-table-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Hash size={13} /> UUID / Entrenador
                    </div>
                  </th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <DollarSign size={13} /> Sueldo Base
                    </div>
                  </th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CreditCard size={13} /> Total Pagado
                    </div>
                  </th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Receipt size={13} /> Nº Pagos
                    </div>
                  </th>
                  <th>Contratación</th>
                  <th style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <Plus size={13} /> Agregar
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '28px', height: '28px', border: '3px solid var(--outline-variant)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: '0.875rem' }}>Cargando historial de sueldos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSalaryHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={32} style={{ opacity: 0.3 }} />
                        <span style={{ fontSize: '0.875rem' }}>
                          {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay historial de pagos registrado.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSalaryHistory.map((t) => {
                    const pagos = t.historial_pagos || [];
                    return (
                      <tr key={t.en_u_id}>
                        {/* UUID + Nombre */}
                        <td>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.15rem' }}>
                              {t.u_nombres ? `${t.u_nombres} ${t.u_apellidos || ''}`.trim() : '—'}
                            </p>
                            <p style={{ fontSize: '0.6rem', color: '#a8a29e', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {t.en_u_id}
                            </p>
                            {t.u_correo_electronico && (
                              <p style={{ fontSize: '0.7rem', color: '#78716c' }}>{t.u_correo_electronico}</p>
                            )}
                          </div>
                        </td>

                        {/* Sueldo Base */}
                        <td>
                          <span style={{ fontFamily: 'Noto Serif', fontWeight: '600', fontSize: '0.9rem', color: '#78716c' }}>
                            ${Number(t.en_sueldo_base || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Total Pagado */}
                        <td>
                          <span style={{ fontFamily: 'Noto Serif', fontWeight: '700', fontSize: '1.1rem', color: '#16a34a' }}>
                            ${Number(t.total_pagado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Número de pagos */}
                        <td>
                          <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {pagos.length}
                          </span>
                        </td>

                        {/* Fecha contratación */}
                        <td>
                          <span style={{ fontSize: '0.75rem', color: '#78716c' }}>
                            {t.en_fecha_contratacion
                              ? new Date(t.en_fecha_contratacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
                              : '—'}
                          </span>
                        </td>

                        {/* Acciones - Ver detalle */}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-icon"
                            onClick={() => showPaymentDetail(t)}
                            title="Agregar pagos"
                          >
                            <Plus size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de la tabla */}
          <div style={{
            padding: '0.875rem 1.5rem',
            backgroundColor: '#fafaf9',
            borderTop: '1px solid var(--outline-variant)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em' }}>
              Mostrando {filteredSalaryHistory.length} de {salaryHistory.length} entrenadores
            </span>
            <span style={{ fontSize: '0.625rem', color: '#a8a29e' }}>
              Tabla: <code>historial_sueldo</code> — Base de datos PostgreSQL
            </span>
          </div>
        </section>
      )}

      {/* ── Modal Crear / Editar ─────────────────────────────────────────── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className="admin-modal-container">
            {/* Header */}
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>
                  {editingTrainer ? 'Editar Entrenador' : 'Registrar Nuevo Entrenador'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>
                  {editingTrainer
                    ? `UUID: ${editingTrainer.en_u_id}`
                    : 'Selecciona un usuario con rol Entrenador (u_r_id = 3) para registrarlo como entrenador.'}
                </p>
              </div>
              <button className="btn-icon" onClick={handleCloseModal} disabled={saving}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">

                {/* Error del formulario */}
                {formError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}>
                    <AlertCircle size={15} />
                    {formError}
                  </div>
                )}

                {/* Usuario (dropdown) — solo al crear */}
                {!editingTrainer && (
                  <div className="admin-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Hash size={13} /> Usuario (Rol: Entrenador)
                    </label>
                    <select
                      className="admin-select"
                      value={formData.en_u_id}
                      onChange={(e) => setFormData({ ...formData, en_u_id: e.target.value })}
                      required
                      autoFocus
                    >
                      <option value="">— Selecciona un usuario —</option>
                      {availableUsers.map((user) => (
                        <option key={user.u_id} value={user.u_id}>
                          {user.u_nombres} {user.u_apellidos} — {user.u_correo_electronico}
                        </option>
                      ))}
                    </select>
                    {availableUsers.length === 0 && (
                      <small style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>
                        No hay usuarios con rol 3 (Entrenador) disponibles. Primero crea un usuario con rol Entrenador en la gestión de usuarios.
                      </small>
                    )}
                    <small style={{ color: '#78716c', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>
                      Solo se muestran usuarios con rol <strong>Entrenador (u_r_id = 3)</strong> que no están registrados como entrenadores.
                    </small>
                  </div>
                )}

                {/* Sueldo base */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <DollarSign size={13} /> Sueldo Base (en_sueldo_base)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="admin-input"
                    value={formData.en_sueldo_base}
                    onChange={(e) => setFormData({ ...formData, en_sueldo_base: e.target.value })}
                    placeholder="Ej. 2500.00"
                    required
                  />
                </div>

                {/* Horario asignado */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} /> Horario Asignado (en_horario_assigned)
                  </label>
                  <select
                    className="admin-select"
                    value={HORARIOS.includes(formData.en_horario_assigned) ? formData.en_horario_assigned : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        setFormData({ ...formData, en_horario_assigned: e.target.value });
                      }
                    }}
                  >
                    <option value="">— Selecciona un horario —</option>
                    {HORARIOS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                    <option value="__custom__">Personalizado (editar abajo)</option>
                  </select>
                  <input
                    type="text"
                    className="admin-input"
                    style={{ marginTop: '0.5rem' }}
                    value={formData.en_horario_assigned}
                    onChange={(e) => setFormData({ ...formData, en_horario_assigned: e.target.value })}
                    placeholder="Ej. Lunes a Viernes (08:00 AM - 04:00 PM)"
                    required
                  />
                  <small style={{ color: '#78716c', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>
                    Puedes seleccionar un horario predefinido o escribir uno personalizado.
                  </small>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {saving
                    ? (<><div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Guardando...</>)
                    : (editingTrainer ? 'Guardar Cambios' : 'Registrar Entrenador')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Detalle de Pagos ─────────────────────────────────────────── */}
      {paymentDetail && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClosePaymentDetail()}>
          <div className="admin-modal-container" style={{ maxWidth: '700px' }}>
            {/* Header */}
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Detalle de Pagos</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>
                  {paymentDetail.u_nombres} {paymentDetail.u_apellidos} — Sueldo Base: ${Number(paymentDetail.en_sueldo_base || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleOpenPaymentModal(paymentDetail)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  <Settings size={14} /> Registrar Pago
                </button>
                <button className="btn-icon" onClick={handleClosePaymentDetail}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fafaf9', borderRadius: '0.5rem', border: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                      Total Pagado
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Noto Serif', color: '#16a34a' }}>
                      ${Number(paymentDetail.total_pagado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                      Nº de Pagos
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Noto Serif', color: 'var(--primary)' }}>
                      {(paymentDetail.historial_pagos || []).length}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                      Sueldo Base
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Noto Serif', color: '#78716c' }}>
                      ${Number(paymentDetail.en_sueldo_base || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>
                      Contratación
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', fontFamily: 'Noto Serif', color: 'var(--on-surface)' }}>
                      {paymentDetail.en_fecha_contratacion
                        ? new Date(paymentDetail.en_fecha_contratacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--on-surface)' }}>Historial de Pagos</h4>
              {(paymentDetail.historial_pagos || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                  <CreditCard size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p>No hay pagos registrados para este entrenador.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>ID Pago</th>
                        <th>Monto</th>
                        <th>Fecha Pago</th>
                        <th>Periodo Correspondiente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(paymentDetail.historial_pagos || []).map((pago) => (
                        <tr key={pago.hs_id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{pago.hs_id}</td>
                          <td>
                            <span style={{ fontFamily: 'Noto Serif', fontWeight: '700', color: 'var(--primary)' }}>
                              ${Number(pago.hs_monto_pagado || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: '#78716c' }}>
                            {pago.hs_fecha_pago
                              ? new Date(pago.hs_fecha_pago).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
                              : '—'}
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                            {pago.hs_periodo_correspondiente || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn-primary" onClick={handleClosePaymentDetail} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Registrar Pago de Sueldo ────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClosePaymentModal()}>
          <div className="admin-modal-container" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Registrar Pago de Sueldo</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>
                  {paymentDetail ? `${paymentDetail.u_nombres} ${paymentDetail.u_apellidos}` : 'Entrenador'}
                </p>
              </div>
              <button className="btn-icon" onClick={handleClosePaymentModal} disabled={paymentSaving}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePayment}>
              <div className="admin-modal-body">
                {paymentFormError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}>
                    <AlertCircle size={15} />
                    {paymentFormError}
                  </div>
                )}

                <input type="hidden" value={paymentFormData.hs_en_u_id} onChange={(e) => setPaymentFormData({ ...paymentFormData, hs_en_u_id: e.target.value })} />

                {/* Monto pagado */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <DollarSign size={13} /> Monto Pagado (hs_monto_pagado) <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="admin-input"
                    value={paymentFormData.hs_monto_pagado}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, hs_monto_pagado: e.target.value })}
                    placeholder="Ej. 2500.00"
                    required
                  />
                </div>

                {/* Fecha de pago */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} /> Fecha de Pago (hs_fecha_pago) <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="admin-input"
                    value={paymentFormData.hs_fecha_pago}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, hs_fecha_pago: e.target.value })}
                    required
                  />
                </div>

                {/* Período correspondiente */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} /> Período Correspondiente (hs_periodo_correspondiente) <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="month"
                    className="admin-input"
                    value={paymentFormData.hs_periodo_correspondiente}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, hs_periodo_correspondiente: e.target.value })}
                    required
                  />
                  <small style={{ color: '#78716c', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>
                    Formato YYYY-MM (ej. 2026-08 para agosto 2026)
                  </small>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleClosePaymentModal} disabled={paymentSaving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={paymentSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {paymentSaving
                    ? (<><div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Guardando...</>)
                    : 'Registrar Pago'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS adicional para spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EntrenadoresView;
