import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Ajusta la ruta según tus carpetas

const HomePage = () => {
  // Traemos el estado del usuario del contexto global de autenticación
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="home-page-container">
      
      {/* 1. Barra de Navegación superior (TopAppBar) */}
      <header className="home-header">
        <div className="header-brand">
          <span className="material-symbols-outlined brand-icon">Bodyhealt</span>
          
        </div>
        
        <nav className="header-nav">
          <a href="#planes" className="nav-link">Planes</a>
          <a href="#ubicacion" className="nav-link">Ubicación</a>
          <a href="#noticias" className="nav-link">Noticias</a>
        </nav>

       <div className="header-actions">
          {/* Si NO hay usuario logueado, mostramos el botón de Ingresar */}
          {!user ? (
            <Link to="/login" className="home-tagline-badge-link">
              <span className="home-tagline-badge">Ingresar</span>
            </Link>
          ) : (
            /* Si SÍ hay usuario logueado, mostramos el botón de Cerrar Sesión */
         
            <>
              <Link to="/dashboard" className="">
                Ir al Dashboard ({user.u_nombres || 'Usuario'})
              </Link>
              
              <button onClick={logout} className="logout-btn">
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {/* 2. Hero Section Principal */}
        <section className="hero-section">
          <div className="hero-bg">
            <img 
              alt="Modern luxury gym interior" 
              className="hero-img" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc7RIfWe6ovZIXAvbiTxX5FchCo2U_HVmba1eUX3q63qiSYBlkr0n3UvS6VaytEOP3ttYu31iDdjcoWNVPkAr-L4DpZ206VwrZy-wK4njR9MynNSb3VEZFTvKMEK2N7bLwcsaZeq6ViOThd3Bnn39wfnbhtQoaUlq8dZ2Kum2YlOZ67PUnjjS_WdrVe0KeDiGO6wRKGroWnacVvtY2HCVJBCRe9QjSFAD0ETiWPhgG_JG9CxEVPX1iY5kUpJITUqlljsOrF-6vxpQ"
            />
          </div>
          <div className="hero-gradient"></div>
          
          <div className="hero-content">
            <div className="hero-text-block">
              <span className="hero-tagline">The Digital Curator of Fitness</span>
              <h1 className="hero-title">
                Cultive su <br /> <span className="italic-title">Excelencia</span>
              </h1>
              <p className="hero-description">
                Un espacio diseñado para la disciplina intelectual y física. Tecnología de vanguardia en un entorno de sofisticación absoluta.
              </p>
            </div>

            {/* 🔀 CONTROL DE ACCESO DINÁMICO SEGÚN LA SESIÓN */}
            <div className="home-button-container">
              {!user ? (
                <>
                  <Link to="/register" className="home-btn-primary">
                    Empieza Hoy
                  </Link>
                  <Link to="/login" className="home-btn-secondary">
                    Ya tengo cuenta
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="home-btn-primary" style={{ backgroundColor: '#231918' }}>
                  Ir al Dashboard ({user.u_nombres || 'Usuario'})
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* 3. Ubicación Section */}
        <section className="ubicacion-section" id="ubicacion">
          <div className="ubicacion-grid">
            <div className="ubicacion-info">
              <span className="section-badge">Presencia</span>
              <h2 className="section-title">Nuestra Sede</h2>
              <p className="section-text">
                Ubicados en el corazón del distrito financiero, ofrecemos un refugio de alto rendimiento para el profesional moderno.
              </p>
              <div className="info-cards">
                <div className="info-card">
                  <div className="card-icon-wrapper"><span className="material-symbols-outlined">location_on</span></div>
                  <div>
                    <p className="card-bold-text">Av. Libertador 1450</p>
                    <p className="card-sub-text">Buenos Aires, Argentina</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="card-icon-wrapper"><span className="material-symbols-outlined">schedule</span></div>
                  <div>
                    <p className="card-bold-text">Lunes a Viernes</p>
                    <p className="card-sub-text">06:00 — 23:00</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="ubicacion-map-wrapper">
              {/* <img 
                alt="Map of Bodyhealt location" 
                className="map-img" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCjB8BQrXPDzEgaVF7FKHWT9r1sakK1BLCJpb5mIxLVpBsd8oKx1JsZ4vuntrv-vhzY_ouMIttut0RYKQrrJt7iEhoBCzMJZv9QpeisONzKRAKLAr_lOntk2BYLakOHuahtb3xcv4y57blBLKa2G9E7VGDYX_VPEuyqSpEEujkchOBilA1LOyRzhcfwVdeiePZ6jKy3al1b_PpyAbf0fu2TdFrc2Nom478ymYEJXd8ukEhUsIhe6yHuamLi-DJ8Ad962ISYP2ZFA4"
              /> */}
              <iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d993.5790149054532!2d-75.49925030000004!3d5.052418400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4765667273dc79%3A0x7304f6bac0f84a31!2sCra.%2065%20Bis%20%236564%2C%20Manizales%2C%20Caldas!5e0!3m2!1ses-419!2sco!4v1783444122433!5m2!1ses-419!2sco"
  width="100%" 
  height="100%" 
  style={{ border: 0 }} 
  allowFullScreen={true} 
  loading="lazy" 
  title="Ubicación Bodyhealt"
></iframe>
            </div>
          </div>
        </section>

        {/* 4. Planes / Membresías Section */}
        <section className="planes-section" id="planes">
          <div className="section-center-header">
            <span className="section-badge">Membresías</span>
            <h2 className="section-title-center">Selección de Planes</h2>
            <div className="header-divider-line"></div>
          </div>

          <div className="planes-grid">
            {/* Plan Mensual */}
            <div className="plan-card">
              <span className="plan-tier">Individual</span>
              <h3 className="plan-name">Mensual</h3>
              <div className="plan-price-block">
                <span className="price-amount">$45</span><span className="price-period">/ mes</span>
              </div>
              <ul className="plan-features">
                <li><span className="material-symbols-outlined icon-check">check_circle</span> Acceso total 24/7</li>
                <li><span className="material-symbols-outlined icon-check">check_circle</span> Evaluación física inicial</li>
                <li><span className="material-symbols-outlined icon-check">check_circle</span> Lockers privados</li>
              </ul>
              {!user ? (
                <Link to="/register" className="plan-btn-secondary">Seleccionar</Link>
              ) : (
                <Link to="/dashboard" className="plan-btn-secondary">Adquirir</Link>
              )}
            </div>

            {/* Plan Trimestral (Destacado) */}
            <div className="plan-card plan-card-featured">
              <div className="featured-badge">Más Elegido</div>
              <span className="plan-tier">Compromiso</span>
              <h3 className="plan-name">Trimestral</h3>
              <div className="plan-price-block">
                <span className="price-amount">$120</span><span className="price-period">/ 3 meses</span>
              </div>
              <ul className="plan-features">
                <li><span className="material-symbols-outlined icon-check">check_circle</span> Todos los beneficios Mensuales</li>
                <li><span className="material-symbols-outlined icon-check">check_circle</span> 2 Invitaciones p/mes</li>
                <li><span className="material-symbols-outlined icon-check">check_circle</span> 1 Sesión de Coaching</li>
              </ul>
              {!user ? (
                <Link to="/register" className="plan-btn-primary">Seleccionar</Link>
              ) : (
                <Link to="/dashboard" className="plan-btn-primary">Adquirir</Link>
              )}
            </div>

            {/* Plan Semestral */}
            <div className="plan-card">
              <span className="plan-tier">Legado</span>
              <h3 className="plan-name">Semestral</h3>
              <div className="plan-price-block">
                <span className="price-amount">$210</span><span className="price-period">/ 6 meses</span>
              </div>
              <ul className="plan-features">
                <li><span className="material-symbols-outlined icon-check">check_circle</span> Beneficios Trimestrales</li>
                <li><span className="material-symbols-outlined icon-check">check_circle</span> Acceso VIP Lounge</li>
                <li><span className="material-symbols-outlined icon-check">check_circle</span> Plan Nutricional Mensual</li>
              </ul>
              {!user ? (
                <Link to="/register" className="plan-btn-secondary">Seleccionar</Link>
              ) : (
                <Link to="/dashboard" className="plan-btn-secondary">Adquirir</Link>
              )}
            </div>
          </div>
        </section>

        {/* 5. Noticias Section */}
        <section className="noticias-section" id="noticias">
          <div className="noticias-header">
            <div>
              <span className="section-badge">Curaduría</span>
              <h2 className="section-title">Últimas Noticias</h2>
            </div>
          </div>

          <div className="noticias-grid">
            <div className="news-card-large">
              <img alt="Gym training" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD--EPeexjQ4pcMZ9AZsPTiszFiJyl9GP38aOobdQS5n7uxIBL9SBPLtu9RvRftdbNz-QpD4TBbjpgO2ON49YMMS0OBjdvxUnYMRC18gDiCYlPKpDmHui_8kpxFr15pvdKLm6Cy0_w2bu8B10IKcEtoGtBWr_HSyVsx6Iluj5BdxX9wB6stq4e2omsBmH_jGhs12dusaZ34419ewMQKwdLXzhiCffnEKxGhKQXwpLpnfnBZquvctSotSlVfV_7rjHwODNnb6G7vMIU" />
              <div className="news-large-overlay">
                <span className="news-tag">Evento Especial</span>
                <h3>Masterclass de Powerlifting con Alex Kovac</h3>
              </div>
            </div>
            <div className="news-card-small">
              <img alt="Yoga session" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACH8Wa322I4hKi4uGEzW88GXa1MI5SgMMDwyRDSYsKmidKSZegHzoWde__K3j6yDZoPfI--VmqiSMSzx5kqze8W-6ISBv1LpNvTTdpWerqIQ1fTfEa9pWN_CIV-WGCdHsHFEvpKUSCbl-HcK4q8nCFMarFk1XyqYvdzPpmfQfZMceUz8DILR4v4G_6JpwBiTYaxmQTJshaJkWAxxIvi7RBonZ3VxvwMOIBpsgUPymu6w8CBwdiYibdYSgmKV9czong0ga35j3c2ac" />
              <div className="news-small-overlay"><h4>Nuevas Sesiones de Yoga Flow</h4></div>
            </div>
            <div className="news-card-small">
              <img alt="Nutrition" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfYObRVaSy3_fRWvsOa0pclKKlZuSE0Isk6suSBJbsaQCZQ8r74VMJtOKm36AUbj-txura2YIvH12kEMdVVwtWwQlDi-akyghTrv7UUr-jiVap55xr0A0abIyKc75WoeYH00HKOlfdlQ2gpfwsjy0V3kvYxST4zuTqsl04ypKMcp1lnUzMw4TXVo1IK96sFeHPJDEYPoO-7uW8Nqltk3p4ScbNgDrfuvYzh3l8cLKOO0zHlxEUv54frO1AlLVNUcfnjxH0EzIGqfA" />
              <div className="news-small-overlay"><h4>Guía Nutricional Verano 2024</h4></div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer Alexandria Premium */}
      <footer className="home-footer">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <span className="footer-logo">Bodyhealt</span>
            <p className="footer-brand-text">
              La excelencia no es un acto, sino un hábito. Únete a la élite del bienestar digital y físico.
            </p>
          </div>
          <div>
            <h4 className="footer-col-title">Navegación</h4>
            <ul className="footer-links">
              <li><a href="#planes">Planes</a></li>
              <li><a href="#ubicacion">Ubicación</a></li>
              <li><a href="#noticias">Noticias</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Contacto</h4>
            <ul className="footer-contact-list">
              <li><span className="material-symbols-outlined">phone</span> +54 11 4455-8899</li>
              <li><span className="material-symbols-outlined">mail</span> curator@alexandria.gym</li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Manifesto</h4>
            <p className="footer-manifesto-text">"La excelencia no es un acto, sino un hábito."</p>
            <p className="footer-copyright">© 2026 Bodyhealt Collective.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;