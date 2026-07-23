import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getPlanes } from '../../services/planService';
import './PlansCatalogPage.css';

const PlansCatalogPage = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);

  useEffect(() => {
    const fetchPlanes = async () => {
      const data = await getPlanes();
      setPlanes(data);
    };
    fetchPlanes();
  }, []);

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
          {planes.map((plan, index) => {
            const isFeatured = index === 1;
            const label = index === 0 ? 'Individual' : isFeatured ? 'Compromiso' : 'Legado';
            const durationText = plan.pe_duracion_dias ? `/ ${plan.pe_duracion_dias} días` : '/ mes';
            return (
              <div key={plan.pe_id} className={isFeatured ? "catalog-card-featured" : "catalog-card-standard"}>
                {isFeatured && <div className="catalog-badge">Recomendado</div>}
                <span className="catalog-label">{label}</span>
                <h3 className="catalog-name">{plan.pe_nombre}</h3>
                <div className="catalog-price-box">
                  <span className="catalog-price">${parseFloat(plan.pe_precio_base || 0).toLocaleString('es-CO')}</span>
                  <span className="catalog-period">{durationText}</span>
                </div>
                <ul className="catalog-features-list">
                  <li><CheckCircle className="check-icon" size={18} /> Acceso total 24/7</li>
                  <li><CheckCircle className="check-icon" size={18} /> Evaluación física inicial</li>
                  <li><CheckCircle className="check-icon" size={18} /> Lockers privados</li>
                </ul>
                <Link to={`/checkout?planId=${plan.pe_id}`} className={isFeatured ? "catalog-btn-primary" : "catalog-btn-secondary"}>
                  Adquirir
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default PlansCatalogPage;

