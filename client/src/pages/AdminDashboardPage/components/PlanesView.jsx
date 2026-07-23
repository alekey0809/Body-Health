import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Dumbbell, Check, X } from 'lucide-react';

const initialPlanes = [
  {
    id: 1,
    name: 'Plan Básico',
    price: 29.99,
    period: 'mensual',
    description: 'Acceso ilimitado a la zona de musculación y maquinaria cardio.',
    subscribers: 210,
    status: 'Activo',
    features: 'Musculación, Vestuarios, Casilleros'
  },
  {
    id: 2,
    name: 'Plan Pro',
    price: 49.99,
    period: 'mensual',
    description: 'Acceso total a musculación + todas las clases dirigidas (Yoga, HIIT, Pilates).',
    subscribers: 480,
    status: 'Activo',
    features: 'Todo Básico + Clases Dirigidas + Evaluación Física'
  },
  {
    id: 3,
    name: 'Plan VIP Performance',
    price: 89.99,
    period: 'mensual',
    description: 'Experiencia premium con entrenador personal (2 sesiones/mes), nutrición y sauna.',
    subscribers: 140,
    status: 'Activo',
    features: 'Todo Pro + 2 Personal Trainer/mes + Nutrición + Sauna'
  },
  {
    id: 4,
    name: 'Pase Diario',
    price: 9.99,
    period: 'diario',
    description: 'Acceso por un día completo a todas las instalaciones.',
    subscribers: 20,
    status: 'Activo',
    features: 'Musculación + Clases del día'
  }
];

const PlanesView = () => {
  const [planes, setPlanes] = useState(initialPlanes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 39.99,
    period: 'mensual',
    description: '',
    subscribers: 0,
    status: 'Activo',
    features: ''
  });

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ ...plan });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: 39.99,
        period: 'mensual',
        description: '',
        subscribers: 0,
        status: 'Activo',
        features: 'Musculación, Clases Dirigidas'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingPlan) {
      setPlanes(planes.map(p => p.id === editingPlan.id ? { ...formData, id: editingPlan.id } : p));
    } else {
      const newPlan = {
        ...formData,
        id: Date.now()
      };
      setPlanes([newPlan, ...planes]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este plan?')) {
      setPlanes(planes.filter(p => p.id !== id));
    }
  };

  const filteredPlanes = planes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSubscribers = planes.reduce((acc, curr) => acc + Number(curr.subscribers || 0), 0);

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Planes y Membresías</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Configura el catálogo de suscripciones, precios, beneficios y disponibilidad para los clientes de BodyHealth.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          Añadir Plan
        </button>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Planes Activos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{planes.length}</span>
          </div>
          <span className="badge badge-success">Catálogo Vigente</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Suscriptores Totales</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{totalSubscribers}</span>
          </div>
          <span className="badge badge-primary">Activos</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Plan Más Vendido</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>Plan Pro ($49.99)</span>
          </div>
          <span className="badge badge-warning">56% del Total</span>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar plan por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ESTADO:</span>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Precio / Período</th>
                <th>Beneficios / Características</th>
                <th>Suscriptores</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlanes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron planes.
                  </td>
                </tr>
              ) : (
                filteredPlanes.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: 'rgba(224, 23, 23, 0.1)', color: 'var(--primary)' }}>
                          <Dumbbell size={20} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{p.name}</p>
                          <p style={{ fontSize: '0.6875rem', color: '#78716c', maxWidth: '16rem' }}>{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--primary)' }}>${p.price}</span>
                        <span style={{ fontSize: '0.6875rem', color: '#78716c' }}> / {p.period}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{p.features}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{p.subscribers}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Activo' ? 'badge-success' : 'badge-neutral'}`}>
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

      {/* Modal Agregar / Editar */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>{editingPlan ? 'Editar Plan' : 'Añadir Nuevo Plan'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nombre del Plan</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Plan Pro Annual"
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Precio ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Período de Cobro</label>
                    <select
                      className="admin-select"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    >
                      <option value="mensual">Mensual</option>
                      <option value="anual">Anual</option>
                      <option value="diario">Diario</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Descripción Corta</label>
                  <textarea
                    className="admin-textarea"
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalla de qué trata este plan..."
                  />
                </div>

                <div className="admin-form-group">
                  <label>Beneficios Incluidos (separados por coma)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Musculación, Clases Dirigidas, Personal Trainer"
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Suscriptores Actuales</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.subscribers}
                      onChange={(e) => setFormData({ ...formData, subscribers: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Estado</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesView;
