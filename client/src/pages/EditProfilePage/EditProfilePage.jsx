import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    correo: user?.correo || '',
    contacto: user?.contacto || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulación de actualización
    setTimeout(() => {
      setLoading(false);
      setSuccess('Perfil actualizado correctamente.');
      setTimeout(() => navigate('/dashboard'), 1500);
    }, 1000);
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
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDObkVnZ7kIfgJgJBqgnx1ICfy-d7ah8ZiYeBpyCMqzDXzkfu6TnBWKubdU8x_ZR-240Dbt5nHtmYvWrs3Jq2DyeDCmL5lZbLlEcFB5yg57OUGOlmw23rkg0eKkJ5uGfR9J2EiUuHDohXbTsFpCmPHx5FMEUyBduh_JiGSM_6JLcR1mXFbHgdCDTvuJg7w7GeIJP0hIXFFjLzoJ7-As4OLNGt2a0OAKTVbThkBTUrWxMTcZaDJNNFrlDbZxb15Zj3rkDOcJZx0wgG0" alt="Avatar" />
            </div>
            <button className="btn-secondary small-btn">Cambiar Foto</button>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} required disabled />
              <span className="input-help">El correo no se puede cambiar.</span>
            </div>

            <div className="form-group">
              <label htmlFor="contacto">Teléfono</label>
              <input type="tel" id="contacto" name="contacto" value={formData.contacto} onChange={handleChange} required />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancelar</button>
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
