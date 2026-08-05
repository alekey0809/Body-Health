import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { getPagos, createPago, updatePago, deletePago } from '../../../services/pagoService';

const PagosView = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState(null);

  const [formData, setFormData] = useState({
    pa_id: '',
    clientName: '',
    clientEmail: '',
    planName: 'Plan Pro',
    pa_monto: 49.99,
    pa_fecha_pago: new Date().toISOString().split('T')[0],
    pa_metodo_pago: 'Tarjeta de Crédito',
    pa_estado: 'Completado'
  });

  const fetchPagosData = async () => {
    setLoading(true);
    const data = await getPagos();
    setPagos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPagosData();
  }, []);

  const handleOpenModal = (pago = null) => {
    if (pago) {
      setEditingPago(pago);
      setFormData({
        pa_id: pago.pa_id || pago.id || '',
        clientName: pago.clientName || '',
        clientEmail: pago.clientEmail || '',
        planName: pago.planName || 'Plan Pro',
        pa_monto: pago.pa_monto || pago.amount || 49.99,
        pa_fecha_pago: pago.pa_fecha_pago || pago.date || new Date().toISOString().split('T')[0],
        pa_metodo_pago: pago.pa_metodo_pago || pago.paymentMethod || 'Tarjeta de Crédito',
        pa_estado: pago.pa_estado || pago.status || 'Completado'
      });
    } else {
      setEditingPago(null);
      setFormData({
        pa_id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: '',
        clientEmail: '',
        planName: 'Plan Pro',
        pa_monto: 49.99,
        pa_fecha_pago: new Date().toISOString().split('T')[0],
        pa_metodo_pago: 'Tarjeta de Crédito',
        pa_estado: 'Completado'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPago(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() && !formData.pa_id) return;

    if (editingPago) {
      const id = editingPago.pa_id || editingPago.id;
      await updatePago(id, formData);
      setPagos(pagos.map(p => (((p.pa_id || p.id) === id) ? { ...p, ...formData } : p)));
    } else {
      const created = await createPago(formData);
      setPagos([created, ...pagos]);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de cancelar o eliminar este registro de pago?')) {
      await deletePago(id);
      setPagos(pagos.filter(p => (p.pa_id || p.id) !== id));
    }
  };

  const filteredPagos = pagos.filter(p => {
    const idStr = String(p.pa_id || p.id || '').toLowerCase();
    const nameStr = String(p.clientName || '').toLowerCase();
    const emailStr = String(p.clientEmail || '').toLowerCase();
    const matchesSearch = idStr.includes(searchTerm.toLowerCase()) ||
                          nameStr.includes(searchTerm.toLowerCase()) ||
                          emailStr.includes(searchTerm.toLowerCase());
    
    const estado = p.pa_estado || p.status;
    const matchesStatus = statusFilter === 'Todos' || estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCompleted = pagos
    .filter(p => (p.pa_estado || p.status) === 'Completado')
    .reduce((acc, curr) => acc + Number(curr.pa_monto || curr.amount || 0), 0);

  const totalPending = pagos
    .filter(p => (p.pa_estado || p.status) === 'Pendiente')
    .reduce((acc, curr) => acc + Number(curr.pa_monto || curr.amount || 0), 0);

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Pagos y Transacciones</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Auditoría de ingresos, registro de cobros manuales y estado financiero de los suscriptores.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          Registrar Pago
        </button>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Cobrado Este Mes</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>${totalCompleted.toFixed(2)}</span>
          </div>
          <span className="badge badge-success">Ingreso Neto</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Pagos Pendientes</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>${totalPending.toFixed(2)}</span>
          </div>
          <span className="badge badge-warning">Por Confirmar</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Transacciones</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{pagos.length}</span>
          </div>
          <span className="badge badge-primary">Auditadas</span>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar por ID transacción, cliente o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ESTADO PAGO:</span>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Completado">Completado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Fallido">Fallido</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Transacción (pa_id)</th>
                <th>Cliente</th>
                <th>Concepto / Plan</th>
                <th>Monto (pa_monto)</th>
                <th>Fecha</th>
                <th>Método (pa_metodo_pago)</th>
                <th>Estado (pa_estado)</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    Cargando transacciones...
                  </td>
                </tr>
              ) : filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron registros de pagos.
                  </td>
                </tr>
              ) : (
                filteredPagos.map((p) => {
                  const id = p.pa_id || p.id;
                  const monto = p.pa_monto || p.amount;
                  const fecha = p.pa_fecha_pago || p.date;
                  const metodo = p.pa_metodo_pago || p.paymentMethod;
                  const estado = p.pa_estado || p.status;
                  const clienteNombre = p.clientName || 'Cliente General';
                  const clienteEmail = p.clientEmail || 'cliente@bodyhealth.com';
                  const planNombre = p.planName || 'Suscripción';

                  return (
                    <tr key={id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.75rem', color: '#1c1917' }}>{id}</span>
                      </td>
                      <td>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{clienteNombre}</p>
                          <p style={{ fontSize: '0.6875rem', color: '#78716c' }}>{clienteEmail}</p>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{planNombre}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--primary)' }}>${Number(monto).toFixed(2)}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{fecha ? String(fecha).split('T')[0] : '2026-07-22'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{metodo}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          estado === 'Completado' ? 'badge-success' :
                          estado === 'Pendiente' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button className="btn-icon" onClick={() => handleOpenModal(p)} title="Editar"><Edit size={18} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete(id)} title="Eliminar"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Registrar / Editar Pago */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>{editingPago ? 'Editar Registro de Pago' : 'Registrar Nuevo Pago'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>ID Transacción (pa_id)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.pa_id}
                      onChange={(e) => setFormData({ ...formData, pa_id: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Fecha Pago (pa_fecha_pago)</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={formData.pa_fecha_pago}
                      onChange={(e) => setFormData({ ...formData, pa_fecha_pago: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Nombre del Cliente</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Ej. Laura Gómez"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="cliente@ejemplo.com"
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Plan / Servicio</label>
                    <select
                      className="admin-select"
                      value={formData.planName}
                      onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    >
                      <option value="Plan Básico">Plan Básico ($29.99)</option>
                      <option value="Plan Pro">Plan Pro ($49.99)</option>
                      <option value="Plan VIP Performance">Plan VIP ($89.99)</option>
                      <option value="Pase Diario">Pase Diario ($9.99)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Monto ($ USD) (pa_monto)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formData.pa_monto}
                      onChange={(e) => setFormData({ ...formData, pa_monto: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Método de Pago (pa_metodo_pago)</label>
                    <select
                      className="admin-select"
                      value={formData.pa_metodo_pago}
                      onChange={(e) => setFormData({ ...formData, pa_metodo_pago: e.target.value })}
                    >
                      <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                      <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                      <option value="MercadoPago">MercadoPago</option>
                      <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                      <option value="Efectivo">Efectivo</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Estado del Pago (pa_estado)</label>
                    <select
                      className="admin-select"
                      value={formData.pa_estado}
                      onChange={(e) => setFormData({ ...formData, pa_estado: e.target.value })}
                    >
                      <option value="Completado">Completado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Fallido">Fallido</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosView;
