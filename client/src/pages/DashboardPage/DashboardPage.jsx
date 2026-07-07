import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Activity, CreditCard, CalendarCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dataGrafica = [
  { name: 'Lun', calorias: 400 },
  { name: 'Mar', calorias: 300 },
  { name: 'Mie', calorias: 550 },
  { name: 'Jue', calorias: 200 },
  { name: 'Vie', calorias: 600 },
  { name: 'Sab', calorias: 700 },
  { name: 'Dom', calorias: 350 },
];

const DashboardPage = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Cargando datos del usuario...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ marginBottom: '2rem' }}>¡Hola, {user.nombre}! 👋</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* 1. Datos Personales */}
        <div className="glass-container" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <User color="#ff8c94" /> Mis Datos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p><strong>Nombre:</strong> {user.nombre}</p>
            <p><strong>Correo:</strong> {user.correo}</p>
            <button className="btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem' }}>Editar Perfil</button>
          </div>
        </div>

        {/* 2. Gráficas (Salud/Progreso) */}
        <div className="glass-container" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Activity color="#ffb3ba" /> Progreso de Actividad
          </h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(217, 208, 199, 0.5)" />
                <XAxis dataKey="name" stroke="#8a7c73" />
                <YAxis stroke="#8a7c73" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px', border: 'none' }} />
                <Line type="monotone" dataKey="calorias" stroke="#ff8c94" strokeWidth={3} dot={{ r: 5, fill: '#ff8c94' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Estado de Pagos */}
        <div className="glass-container" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CreditCard color="#ffdfba" /> Estado de Pagos
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Membresía Mensual</p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Vence: 15/Ago/2026</p>
            </div>
            <span style={{ background: '#c8e6c9', color: '#2e7d32', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Al día</span>
          </div>
          <button className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem' }}>Historial de Pagos</button>
        </div>

        {/* 4. Control de Asistencias */}
        <div className="glass-container" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CalendarCheck color="#ffffba" /> Mis Asistencias
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ background: 'rgba(255,255,255,0.5)', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Hoy</span> <strong>10:30 AM</strong>
            </li>
            <li style={{ background: 'rgba(255,255,255,0.5)', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Ayer</span> <strong>09:15 AM</strong>
            </li>
            <li style={{ background: 'rgba(255,255,255,0.5)', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Hace 3 días</span> <strong>06:00 PM</strong>
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default DashboardPage;
