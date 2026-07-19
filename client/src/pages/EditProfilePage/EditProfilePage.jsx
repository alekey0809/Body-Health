import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import api from '../../services/api';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // El nombre completo viene como "nombres apellidos", lo separamos
  const nameParts = (user?.nombre || '').split(' ');
  const initialNombres = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
  const initialApellidos = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

  const [formData, setFormData] = useState({
    nombres: initialNombres,
    apellidos: initialApellidos,
    correo: user?.correo || '',
    contacto: user?.contacto || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.put(`/api/users/${user.id}`, {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        contacto: formData.contacto
      });

      if (response.data.ok) {
        // Actualizar el usuario en el contexto y en localStorage
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccess('¡Perfil actualizado correctamente!');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-layout">
      <header className="profile-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <h2>Editar Perfil</h2>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="avatar-large">
              <div className="avatar-placeholder">
                <User size={48} />
              </div>
            </div>
            <p className="profile-name-display">{user?.nombre || 'Usuario'}</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message-profile">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombres">Nombres</label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: García López"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                disabled
              />
              <span className="input-help">El correo no se puede modificar.</span>
            </div>

            <div className="form-group">
              <label htmlFor="contacto">Teléfono de Contacto <span style={{fontWeight:400, textTransform:'none', fontSize:'0.65rem'}}>(opcional)</span></label>
              <input
                type="tel"
                id="contacto"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                placeholder="Ej: +57 300 123 4567"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfilePage;
