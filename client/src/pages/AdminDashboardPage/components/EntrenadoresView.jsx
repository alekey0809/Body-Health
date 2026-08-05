import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit, Trash2, Star, X } from 'lucide-react';
import { getEntrenadores, createEntrenador, updateEntrenador, deleteEntrenador } from '../../../services/entrenadorService';

const EntrenadoresView = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const [formData, setFormData] = useState({
    en_u_id: '',
    u_nombres: '',
    u_apellidos: '',
    en_especialidad: 'Yoga',
    en_horario_assigned: 'Lunes a Viernes (08:00 AM - 04:00 PM)',
    en_sueldo_base: 2500,
    en_fecha_contratacion: new Date().toISOString().split('T')[0]
  });

  const fetchEntrenadores = async () => {
    setLoading(true);
    const data = await getEntrenadores();
    setTrainers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntrenadores();
  }, []);

  const handleOpenModal = (trainer = null) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        en_u_id: trainer.en_u_id || '',
        u_nombres: trainer.u_nombres || trainer.name?.split(' ')[0] || '',
        u_apellidos: trainer.u_apellidos || trainer.name?.split(' ').slice(1).join(' ') || '',
        en_especialidad: trainer.en_especialidad || trainer.specialty || 'Yoga',
        en_horario_assigned: trainer.en_horario_assigned || 'Lunes a Viernes (08:00 AM - 04:00 PM)',
        en_sueldo_base: trainer.en_sueldo_base || 2500,
        en_fecha_contratacion: trainer.en_fecha_contratacion ? trainer.en_fecha_contratacion.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingTrainer(null);
      setFormData({
        en_u_id: `e-${Date.now()}`,
        u_nombres: '',
        u_apellidos: '',
        en_especialidad: 'Yoga',
        en_horario_assigned: 'Lunes a Viernes (08:00 AM - 04:00 PM)',
        en_sueldo_base: 2500,
        en_fecha_contratacion: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrainer(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.u_nombres.trim()) return;

    if (editingTrainer) {
      await updateEntrenador(editingTrainer.en_u_id, formData);
      setTrainers(trainers.map(t => (t.en_u_id === editingTrainer.en_u_id ? { ...t, ...formData } : t)));
    } else {
      const created = await createEntrenador(formData);
      setTrainers([created, ...trainers]);
    }
    handleCloseModal();
  };

  const handleDelete = async (en_u_id) => {
    if (window.confirm('¿Estás seguro de eliminar este entrenador?')) {
      await deleteEntrenador(en_u_id);
      setTrainers(trainers.filter(t => t.en_u_id !== en_u_id));
    }
  };

  const filteredTrainers = trainers.filter(t => {
    const fullName = `${t.u_nombres || t.name || ''} ${t.u_apellidos || ''}`.toLowerCase();
    const specialty = (t.en_especialidad || t.specialty || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || specialty.includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'Todas' || (t.en_especialidad || t.specialty) === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Entrenadores</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Panel administrativo para la supervisión, alta y edición de perfiles del equipo técnico de entrenadores.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={16} />
          Añadir Entrenador
        </button>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Entrenadores</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{trainers.length}</span>
          </div>
          <span className="badge badge-primary">Equipo Activo</span>
        </div>
        
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Sueldo Promedio</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              ${trainers.length > 0 ? (trainers.reduce((acc, curr) => acc + Number(curr.en_sueldo_base || 2500), 0) / trainers.length).toFixed(2) : '0.00'}
            </span>
          </div>
          <span className="badge badge-success">Nivel Base</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Satisfacción Media</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>4.9</span>
              <Star size={16} color="var(--tertiary)" fill="var(--tertiary)" />
            </div>
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: '500', color: 'var(--on-surface-variant)' }}>98 reviews</span>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar por nombre o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ESPECIALIDAD:</span>
          <select
            className="admin-select"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="Todas">Todas</option>
            <option value="Yoga">Yoga</option>
            <option value="HIIT">HIIT</option>
            <option value="Musculación">Musculación</option>
            <option value="Pilates">Pilates</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Entrenador (ID / Nombre)</th>
                <th>Especialidad</th>
                <th>Horario Asignado</th>
                <th>Sueldo Base</th>
                <th>Contratación</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    Cargando entrenadores...
                  </td>
                </tr>
              ) : filteredTrainers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron entrenadores.
                  </td>
                </tr>
              ) : (
                filteredTrainers.map((t) => (
                  <tr key={t.en_u_id || t.id}>
                    <td>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>
                          {t.u_nombres ? `${t.u_nombres} ${t.u_apellidos || ''}` : t.name}
                        </p>
                        <p style={{ fontSize: '0.625rem', color: '#78716c', fontFamily: 'monospace' }}>
                          UUID: {t.en_u_id || t.id}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{t.en_especialidad || t.specialty || 'Yoga'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{t.en_horario_assigned || 'Tiempo Completo'}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'Noto Serif', fontWeight: '700', color: 'var(--primary)' }}>
                        ${Number(t.en_sueldo_base || 2500).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#78716c' }}>
                        {t.en_fecha_contratacion ? String(t.en_fecha_contratacion).split('T')[0] : '2024-01-01'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(t)} title="Editar"><Edit size={18} /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(t.en_u_id || t.id)} title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fafaf9', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em' }}>
            Mostrando {filteredTrainers.length} de {trainers.length} entrenadores
          </span>
        </div>
      </section>

      {/* Modal Agregar / Editar */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>{editingTrainer ? 'Editar Entrenador' : 'Añadir Nuevo Entrenador'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                {!editingTrainer && (
                  <div className="admin-form-group">
                    <label>ID Usuario (UUID)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.en_u_id}
                      onChange={(e) => setFormData({ ...formData, en_u_id: e.target.value })}
                      placeholder="Ej. e01a89b2-1111-4234-8888-abcdef123401"
                      required
                    />
                  </div>
                )}

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Nombres</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.u_nombres}
                      onChange={(e) => setFormData({ ...formData, u_nombres: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Apellidos</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.u_apellidos}
                      onChange={(e) => setFormData({ ...formData, u_apellidos: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Especialidad</label>
                    <select
                      className="admin-select"
                      value={formData.en_especialidad}
                      onChange={(e) => setFormData({ ...formData, en_especialidad: e.target.value })}
                    >
                      <option value="Yoga">Yoga</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Musculación">Musculación</option>
                      <option value="Pilates">Pilates</option>
                      <option value="Crossfit">Crossfit</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Sueldo Base ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formData.en_sueldo_base}
                      onChange={(e) => setFormData({ ...formData, en_sueldo_base: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Horario Asignado</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.en_horario_assigned}
                    onChange={(e) => setFormData({ ...formData, en_horario_assigned: e.target.value })}
                    placeholder="Ej. Lunes a Viernes (08:00 AM - 04:00 PM)"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Fecha de Contratación</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={formData.en_fecha_contratacion}
                    onChange={(e) => setFormData({ ...formData, en_fecha_contratacion: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Entrenador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntrenadoresView;
