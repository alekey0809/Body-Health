import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, CheckCircle, ArrowUpRight, Share2, AtSign, Phone, X, Calendar, User } from 'lucide-react';
import { getPlanes } from '../../services/planService';
import { getNoticias } from '../../services/noticiaService';
import './HomePage.css';

const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD--EPeexjQ4pcMZ9AZsPTiszFiJyl9GP38aOobdQS5n7uxIBL9SBPLtu9RvRftdbNz-QpD4TBbjpgO2ON49YMMS0OBjdvxUnYMRC18gDiCYlPKpDmHui_8kpxFr15pvdKLm6Cy0_w2bu8B10IKcEtoGtBWr_HSyVsx6Iluj5BdxX9wB6stq4e2omsBmH_jGhs12dusaZ34419ewMQKwdLXzhiCffnEKxGhKQXwpLpnfnBZquvctSotSlVfV_7rjHwODNnb6G7vMIU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuACH8Wa322I4hKi4uGEzW88GXa1MI5SgMMDwyRDSYsKmidKSZegHzoWde__K3j6yDZoPfI--VmqiSMSzx5kqze8W-6ISBv1LpNvTTdpWerqIQ1fTfEa9pWN_CIV-WGCdHsHFEvpKUSCbl-HcK4q8nCFMarFk1XyqYvdzPpmfQfZMceUz8DILR4v4G_6JpwBiTYaxmQTJshaJkWAxxIvi7RBonZ3VxvwMOIBpsgUPymu6w8CBwdiYibdYSgmKV9czong0ga35j3c2ac",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfYObRVaSy3_fRWvsOa0pclKKlZuSE0Isk6suSBJbsaQCZQ8r74VMJtOKm36AUbj-txura2YIvH12kEMdVVwtWwQlDi-akyghTrv7UUr-jiVap55xr0A0abIyKc75WoeYH00HKOlfdlQ2gpfwsjy0V3kvYxST4zuTqsl04ypKMcp1lnUzMw4TXVo1IK96sFeHPJDEYPoO-7uW8Nqltk3p4ScbNgDrfuvYzh3l8cLKOO0zHlxEUv54frO1AlLVNUcfnjxH0EzIGqfA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDPhwvb3NOxNEARMN9wkyx-xhCzgcH8Xev3KXQB5o6Rln9FNHH29pd5INA7nVDzfMum_CNuk-AjZ3rsC_l6y_Tky-xm8qTmEwSZOAZMk9-4whTX38jA7pz89fVVkADOUOXiMKkyP_jTceywqYSzBM8vDpH15hWy0Rq1HHRXijzuz2fw3bcqMH6rZ8ZvWFzSWJr_WR1IFmKt0KdlZlJlkPtYTIgw2ySEOv3yeSpnVZIXqI_-JVO4Z0iApxY6kUds43HtqyW2sg4Xd5M"
];

const HomePage = () => {
  const [planes, setPlanes] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [selectedNoticia, setSelectedNoticia] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const planesData = await getPlanes();
      setPlanes(planesData || []);

      const noticiasData = await getNoticias('ACTIVA');
      setNoticias(noticiasData || []);
    };
    fetchData();
  }, []);

  return (
    <div className="home-page-wrapper">
      <main>
        {/* Hero Section */}
        <section className="home-hero">
          <div className="hero-bg-overlay">
            <img 
              alt="Modern luxury gym interior" 
              className="hero-image" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc7RIfWe6ovZIXAvbiTxX5FchCo2U_HVmba1eUX3q63qiSYBlkr0n3UvS6VaytEOP3ttYu31iDdjcoWNVPkAr-L4DpZ206VwrZy-wK4njR9MynNSb3VEZFTvKMEK2N7bLwcsaZeq6ViOThd3Bnn39wfnbhtQoaUlq8dZ2Kum2YlOZ67PUnjjS_WdrVe0KeDiGO6wRKGroWnacVvtY2HCVJBCRe9QjSFAD0ETiWPhgG_JG9CxEVPX1iY5kUpJITUqlljsOrF-6vxpQ" 
            />
          </div>
          <div className="hero-gradient"></div>
          
          <div className="hero-content-container">
            <div className="hero-text-area">
              <span className="hero-subtitle">The Digital Curator of Fitness</span>
              <h1 className="hero-title">
                Cultive su <br /> <span className="hero-title-italic">Excelencia</span>
              </h1>
              <p className="hero-description">
                Un espacio diseñado para la disciplina intelectual y física. Tecnología de vanguardia en un entorno de sofisticación absoluta.
              </p>
            </div>
            
            {/* Hero Action Button */}
            <div className="hero-action-container">
              <Link to="/login" className="hero-action-btn-group">
                <span className="hero-action-label">Comience hoy</span>
                <div className="hero-action-circle-group">
                  <span className="hero-action-circle">
                    <ArrowRight size={24} weight="bold" />
                  </span>
                  <span className="hero-action-text">Inscribite</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Ubicación Section */}
        <section className="home-location" id="ubicacion">
          <div className="home-container">
            <div className="location-grid">
              <div className="location-text">
                <span className="section-tag">Presencia</span>
                <h2 className="section-heading">Nuestra Sede</h2>
                <p className="section-desc">
                  Ubicados en el corazón del distrito financiero, ofrecemos un refugio de alto rendimiento para el profesional moderno.
                </p>
                
                <div className="location-details">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="detail-title">Av. Libertador 1450</p>
                      <p className="detail-sub">Buenos Aires, Argentina</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="detail-title">Lunes a Viernes</p>
                      <p className="detail-sub">06:00 — 23:00</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="location-map">
               <iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d993.5790149054532!2d-75.49925030000004!3d5.052418400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4765667273dc79%3A0x7304f6bac0f84a31!2sCra.%2065%20Bis%20%236564%2C%20Manizales%2C%20Caldas!5e0!3m2!1ses-419!2sco!4v1783444122433!5m2!1ses-419!2sco"
  width="100%" 
  height="100%" 
  style={{ border: 0 }} 
  allowFullScreen={true} 
  loading="lazy" 
  title="Ubicación Bodyhealt"
></iframe>
                <div className="map-overlay"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Planes Section */}
        <section className="home-plans" id="planes">
          <div className="home-container">
            <div className="plans-header">
              <span className="section-tag">Membresías</span>
              <h2 className="section-heading">Selección de Planes</h2>
              <div className="header-line"></div>
            </div>
            
            <div className="plans-grid">
              {planes.slice(0, 3).map((plan, index) => {
                const isFeatured = index === 1;
                const label = index === 0 ? 'Individual' : isFeatured ? 'Compromiso' : 'Legado';
                return (
                  <div key={plan.pe_id} className={isFeatured ? "plan-card-featured" : "plan-card-standard"}>
                    {isFeatured && <div className="featured-badge">Más Elegido</div>}
                    <span className="plan-label">{label}</span>
                    <h3 className="plan-name">{plan.pe_nombre}</h3>
                    <div className="plan-price-box">
                      <span className="plan-price">${parseFloat(plan.pe_precio_base || 0).toLocaleString('es-CO')}</span>
                      <span className="plan-period">/ mes</span>
                    </div>
                    <ul className="plan-features-list">
                      <li><CheckCircle className="check-icon" size={18} /> Acceso total 24/7</li>
                      <li><CheckCircle className="check-icon" size={18} /> Evaluación física inicial</li>
                      <li><CheckCircle className="check-icon" size={18} /> Lockers privados</li>
                    </ul>
                    <Link to={`/checkout?planId=${plan.pe_id}`} className={isFeatured ? "plan-btn-primary" : "plan-btn-secondary"}>
                      Seleccionar
                    </Link>
                  </div>
                );
              })}
            </div>
            
            <div className="plans-footer">
              <Link to="/planes" className="view-more-link">
                <span>mas planes</span>
                <ArrowRight size={16} className="arrow-icon" />
              </Link>
            </div>
          </div>
        </section>

        {/* Noticias Section */}
        <section className="home-news" id="noticias">
          <div className="home-container">
            <div className="news-header">
              <div>
                <span className="section-tag">Curaduría</span>
                <h2 className="section-heading">Últimas Noticias</h2>
              </div>
              <div className="social-links">
                <a href="#">Instagram <ArrowUpRight size={14} /></a>
                <a href="#">Facebook <ArrowUpRight size={14} /></a>
              </div>
            </div>
            
            <div className="news-grid">
              {noticias.length === 0 ? (
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No hay noticias publicadas en este momento.</p>
              ) : (
                noticias.map((item, index) => {
                  const defaultImg = fallbackImages[index % fallbackImages.length];
                  const imgSrc = item.n_imagen || defaultImg;
                  
                  let cardClass = "news-card-small";
                  let overlayClass = "news-overlay-small";
                  
                  if (index === 0) {
                    cardClass = "news-card-large";
                    overlayClass = "news-overlay";
                  } else if (index === 3 || (index > 3 && index % 4 === 3)) {
                    cardClass = "news-card-wide";
                    overlayClass = "news-overlay-wide";
                  }

                  return (
                    <div 
                      key={item.n_id || index} 
                      className={cardClass}
                      onClick={() => setSelectedNoticia({ ...item, imgSrc })}
                      title="Haz clic para ver el detalle de la noticia"
                    >
                      <img alt={item.n_titulo} src={imgSrc} />
                      <div className={overlayClass}>
                        {index === 0 && <span className="news-badge">Noticia Destacada</span>}
                        {index === 0 ? <h3>{item.n_titulo}</h3> : <h4>{item.n_titulo}</h4>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal Detalle de Noticia */}
      {selectedNoticia && (
        <div className="news-modal-overlay" onClick={() => setSelectedNoticia(null)}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="news-modal-close-btn" 
              onClick={() => setSelectedNoticia(null)} 
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            <div className="news-modal-hero">
              <img src={selectedNoticia.imgSrc} alt={selectedNoticia.n_titulo} />
              <div className="news-modal-hero-gradient"></div>
            </div>

            <div className="news-modal-body">
              <div className="news-modal-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <User size={14} color="var(--primary)" />
                  {selectedNoticia.autor_nombre || 'Admin BodyHealth'}
                </span>
                {selectedNoticia.n_fecha_publicacion && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar size={14} color="var(--primary)" />
                    {new Date(selectedNoticia.n_fecha_publicacion).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>

              <h2 className="news-modal-title">{selectedNoticia.n_titulo}</h2>
              <p className="news-modal-text">{selectedNoticia.n_contenido}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div className="footer-brand-col">
            <span className="footer-logo">Bodyhealt</span>
            <p className="footer-brand-text">La excelencia no es un acto, sino un hábito. Únete a la élite del bienestar digital y físico.</p>
            <div className="footer-social-icons">
              <a href="#"><Share2 size={16} /></a>
              <a href="#"><AtSign size={16} /></a>
              <a href="#"><Phone size={16} /></a>
            </div>
          </div>
          
          <div className="footer-links-col">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#planes">Planes</a></li>
              <li><a href="#ubicacion">Ubicación</a></li>
              <li><a href="#noticias">Noticias</a></li>
              <li><a href="#">Privacidad</a></li>
            </ul>
          </div>
          
          <div className="footer-contact-col">
            <h4>Contacto</h4>
            <ul>
              <li><Phone size={14} className="contact-icon" /> +54 11 4455-8899</li>
              <li><AtSign size={14} className="contact-icon" /> curator@alexandria.gym</li>
              <li><MapPin size={14} className="contact-icon" /> Recoleta, CABA</li>
            </ul>
          </div>
          
          <div className="footer-newsletter-col">
            <h4>Manifesto</h4>
            <p>Suscríbete a nuestra curaduría semanal de salud y bienestar.</p>
            <div className="newsletter-input">
              <input type="email" placeholder="Email Address" />
              <button><ArrowRight size={18} /></button>
            </div>
          </div>
        </div>
        
        <div className="home-container footer-bottom">
          <p>© 2024 Bodyhealt Collective. The Digital Curator of Fitness.</p>
          <div className="footer-cities">
            <span>Buenos Aires</span>
            <span>Montevideo</span>
            <span>Santiago</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;