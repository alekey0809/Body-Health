import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Dumbbell, X, FileText, FileSpreadsheet } from 'lucide-react';
import { getPlanes, createPlan, updatePlan, deletePlan } from '../../../services/planService';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const PlanesView = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    pe_nombre: '',
    pe_precio_base: 39.99,
    pe_eg_id: 1
  });

  const fetchPlanesData = async () => {
    setLoading(true);
    const data = await getPlanes();
    setPlanes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlanesData();
  }, []);

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        pe_nombre: plan.pe_nombre || plan.name || '',
        pe_precio_base: plan.pe_precio_base || plan.price || 39.99,
        pe_eg_id: plan.pe_eg_id || 1
      });
    } else {
      setEditingPlan(null);
      setFormData({
        pe_nombre: '',
        pe_precio_base: 39.99,
        pe_eg_id: 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.pe_nombre.trim()) return;

    if (editingPlan) {
      const updated = await updatePlan(editingPlan.pe_id || editingPlan.id, formData);
      setPlanes(planes.map(p => ((p.pe_id || p.id) === (editingPlan.pe_id || editingPlan.id) ? { ...p, ...formData } : p)));
    } else {
      const created = await createPlan(formData);
      setPlanes([created, ...planes]);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este plan?')) {
      await deletePlan(id);
      setPlanes(planes.filter(p => (p.pe_id || p.id) !== id));
    }
  };

  const filteredPlanes = planes.filter(p => {
    const name = (p.pe_nombre || p.name || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const isActivo = (p.pe_eg_id === 1 || p.status === 'Activo');
    const matchesStatus = statusFilter === 'Todos' || (statusFilter === 'Activo' ? isActivo : !isActivo);
    return matchesSearch && matchesStatus;
  });

  // ── Columnas para exportación ────────────────────────────────────────────────
  const exportColumns = [
    { key: 'pe_id', header: 'ID', format: (v) => `#${v}` },
    { key: 'pe_nombre', header: 'Nombre del Plan' },
    { key: 'pe_precio_base', header: 'Precio Base (USD)', format: (v) => Number(v).toFixed(2) },
    { key: 'pe_eg_id', header: 'Estado', format: (v) => v === 1 ? 'Activo' : 'Inactivo' }
  ];

  const handleExportPDF = () => {
    exportToPDF({
      data: filteredPlanes,
      columns: exportColumns,
      title: 'Reporte de Planes - BodyHealth',
      filename: `planes_${new Date().toISOString().split('T')[0]}.pdf`
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      data: filteredPlanes,
      columns: exportColumns,
      title: 'Reporte de Planes - BodyHealth',
      filename: `planes_${new Date().toISOString().split('T')[0]}.xlsx`
    });
  };

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Planes y Membresías</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Configura el catálogo de suscripciones, precios y disponibilidad para los clientes de BodyHealth.
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
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Planes Registrados</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{planes.length}</span>
          </div>
          <span className="badge badge-success">Catálogo Vigente</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Planes Activos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {planes.filter(p => p.pe_eg_id === 1 || p.status === 'Activo').length}
            </span>
          </div>
          <span className="badge badge-primary">Disponibles</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Precio Base Promedio</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              ${planes.length > 0 ? (planes.reduce((acc, curr) => acc + Number(curr.pe_precio_base || curr.price || 0), 0) / planes.length).toFixed(2) : '0.00'}
            </span>
          </div>
          <span className="badge badge-warning">Promedio</span>
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
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ESTADO GENERAL (pe_eg_id):</span>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo (eg_id = 1)</option>
            <option value="Inactivo">Inactivo (eg_id != 1)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button
            className="btn-secondary"
            onClick={handleExportPDF}
            disabled={filteredPlanes.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredPlanes.length === 0 ? 0.5 : 1 }}
            title="Exportar a PDF"
          >
            <FileText size={15} />
          </button>
          <button
            className="btn-secondary"
            onClick={handleExportExcel}
            disabled={filteredPlanes.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: filteredPlanes.length === 0 ? 0.5 : 1 }}
            title="Exportar a Excel"
          >
            <FileSpreadsheet size={15} />
          </button>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Plan (pe_nombre)</th>
                <th>Precio Base (pe_precio_base)</th>
                <th>Estado General (pe_eg_id)</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    Cargando planes...
                  </td>
                </tr>
              ) : filteredPlanes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron planes.
                  </td>
                </tr>
              ) : (
                filteredPlanes.map((p) => {
                  const id = p.pe_id || p.id;
                  const nombre = p.pe_nombre || p.name;
                  const precio = p.pe_precio_base || p.price;
                  const isActivo = (p.pe_eg_id === 1 || p.status === 'Activo');

                  return (
                    <tr key={id}>
                      <td>
                        <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>#{id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: 'rgba(224, 23, 23, 0.1)', color: 'var(--primary)' }}>
                            <Dumbbell size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{nombre}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--primary)' }}>${Number(precio).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={`badge ${isActivo ? 'badge-success' : 'badge-neutral'}`}>
                          {isActivo ? 'Activo (1)' : 'Inactivo (0)'}
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
                  <label>Nombre del Plan (pe_nombre)</label>
                  <input
                    type="text"
                    maxLength={30}
                    className="admin-input"
                    value={formData.pe_nombre}
                    onChange={(e) => setFormData({ ...formData, pe_nombre: e.target.value })}
                    placeholder="Ej. Plan Trimestral"
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Precio Base ($ USD) (pe_precio_base)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formData.pe_precio_base}
                      onChange={(e) => setFormData({ ...formData, pe_precio_base: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Estado General (pe_eg_id)</label>
                    <select
                      className="admin-select"
                      value={formData.pe_eg_id}
                      onChange={(e) => setFormData({ ...formData, pe_eg_id: parseInt(e.target.value) || 1 })}
                    >
                      <option value={1}>1 - Activo</option>
                      <option value={0}>0 - Inactivo</option>
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
