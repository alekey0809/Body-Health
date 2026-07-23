import React from 'react';
import { Users, Dumbbell, CreditCard, UserCheck, FileText, ArrowRight, TrendingUp, Activity, ShieldCheck } from 'lucide-react';

const InicioView = ({ setActiveTab }) => {
  return (
    <div>
      {/* Title */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Panel General</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Bienvenido al centro de administración global de BodyHealth. Selecciona un CRUD o visualiza el resumen general.
          </p>
        </div>
      </section>

      {/* Global Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Total Usuarios</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>1,240</span>
          </div>
          <span className="badge badge-success">+12% este mes</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Entrenadores</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>24</span>
          </div>
          <span className="badge badge-primary">Activos</span>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem' }}>Ingresos del Mes</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif' }}>$42,850</span>
          </div>
          <span className="badge badge-warning">Target 94%</span>
        </div>
      </section>

      {/* Access Cards to CRUDs */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1c1917' }}>Módulos de Gestión (CRUDs)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="quick-card" onClick={() => setActiveTab('entrenadores')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(224, 23, 23, 0.1)', color: 'var(--primary)' }}>
              <UserCheck size={24} />
            </div>
            <ArrowRight size={18} color="#a8a29e" />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Entrenadores</h4>
            <p style={{ fontSize: '0.8125rem', color: '#78716c' }}>Administrar staff, especialidades y horarios de clase.</p>
          </div>
        </div>

        <div className="quick-card" onClick={() => setActiveTab('planes')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#b45309' }}>
              <Dumbbell size={24} />
            </div>
            <ArrowRight size={18} color="#a8a29e" />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Planes</h4>
            <p style={{ fontSize: '0.8125rem', color: '#78716c' }}>Catálogo de membresías, precios y beneficios.</p>
          </div>
        </div>

        <div className="quick-card" onClick={() => setActiveTab('pagos')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#047857' }}>
              <CreditCard size={24} />
            </div>
            <ArrowRight size={18} color="#a8a29e" />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Pagos</h4>
            <p style={{ fontSize: '0.8125rem', color: '#78716c' }}>Registro de cobros, transacciones y facturación.</p>
          </div>
        </div>

        <div className="quick-card" onClick={() => setActiveTab('usuarios')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8' }}>
              <Users size={24} />
            </div>
            <ArrowRight size={18} color="#a8a29e" />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Usuarios</h4>
            <p style={{ fontSize: '0.8125rem', color: '#78716c' }}>Gestión de cuentas de clientes, roles y membresías.</p>
          </div>
        </div>

        <div className="quick-card" onClick={() => setActiveTab('publicaciones')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#6d28d9' }}>
              <FileText size={24} />
            </div>
            <ArrowRight size={18} color="#a8a29e" />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Publicaciones</h4>
            <p style={{ fontSize: '0.8125rem', color: '#78716c' }}>Noticias, comunicados y artículos del gimnasio.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <section className="data-table-container">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Actividad Reciente del Sistema</h4>
          <span style={{ fontSize: '0.75rem', color: '#78716c' }}>Actualizado hace 5 min</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Módulo</th>
                <th>Detalle</th>
                <th>Fecha / Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span style={{ fontWeight: '600' }}>Registro de Pago</span></td>
                <td><span className="badge badge-neutral">Pagos</span></td>
                <td>Laura Gómez renovó Plan Pro ($49.99)</td>
                <td>22/07/2026 10:14 AM</td>
                <td><span className="badge badge-success">Completado</span></td>
              </tr>
              <tr>
                <td><span style={{ fontWeight: '600' }}>Nuevo Entrenador</span></td>
                <td><span className="badge badge-neutral">Entrenadores</span></td>
                <td>Se dio de alta a Carlos Mendoza (Musculación)</td>
                <td>21/07/2026 04:30 PM</td>
                <td><span className="badge badge-primary">Activo</span></td>
              </tr>
              <tr>
                <td><span style={{ fontWeight: '600' }}>Nueva Publicación</span></td>
                <td><span className="badge badge-neutral">Publicaciones</span></td>
                <td>Publicado: "5 Ejercicios Clave para Hipertrofia"</td>
                <td>20/07/2026 09:00 AM</td>
                <td><span className="badge badge-success">Publicado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default InicioView;
