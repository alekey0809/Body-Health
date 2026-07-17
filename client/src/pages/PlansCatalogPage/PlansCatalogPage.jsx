import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import './PlansCatalogPage.css';

const PlansCatalogPage = () => {
  const navigate = useNavigate();

  return (
    <div className="plans-catalog-layout">
      <header className="catalog-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <h2>Catálogo de Planes</h2>
      </header>

      <main className="catalog-main">
        <div className="catalog-intro">
          <span className="section-tag">Membresías</span>
          <h1 className="catalog-title">Eleva tu Experiencia</h1>
          <p className="catalog-desc">Selecciona el plan que mejor se adapte a tus objetivos de bienestar y renueva tu acceso a la excelencia.</p>
        </div>

        <div className="catalog-grid">
          {/* Mensual */}
          <div className="catalog-card-standard">
            <span className="catalog-label">Individual</span>
            <h3 className="catalog-name">Mensual</h3>
            <div className="catalog-price-box">
              <span className="catalog-price">$45</span>
              <span className="catalog-period">/ mes</span>
            </div>
            <ul className="catalog-features-list">
              <li><CheckCircle className="check-icon" size={18} /> Acceso total 24/7</li>
              <li><CheckCircle className="check-icon" size={18} /> Evaluación física inicial</li>
              <li><CheckCircle className="check-icon" size={18} /> Lockers privados</li>
            </ul>
            <Link to="/checkout" className="catalog-btn-secondary">Adquirir</Link>
          </div>

          {/* Trimestral (Featured) */}
          <div className="catalog-card-featured">
            <div className="catalog-badge">Recomendado</div>
            <span className="catalog-label">Compromiso</span>
            <h3 className="catalog-name">Trimestral</h3>
            <div className="catalog-price-box">
              <span className="catalog-price">$120</span>
              <span className="catalog-period">/ 3 meses</span>
            </div>
            <ul className="catalog-features-list">
              <li><CheckCircle className="check-icon" size={18} /> Todos los beneficios Mensuales</li>
              <li><CheckCircle className="check-icon" size={18} /> 2 Invitaciones p/mes</li>
              <li><CheckCircle className="check-icon" size={18} /> 1 Sesión de Coaching</li>
            </ul>
            <Link to="/checkout" className="catalog-btn-primary">Adquirir</Link>
          </div>

          {/* Semestral */}
          <div className="catalog-card-standard">
            <span className="catalog-label">Legado</span>
            <h3 className="catalog-name">Semestral</h3>
            <div className="catalog-price-box">
              <span className="catalog-price">$210</span>
              <span className="catalog-period">/ 6 meses</span>
            </div>
            <ul className="catalog-features-list">
              <li><CheckCircle className="check-icon" size={18} /> Beneficios Trimestrales</li>
              <li><CheckCircle className="check-icon" size={18} /> Acceso VIP Lounge</li>
              <li><CheckCircle className="check-icon" size={18} /> Plan Nutricional Mensual</li>
            </ul>
            <Link to="/checkout" className="catalog-btn-secondary">Adquirir</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlansCatalogPage;
