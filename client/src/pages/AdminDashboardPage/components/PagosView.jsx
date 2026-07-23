import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';

const initialPagos = [
  {
    id: 'TRX-9821',
    clientName: 'Laura Gómez',
    clientEmail: 'laura.gomez@gmail.com',
    planName: 'Plan Pro',
    amount: 49.99,
    date: '2026-07-22',
    paymentMethod: 'Tarjeta de Crédito',
    status: 'Completado'
  },
  {
    id: 'TRX-9820',
    clientName: 'Roberto Silva',
    clientEmail: 'roberto.s@hotmail.com',
    planName: 'Plan VIP Performance',
    amount: 89.99,
    date: '2026-07-21',
    paymentMethod: 'MercadoPago',
    status: 'Completado'
  },
  {
    id: 'TRX-9819',
    clientName: 'Ana Belén',
    clientEmail: 'anabelen@yahoo.com',
    planName: 'Plan Básico',
    amount: 29.99,
    date: '2026-07-21',
    paymentMethod: 'Transferencia Bancaria',
    status: 'Pendiente'
  },
  {
    id: 'TRX-9818',
    clientName: 'Diego Martínez',
    clientEmail: 'diego.m@gmail.com',
    planName: 'Pase Diario',
    amount: 9.99,
    date: '2026-07-20',
    paymentMethod: 'Efectivo',
    status: 'Completado'
  },
  {
    id: 'TRX-9817',
    clientName: 'María Fernández',
    clientEmail: 'maria.f@gmail.com',
    planName: 'Plan Pro',
    amount: 49.99,
    date: '2026-07-19',
    paymentMethod: 'Tarjeta de Débito',
    status: 'Fallido'
  }
];

const PagosView = () => {
  const [pagos, setPagos] = useState(initialPagos);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    clientName: '',
    clientEmail: '',
    planName: 'Plan Pro',
    amount: 49.99,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Tarjeta de Crédito',
    status: 'Completado'
  });

  const handleOpenModal = (pago = null) => {
    if (pago) {
      setEditingPago(pago);
      setFormData({ ...pago });
    } else {
      setEditingPago(null);
      setFormData({
        id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: '',
        clientEmail: '',
        planName: 'Plan Pro',
        amount: 49.99,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Tarjeta de Crédito',
        status: 'Completado'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPago(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) return;

    if (editingPago) {
      setPagos(pagos.map(p => p.id === editingPago.id ? { ...formData } : p));
    } else {
      setPagos([formData, ...pagos]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de cancelar o eliminar este registro de pago?')) {
      setPagos(pagos.filter(p => p.id !== id));
    }
  };

  const filteredPagos = pagos.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCompleted = pagos
    .filter(p => p.status === 'Completado')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalPending = pagos
    .filter(p => p.status === 'Pendiente')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

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
                <th>ID Transacción</th>
                <th>Cliente</th>
                <th>Concepto / Plan</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron registros de pagos.
                  </td>
                </tr>
              ) : (
                filteredPagos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.75rem', color: '#1c1917' }}>{p.id}</span>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{p.clientName}</p>
                        <p style={{ fontSize: '0.6875rem', color: '#78716c' }}>{p.clientEmail}</p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{p.planName}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--primary)' }}>${Number(p.amount).toFixed(2)}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{p.date}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{p.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        p.status === 'Completado' ? 'badge-success' :
                        p.status === 'Pendiente' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(p)} title="Editar"><Edit size={18} /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(p.id)} title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
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
                    <label>ID Transacción</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Fecha</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    <label>Monto ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Método de Pago</label>
                    <select
                      className="admin-select"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                      <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                      <option value="MercadoPago">MercadoPago</option>
                      <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                      <option value="Efectivo">Efectivo</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Estado del Pago</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
