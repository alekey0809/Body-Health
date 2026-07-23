import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Eye, Tag, X } from 'lucide-react';

const initialPosts = [
  {
    id: 1,
    title: '5 Ejercicios Clave para Hipertrofia Muscular',
    category: 'Nutrición & Rutinas',
    author: 'Carlos Mendoza',
    publishDate: '2026-07-20',
    views: 1240,
    status: 'Publicado',
    excerpt: 'Descubre los fundamentos biomecánicos para maximizar la ganancia muscular en tu rutina semanal.'
  },
  {
    id: 2,
    title: 'Importancia de la Hidratación en Climas Cálidos',
    category: 'Salud',
    author: 'Elena Valery',
    publishDate: '2026-07-18',
    views: 890,
    status: 'Publicado',
    excerpt: 'Consejos prácticos sobre reposición de electrolitos y regulación térmica durante la actividad física.'
  },
  {
    id: 3,
    title: 'Nuevos Horarios de Clases de CrossFit y Funcional',
    category: 'Anuncios',
    author: 'Admin BodyHealth',
    publishDate: '2026-07-15',
    views: 2100,
    status: 'Publicado',
    excerpt: 'Ampliamos los turnos de la tarde y abrimos nuevo cupo matutino a partir del próximo lunes.'
  },
  {
    id: 4,
    title: 'Guía para Principiantes en la Práctica de Yoga',
    category: 'Bienestar',
    author: 'Sofia Ramírez',
    publishDate: '2026-07-10',
    views: 0,
    status: 'Borrador',
    excerpt: 'Una introducción a la respiración consciente, flexibilidad y posturas fundamentales para iniciarse.'
  }
];

const PublicacionesView = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Nutrición & Rutinas',
    author: 'Admin BodyHealth',
    publishDate: new Date().toISOString().split('T')[0],
    views: 0,
    status: 'Publicado',
    excerpt: ''
  });

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({ ...post });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        category: 'Nutrición & Rutinas',
        author: 'Admin BodyHealth',
        publishDate: new Date().toISOString().split('T')[0],
        views: 0,
        status: 'Publicado',
        excerpt: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...formData, id: editingPost.id } : p));
    } else {
      const newPost = {
        ...formData,
        id: Date.now()
      };
      setPosts([newPost, ...posts]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalViews = posts.reduce((acc, curr) => acc + Number(curr.views || 0), 0);

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Publicaciones</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Crea, edita y gestiona las noticias, anuncios, consejos de salud y publicaciones del blog.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          Nueva Publicación
        </button>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Artículos</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{posts.length}</span>
          </div>
          <span className="badge badge-success">4 Publicados</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Vistas Acumuladas</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{totalViews.toLocaleString()}</span>
          </div>
          <span className="badge badge-primary">Lecturas Totales</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Borradores</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>
              {posts.filter(p => p.status === 'Borrador').length}
            </span>
          </div>
          <span className="badge badge-warning">En revisión</span>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={18} color="#78716c" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Buscar por título, contenido o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>CATEGORÍA:</span>
          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="Todas">Todas</option>
            <option value="Nutrición & Rutinas">Nutrición & Rutinas</option>
            <option value="Salud">Salud</option>
            <option value="Anuncios">Anuncios</option>
            <option value="Bienestar">Bienestar</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Título / Extracto</th>
                <th>Categoría</th>
                <th>Autor</th>
                <th>Fecha Publicación</th>
                <th>Vistas</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron publicaciones.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1c1917' }}>{p.title}</p>
                        <p style={{ fontSize: '0.6875rem', color: '#78716c', maxWidth: '20rem' }}>{p.excerpt}</p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{p.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e', fontWeight: '500' }}>{p.author}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{p.publishDate}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#78716c' }}>
                        <Eye size={14} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{p.views}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Publicado' ? 'badge-success' : 'badge-warning'}`}>
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

      {/* Modal Agregar / Editar Publicación */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>{editingPost ? 'Editar Publicación' : 'Añadir Nueva Publicación'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Título de la Publicación</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej. 5 Rutinas de Cardio en Ayunas"
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Categoría</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Nutrición & Rutinas">Nutrición & Rutinas</option>
                      <option value="Salud">Salud</option>
                      <option value="Anuncios">Anuncios</option>
                      <option value="Bienestar">Bienestar</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Autor</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Fecha de Publicación</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Estado</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Publicado">Publicado</option>
                      <option value="Borrador">Borrador</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Extracto / Resumen</label>
                  <textarea
                    className="admin-textarea"
                    rows="3"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Escribe un breve resumen descriptivo..."
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Publicación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicacionesView;
