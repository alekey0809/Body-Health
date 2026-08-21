import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';
import { getNoticias, createNoticia, updateNoticia, deleteNoticia } from '../../../services/noticiaService';
import { AuthContext } from '../../../context/AuthContext';

const PublicacionesView = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    n_titulo: '',
    n_contenido: '',
    n_imagen: '',
    n_fecha_publicacion: new Date().toISOString().split('T')[0],
    n_estado: 'ACTIVA'
  });

  const fetchNoticias = async () => {
    setLoading(true);
    try {
      const data = await getNoticias();
      setPosts(data || []);
    } catch (err) {
      console.error('Error al cargar noticias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const handleOpenModal = (post = null) => {
    setErrorMessage('');
    if (post) {
      setEditingPost(post);
      const pubDate = post.n_fecha_publicacion 
        ? new Date(post.n_fecha_publicacion).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setFormData({
        n_titulo: post.n_titulo || '',
        n_contenido: post.n_contenido || '',
        n_imagen: post.n_imagen || '',
        n_fecha_publicacion: pubDate,
        n_estado: post.n_estado || 'ACTIVA'
      });
    } else {
      setEditingPost(null);
      setFormData({
        n_titulo: '',
        n_contenido: '',
        n_imagen: '',
        n_fecha_publicacion: new Date().toISOString().split('T')[0],
        n_estado: 'ACTIVA'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setErrorMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.n_titulo.trim() || !formData.n_contenido.trim()) {
      setErrorMessage('El título y el contenido son requeridos.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      if (editingPost) {
        await updateNoticia(editingPost.n_id, {
          ...formData
        });
      } else {
        await createNoticia({
          ...formData,
          n_u_id: user?.u_id || null
        });
      }
      await fetchNoticias();
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar noticia:', err);
      setErrorMessage(err.response?.data?.message || 'Ocurrió un error al guardar la publicación.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      try {
        await deleteNoticia(id);
        await fetchNoticias();
      } catch (err) {
        console.error('Error al eliminar noticia:', err);
        alert('No se pudo eliminar la noticia.');
      }
    }
  };

  const filteredPosts = posts.filter(p => {
    const title = p.n_titulo || '';
    const content = p.n_contenido || '';
    const author = p.autor_nombre || '';

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isActiva = p.n_estado === 'ACTIVA' || p.n_estado === 'Publicado';
    const matchesStatus = statusFilter === 'Todas' || 
      (statusFilter === 'ACTIVA' && isActiva) || 
      (statusFilter === 'INACTIVA' && !isActiva);

    return matchesSearch && matchesStatus;
  });

  const totalActivas = posts.filter(p => p.n_estado === 'ACTIVA' || p.n_estado === 'Publicado').length;
  const totalInactivas = posts.filter(p => p.n_estado === 'INACTIVA' || p.n_estado === 'Borrador').length;

  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Gestión de Publicaciones</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Crea, edita y gestiona las noticias y publicaciones del gimnasio en la Landing Page.
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
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Noticias</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{posts.length}</span>
          </div>
          <span className="badge badge-primary">Base de Datos</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Publicadas (Activas)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{totalActivas}</span>
          </div>
          <span className="badge badge-success">Visibles en Landing</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Inactivas / Borradores</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>{totalInactivas}</span>
          </div>
          <span className="badge badge-warning">Ocultas</span>
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
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78716c' }}>ESTADO:</span>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todas">Todas</option>
            <option value="ACTIVA">Activas (Publicadas)</option>
            <option value="INACTIVA">Inactivas (Ocultas)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <section className="data-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Título / Contenido</th>
                <th>Autor</th>
                <th>Fecha Publicación</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    Cargando noticias de la base de datos...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
                    No se encontraron publicaciones.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((p) => {
                  const isActiva = p.n_estado === 'ACTIVA' || p.n_estado === 'Publicado';
                  const pubDate = p.n_fecha_publicacion 
                    ? new Date(p.n_fecha_publicacion).toLocaleDateString('es-CO')
                    : 'Sin fecha';

                  return (
                    <tr key={p.n_id}>
                      <td style={{ width: '60px' }}>
                        {p.n_imagen ? (
                          <img 
                            src={p.n_imagen} 
                            alt={p.n_titulo} 
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} 
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', backgroundColor: '#e7e5e4', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={20} color="#a8a29e" />
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1c1917', marginBottom: '0.25rem' }}>{p.n_titulo}</p>
                          <p style={{ fontSize: '0.75rem', color: '#78716c', maxWidth: '24rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.n_contenido}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#57534e', fontWeight: '500' }}>
                          {p.autor_nombre || 'Admin BodyHealth'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#57534e' }}>{pubDate}</span>
                      </td>
                      <td>
                        <span className={`badge ${isActiva ? 'badge-success' : 'badge-warning'}`}>
                          {isActiva ? 'ACTIVA' : 'INACTIVA'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button className="btn-icon" onClick={() => handleOpenModal(p)} title="Editar"><Edit size={18} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete(p.n_id)} title="Eliminar"><Trash2 size={18} /></button>
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

      {/* Modal Agregar / Editar Publicación */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3>{editingPost ? 'Editar Publicación' : 'Añadir Nueva Publicación'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            {errorMessage && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', fontSize: '0.875rem', borderRadius: '4px', margin: '1rem 1rem 0 1rem' }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Título de la Publicación *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.n_titulo}
                    onChange={(e) => setFormData({ ...formData, n_titulo: e.target.value })}
                    placeholder="Ej. 5 Ejercicios Clave para Hipertrofia Muscular"
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Fecha de Publicación</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={formData.n_fecha_publicacion}
                      onChange={(e) => setFormData({ ...formData, n_fecha_publicacion: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Estado</label>
                    <select
                      className="admin-select"
                      value={formData.n_estado}
                      onChange={(e) => setFormData({ ...formData, n_estado: e.target.value })}
                    >
                      <option value="ACTIVA">ACTIVA (Visible en Landing)</option>
                      <option value="INACTIVA">INACTIVA (Oculta)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>URL de la Imagen Descriptiva</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={formData.n_imagen}
                    onChange={(e) => setFormData({ ...formData, n_imagen: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Contenido / Resumen de la Noticia *</label>
                  <textarea
                    className="admin-textarea"
                    rows="5"
                    value={formData.n_contenido}
                    onChange={(e) => setFormData({ ...formData, n_contenido: e.target.value })}
                    placeholder="Escribe el contenido de la publicación..."
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Publicación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicacionesView;
