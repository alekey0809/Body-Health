import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import api from '../../services/api';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: user?.correo || '',
    contacto: '',
    numeroDocumento: ''
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Cargar información real del usuario desde la BD al cargar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setInitialLoading(false);
        return;
      }
      try {
        const response = await api.get(`/api/users/${user.id}`);
        const dbUser = response.data;
        if (dbUser) {
          setFormData({
            nombres: dbUser.u_nombres || '',
            apellidos: dbUser.u_apellidos || '',
            correo: dbUser.u_correo_electronico || user?.correo || '',
            contacto: dbUser.u_numero_contacto || '',
            numeroDocumento: dbUser.u_numero_documento || ''
          });
        }
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
        // Fallback si falla la consulta
        const nameParts = (user?.nombre || '').split(' ');
        const initialNombres = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
        const initialApellidos = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
        setFormData(prev => ({
          ...prev,
          nombres: initialNombres,
          apellidos: initialApellidos,
          contacto: user?.contacto || ''
        }));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Llamar al endpoint correcto de actualización de perfil: /api/users/profile/:id
      const response = await api.put(`/api/users/profile/${user.id}`, {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        contacto: formData.contacto
      });

      if (response.data.ok) {
        // Actualizar el usuario en el contexto y en localStorage
        const updatedUser = {
          ...user,
          nombre: response.data.user.nombre,
          contacto: response.data.user.contacto
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccess('¡Perfil actualizado correctamente!');
        setTimeout(() => navigate('/dashboard'), 1200);
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
      {/* Botón de flecha para regresar al Dashboard */}
      <header className="profile-header">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="back-btn" 
          title="Volver al Dashboard"
          aria-label="Volver al Dashboard"
        >
          <ArrowLeft size={20} />
          <span className="back-btn-text">Volver </span>
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
            <p className="profile-name-display">
              {formData.nombres ? `${formData.nombres} ${formData.apellidos}` : (user?.nombre || 'Usuario')}
            </p>
          </div>

          {initialLoading ? (
            <div className="profile-loading-box">Cargando información del usuario desde la base de datos...</div>
          ) : (
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
                <span className="input-help">El correo electrónico no se puede modificar.</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contacto">Teléfono de Contacto <span style={{fontWeight:400, textTransform:'none', fontSize:'0.7rem'}}>(opcional)</span></label>
                  <input
                    type="tel"
                    id="contacto"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleChange}
                    placeholder="Ej: +57 300 123 4567"
                  />
                </div>

                {formData.numeroDocumento && (
                  <div className="form-group">
                    <label htmlFor="numeroDocumento">Número de Documento</label>
                    <input
                      type="text"
                      id="numeroDocumento"
                      name="numeroDocumento"
                      value={formData.numeroDocumento}
                      disabled
                    />
                    <span className="input-help">Documento registrado en sistema.</span>
                  </div>
                )}
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
          )}
        </div>
      </main>
    </div>
  );
};

export default EditProfilePage;
