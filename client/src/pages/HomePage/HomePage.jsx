import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page-container" style={{ flexDirection: 'column', textAlign: 'center' }}>
      <div className="glass-container" style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#ff6b76', marginBottom: '1.5rem' }}>
          Tu salud, tu prioridad.
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', color: '#8a7c73', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Bienvenido a Body Health, la plataforma integral donde podrás gestionar tu entrenamiento, ver tu progreso y llevar tu estilo de vida al siguiente nivel.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn-primary" style={{ width: 'auto', padding: '1rem 2rem' }}>
            Empieza Hoy
          </Link>
          <Link to="/login" className="btn-secondary" style={{ width: 'auto', padding: '1rem 2rem' }}>
            Ya tengo cuenta
          </Link>
        </div>
      </div>
      
      {/* Elementos decorativos de fondo o características extra pueden ir aquí */}
    </div>
  );
};

export default HomePage;
