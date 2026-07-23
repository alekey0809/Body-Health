import React, { useState } from 'react';
import { UserPlus, Search, Edit, Trash2, Star, X } from 'lucide-react';

const initialTrainers = [
  {
    id: 1,
    name: 'Elena Valery',
    role: 'Senior Master',
    specialty: 'Yoga',
    classesPerWeek: 12,
    status: 'Disponible',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWT77s3Ob6BZ_xenDfI9nbBvd2AGw67CGVJCU-W2CPtT8tD9gJgGsB66E1HwSsLr5m-t7IBruM8st_NjQ0G2KYOUam-uugnG1SfT9n7xqmusBakEr0-ZrtMi-l5glHCly8ok8obLj8FwrMgOJmf4xe4Hyx1tKpyZ4ViEvVyKYfBPL-2jibpvKhKWRa0FF6QsNs_tiW4mdn7CqeVRaXGm2nPkS8asHJDOpPGM5gsJWUWEq_gW6BK2e5Tu1yWJoSGlyo14K7YNxXwRY'
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    role: 'Strength Lead',
    specialty: 'HIIT',
    classesPerWeek: 18,
    status: 'Ocupado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-bs7RshKDhpW-NLUqGFbm5UFILHotSGK9h8AQ_viIGuVW4QB1CRhFFrr5Y76OTI0pM3nb1BeKUP-A2sCOnkLe8U80Bj8jUuTMNjKUwRTLzeoLoosvnNW5xeZGK0bSspPC0VrkM_QNMWMq2-TjoPm5leBqCGoVien8FfDw596NySixOCUW2yFLExo1BucmFKVJNt5uVOPEus-4pUAKsqNFuhQdDK-3sjnX1z3aQG1JfUhmU7oPUaYQCnbpb7wk0Jh3ngCbTkxlexg'
  },
  {
    id: 3,
    name: 'Carlos Mendoza',
    role: 'Bodybuilding Specialist',
    specialty: 'Musculación',
    classesPerWeek: 15,
    status: 'Disponible',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    name: 'Sofia Ramírez',
    role: 'Core & Mobility',
    specialty: 'Pilates',
    classesPerWeek: 10,
    status: 'Disponible',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

const EntrenadoresView = () => {
  const [trainers, setTrainers] = useState(initialTrainers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialty: 'Yoga',
    classesPerWeek: 10,
    status: 'Disponible',
    avatar: ''
  });

  const handleOpenModal = (trainer = null) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({ ...trainer });
    } else {
      setEditingTrainer(null);
      setFormData({
        name: '',
        role: '',
        specialty: 'Yoga',
        classesPerWeek: 10,
        status: 'Disponible',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrainer(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingTrainer) {
      setTrainers(trainers.map(t => t.id === editingTrainer.id ? { ...formData, id: editingTrainer.id } : t));
    } else {
      const newTrainer = {
        ...formData,
        id: Date.now(),
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      setTrainers([newTrainer, ...trainers]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este entrenador?')) {
      setTrainers(trainers.filter(t => t.id !== id));
    }
  };

  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'Todas' || t.specialty === selectedSpecialty;
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
          <span className="badge badge-primary">+2 hoy</span>
        </div>
        
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Clases Semanales</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {trainers.reduce((acc, curr) => acc + Number(curr.classesPerWeek || 0), 0)}
            </span>
          </div>
          <span className="badge badge-error">Capacidad 88%</span>
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
            placeholder="Buscar por nombre o rol..."
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
                <th>Entrenador</th>
                <th>Especialidad</th>
                <th>Clases / Sem</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron entrenadores.
                  </td>
                </tr>
              ) : (
                filteredTrainers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f5f5f4' }}>
                          <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{t.name}</p>
                          <p style={{ fontSize: '0.625rem', color: '#78716c', textTransform: 'uppercase' }}>{t.role}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{t.specialty}</span>
                    </td>
                    <td><span style={{ fontFamily: 'Noto Serif', fontWeight: '700', color: 'var(--primary)' }}>{t.classesPerWeek}</span></td>
                    <td>
                      <span className={`badge ${t.status === 'Disponible' ? 'badge-success' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(t)} title="Editar"><Edit size={18} /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(t.id)} title="Eliminar"><Trash2 size={18} /></button>
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
                <div className="admin-form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Cargo / Rol</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Especialidad</label>
                    <select
                      className="admin-select"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    >
                      <option value="Yoga">Yoga</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Musculación">Musculación</option>
                      <option value="Pilates">Pilates</option>
                      <option value="Crossfit">Crossfit</option>
                    </select>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Clases por Semana</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.classesPerWeek}
                      onChange={(e) => setFormData({ ...formData, classesPerWeek: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Estado</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Licencia">Licencia</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>URL Foto de Perfil</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
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
