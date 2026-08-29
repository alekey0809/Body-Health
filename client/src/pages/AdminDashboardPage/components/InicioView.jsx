import React, { useEffect, useState } from 'react';
import { 
  Users, AlertCircle, AlertTriangle, DollarSign, TrendingUp, Clock, 
  BarChart2, PieChart, Calendar, ArrowUpRight, ArrowDownRight,
  Bell, CreditCard, Phone, Mail, Send, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { getAdminKPIs, getAsistenciasMensual, getVentasPorPlan, getSociosAusentes, getPagosPendientes } from '../../../services/adminDashboardService';

const COLORS = ['#e01717', '#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const InicioView = () => {
  const [kpis, setKpis] = useState({
    sociosActivos: 0,
    proximosVencer: 0,
    sociosVencidos: 0,
    totalVentasMes: 0
  });
  const [asistenciasData, setAsistenciasData] = useState(null);
  const [ventasPorPlan, setVentasPorPlan] = useState(null);
  const [sociosAusentes, setSociosAusentes] = useState(null);
  const [pagosPendientes, setPagosPendientes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [kpisRes, asistenciasRes, ventasRes, ausentesRes, pagosRes] = await Promise.all([
        getAdminKPIs(),
        getAsistenciasMensual(),
        getVentasPorPlan(),
        getSociosAusentes(15, 20),
        getPagosPendientes(20)
      ]);

      if (kpisRes.ok) setKpis(kpisRes.kpis);
      if (asistenciasRes.ok) setAsistenciasData(asistenciasRes);
      if (ventasRes.ok) setVentasPorPlan(ventasRes);
      if (ausentesRes.ok) setSociosAusentes(ausentesRes);
      if (pagosRes.ok) setPagosPendientes(pagosRes);
      
      if (!kpisRes.ok || !asistenciasRes.ok || !ventasRes.ok || !ausentesRes.ok || !pagosRes.ok) {
        setError('Error al cargar algunos datos del dashboard');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error de conexión al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { weekday: 'short' });
  };

  const kpiCards = [
    {
      id: 'sociosActivos',
      title: 'Socios Activos',
      value: kpis.sociosActivos,
      format: formatNumber,
      icon: Users,
      iconColor: '#16a34a',
      iconBg: 'rgba(22, 163, 74, 0.1)',
      badge: 'Total actual',
      badgeType: 'success',
      description: 'Membresías vigentes al día de hoy'
    },
    {
      id: 'proximosVencer',
      title: 'Próximos a Vencer',
      value: kpis.proximosVencer,
      format: formatNumber,
      icon: Clock,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.1)',
      badge: 'En 5 días',
      badgeType: 'warning',
      description: 'Vencimientos en los próximos 5 días',
      alert: true
    },
    {
      id: 'sociosVencidos',
      title: 'Socios Vencidos / En Mora',
      value: kpis.sociosVencidos,
      format: formatNumber,
      icon: AlertTriangle,
      iconColor: '#ef4444',
      iconBg: 'rgba(239, 68, 68, 0.1)',
      badge: 'Estado impago',
      badgeType: 'error',
      description: 'Membresías vencidas o pagos pendientes'
    },
    {
      id: 'totalVentasMes',
      title: 'Total Ventas del Mes',
      value: kpis.totalVentasMes,
      format: formatCurrency,
      icon: DollarSign,
      iconColor: '#3b82f6',
      iconBg: 'rgba(59, 130, 246, 0.1)',
      badge: 'Ingresos consolidados',
      badgeType: 'primary',
      description: 'Facturación del mes en curso'
    }
  ];

  // Preparar datos para gráfico de asistencias (barras por día + línea de promedio semanal)
  const chartAsistenciasData = asistenciasData?.asistenciasPorDia?.map((dia, index) => ({
    nombre: `${dia.dia}`,
    fecha: dia.fecha,
    diaSemana: getDayName(dia.fecha),
    total: dia.total,
    horaPico: dia.horaPico,
    isWeekend: [0, 6].includes(new Date(dia.fecha).getDay())
  })) || [];

  // Preparar datos para gráfico de horas pico (top 5 horas)
  const horasPicoData = asistenciasData?.horasPicoGlobal?.map((h, i) => ({
    hora: `${h.hora}:00`,
    total: h.total,
    color: COLORS[i % COLORS.length]
  })) || [];

  // Preparar datos para gráfico de ventas por plan (donut)
  const ventasPlanData = ventasPorPlan?.planes?.map((plan, i) => ({
    name: plan.nombre,
    value: plan.totalIngresos,
    cantidad: plan.cantidadVendida,
    porcentaje: plan.porcentaje,
    color: COLORS[i % COLORS.length]
  })) || [];

  const totalAsistenciasMes = asistenciasData?.totalMes || 0;
  const promedioDiario = chartAsistenciasData.length > 0 
    ? Math.round(totalAsistenciasMes / chartAsistenciasData.filter(d => d.total > 0).length) 
    : 0;
  const diaMaxAsistencias = chartAsistenciasData.reduce((max, d) => d.total > max.total ? d : max, { total: 0 });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="stat-card" style={{ minWidth: '200px', opacity: 0.5 }}>
              <div style={{ height: '1.5rem', background: '#e7e5e4', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
              <div style={{ height: '2.5rem', background: '#e7e5e4', borderRadius: '0.25rem', width: '60%' }}></div>
            </div>
          ))}
        </div>
        <p style={{ color: '#78716c', fontSize: '0.875rem' }}>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--error)" />
        <p style={{ color: 'var(--error)', fontWeight: '500' }}>{error}</p>
        <button onClick={fetchAllData} className="btn-primary">Reintentar</button>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1c1917',
          border: '1px solid var(--outline-variant)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          color: '#fafaf9',
          fontSize: '0.8125rem'
        }}>
          <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#e01717' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: entry.color }}></span>
              {entry.name}: <strong>{entry.value.toLocaleString('es-CO')}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Title */}
      <section className="page-title-section" style={{ marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administración</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Panel General</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            KPIs principales, flujo de asistencias y distribución de ventas. Datos en tiempo real.
          </p>
        </div>
        <button 
          onClick={fetchAllData} 
          disabled={loading}
          className="btn-secondary"
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <TrendingUp size={16} />
          <span>Actualizar</span>
        </button>
      </section>

      {/* KPIs Grid - 4 Cards */}
      <section className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '1.25rem', 
        marginBottom: '2.5rem' 
      }}>
        {kpiCards.map((kpi) => (
          <div key={kpi.id} className="stat-card" style={{ 
            position: 'relative',
            padding: '1.5rem',
            borderLeft: kpi.alert ? '4px solid #f59e0b' : 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ 
                  fontSize: '0.625rem', 
                  textTransform: 'uppercase', 
                  color: '#78716c', 
                  letterSpacing: '0.1em', 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  {kpi.title}
                </span>
                <span style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '700', 
                  fontFamily: 'Noto Serif, serif',
                  color: '#1c1917',
                  display: 'block',
                  lineHeight: 1.1
                }}>
                  {kpi.format(kpi.value)}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#78716c', 
                  display: 'block', 
                  marginTop: '0.375rem',
                  fontWeight: '500'
                }}>
                  {kpi.description}
                </span>
              </div>
              <div style={{ 
                padding: '0.875rem', 
                borderRadius: '0.75rem', 
                backgroundColor: kpi.iconBg, 
                color: kpi.iconColor,
                flexShrink: 0
              }}>
                <kpi.icon size={28} />
              </div>
            </div>
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid var(--outline-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span className={`badge badge-${kpi.badgeType}`} style={{ fontSize: '0.625rem' }}>
                {kpi.badge}
              </span>
              {kpi.alert && (
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  fontSize: '0.625rem',
                  fontWeight: '700',
                  color: '#f59e0b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <AlertCircle size={12} />
                  Alerta
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Gráfico 1: Asistencias y Horas Pico */}
        <div className="stat-card" style={{ 
          padding: '1.5rem', 
          minHeight: '420px',
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>
                <BarChart2 size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.375rem' }} />
                Asistencias Mensuales & Horas Pico
              </span>
              <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1c1917', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {asistenciasData?.periodo ? `${new Date(asistenciasData.periodo.fecha_inicio).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}` : 'Mes actual'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#78716c' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e01717' }}></span>
                Total: {formatNumber(totalAsistenciasMes)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
                Promedio/día: {formatNumber(promedioDiario)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <ArrowUpRight size={12} color="#16a34a" />
                Pico: {formatNumber(diaMaxAsistencias.total)} ({formatShortDate(diaMaxAsistencias.fecha)})
              </span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ height: '280px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartAsistenciasData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    axisLine={{ stroke: '#e7e5e4' }}
                    tickLine={false}
                  />
                  <YAxis 
                    dataKey="nombre" 
                    type="category" 
                    width={50}
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    name="Asistencias" 
                    fill="#e01717" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={32}
                  >
                    {chartAsistenciasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isWeekend ? 'rgba(224, 23, 23, 0.5)' : '#e01717'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Horas pico - Mini barras horizontales */}
            {horasPicoData.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', fontWeight: '600' }}>
                    Horas de mayor afluencia
                  </span>
                  <Clock size={12} color="#f59e0b" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {horasPicoData.slice(0, 5).map((hora, i) => (
                    <div key={hora.hora} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: '50px', fontSize: '0.75rem', fontWeight: '600', color: '#57534e', fontFamily: 'monospace' }}>
                        {hora.hora}
                      </span>
                      <div style={{ flex: 1, height: '20px', background: '#f5f5f4', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                        <div 
                          style={{ 
                            width: `${(hora.total / (horasPicoData[0]?.total || 1)) * 100}%`, 
                            height: '100%', 
                            background: hora.color,
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                        <span style={{ 
                          position: 'absolute', 
                          right: '8px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          fontSize: '0.625rem',
                          fontWeight: '700',
                          color: '#1c1917'
                        }}>
                          {hora.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Ventas por Tipo de Plan (Donut) */}
        <div className="stat-card" style={{ 
          padding: '1.5rem', 
          minHeight: '420px',
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>
                <PieChart size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.375rem' }} />
                Ventas por Tipo de Plan
              </span>
              <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1c1917', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {ventasPorPlan?.periodo ? `${new Date(ventasPorPlan.periodo.fecha_inicio).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}` : 'Mes actual'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#1c1917', fontWeight: '700' }}>
                {formatCurrency(ventasPorPlan?.totalGeneral || 0)}
              </span>
              <DollarSign size={20} color="#e01717" />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              {ventasPlanData.length > 0 ? (
                <ResponsiveContainer width="100%" height="280px">
                  <RechartsPieChart>
                    <Pie
                      data={ventasPlanData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      labelStyle={{ fontSize: 12, fontWeight: '600', fill: '#1c1917' }}
                    >
                      {ventasPlanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: '#78716c', padding: '2rem' }}>
                  <PieChart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No hay datos de ventas para este mes</p>
                </div>
              )}
            </div>

            {/* Leyenda de planes */}
            {ventasPlanData.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  {ventasPlanData.map((plan, i) => (
                    <div key={plan.planId} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      background: `${plan.color}15`,
                      border: `1px solid ${plan.color}40`,
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: '600'
                    }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: plan.color 
                      }}></span>
                      <span style={{ color: '#1c1917' }}>{plan.nombre}</span>
                      <span style={{ color: plan.color, fontWeight: '700' }}>
                        {plan.porcentaje}% ({plan.cantidad})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Resumen Semanal de Asistencias */}
      {asistenciasData?.resumenSemanal && asistenciasData.resumenSemanal.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>
                  <Calendar size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.375rem' }} />
                  Resumen Semanal de Asistencias
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {asistenciasData.resumenSemanal.map((semana) => (
                <div key={semana.semana} style={{ 
                  padding: '1rem', 
                  background: '#fafaf9', 
                  borderRadius: '0.5rem',
                  border: '1px solid var(--outline-variant)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Semana {semana.semana}
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Noto Serif, serif', color: '#e01717', display: 'block' }}>
                    {formatNumber(semana.total)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#78716c' }}>
                    Promedio: {formatNumber(semana.promedioDiario)}/día
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BLOQUE 3: Listados Operativos y Alertas */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
          
          {/* Tabla 1: Socios Ausentes (Alerta de Fidelización) */}
          <div className="stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>
                  <Bell size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.375rem' }} />
                  Socios Ausentes - Alerta Fidelización
                </span>
                <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
                  {sociosAusentes?.criterio || 'Sin visitas en los últimos 15 días'} • {sociosAusentes?.total || 0} socios
                </p>
              </div>
              <button 
                onClick={() => fetchAllData()} 
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
              >
                <RefreshCw size={14} />
                Actualizar
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              {sociosAusentes?.socios?.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--outline-variant)' }}>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Socio</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Última visita</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Días</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Vence</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sociosAusentes.socios.map((socio) => (
                        <tr key={socio.id} style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.3)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: '#1c1917' }}>{socio.nombre}</span>
                              <div style={{ fontSize: '0.6875rem', color: '#78716c', display: 'flex', gap: '1rem', marginTop: '0.125rem' }}>
                                <span><Mail size={10} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> {socio.correo}</span>
                                {socio.telefono && <span><Phone size={10} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> {socio.telefono}</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#57534e' }}>
                            {socio.ultimaVisita}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <span style={{ 
                              display: 'inline-block', 
                              padding: '0.125rem 0.5rem', 
                              borderRadius: '9999px', 
                              fontSize: '0.625rem', 
                              fontWeight: '700',
                              background: socio.diasSinVisita > 30 ? 'rgba(239, 68, 68, 0.12)' : socio.diasSinVisita > 15 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                              color: socio.diasSinVisita > 30 ? '#ef4444' : socio.diasSinVisita > 15 ? '#f59e0b' : '#16a34a'
                            }}>
                              {socio.diasSinVisita >= 999 ? 'Nunca' : `${socio.diasSinVisita} días`}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#57534e' }}>
                            {socio.fechaVencimiento || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                              <button 
                                className="btn-icon" 
                                title="Enviar recordatorio"
                                style={{ color: '#3b82f6' }}
                              >
                                <Send size={16} />
                              </button>
                              <button 
                                className="btn-icon" 
                                title="Llamar"
                                style={{ color: '#16a34a' }}
                              >
                                <Phone size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#78716c', padding: '3rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: '500' }}>No hay socios ausentes</p>
                  <p style={{ fontSize: '0.8125rem' }}>Todos los socios activos han visitado recientemente</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabla 2: Listado de Pagos Pendientes */}
          <div className="stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', letterSpacing: '0.1em', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>
                  <CreditCard size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.375rem' }} />
                  Pagos Pendientes / En Mora
                </span>
                <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
                  {pagosPendientes?.cantidad || 0} facturas • {formatCurrency(pagosPendientes?.totalPendiente || 0)} pendientes
                </p>
              </div>
              <button 
                onClick={() => fetchAllData()} 
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
              >
                <RefreshCw size={14} />
                Actualizar
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              {pagosPendientes?.pagos?.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--outline-variant)' }}>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Factura</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Socio</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Valor</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Estado</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Vence</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.625rem', textTransform: 'uppercase', color: '#78716c', fontWeight: '700', letterSpacing: '0.05em' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagosPendientes.pagos.map((pago) => (
                        <tr key={pago.facturaId} style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.3)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '600', color: '#e01717' }}>#{pago.facturaId.slice(-8)}</span>
                              <div style={{ fontSize: '0.6875rem', color: '#78716c' }}>{pago.plan}</div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: '#1c1917' }}>{pago.socio.nombre}</span>
                              <div style={{ fontSize: '0.6875rem', color: '#78716c', display: 'flex', gap: '1rem', marginTop: '0.125rem' }}>
                                <span><Mail size={10} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> {pago.socio.correo}</span>
                                {pago.socio.telefono && <span><Phone size={10} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> {pago.socio.telefono}</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '600', color: '#1c1917', fontFamily: 'Noto Serif, serif' }}>
                            {formatCurrency(pago.valor)}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <span className={`badge badge-${pago.estadoPago?.toLowerCase().includes('pend') ? 'warning' : 'error'}`} style={{ fontSize: '0.625rem', textTransform: 'capitalize' }}>
                              {pago.estadoPago || 'Pendiente'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            {pago.membresia?.fechaVencimiento ? (
                              <span style={{ 
                                display: 'inline-block',
                                padding: '0.125rem 0.5rem', 
                                borderRadius: '9999px', 
                                fontSize: '0.625rem', 
                                fontWeight: '700',
                                background: pago.diasVencido > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                color: pago.diasVencido > 0 ? '#ef4444' : '#f59e0b'
                              }}>
                                {pago.diasVencido > 0 ? `${pago.diasVencido}d vencido` : pago.membresia.fechaVencimiento}
                              </span>
                            ) : (
                              <span style={{ color: '#78716c', fontSize: '0.75rem' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                              <button 
                                className="btn-icon" 
                                title="Enviar recordatorio de pago"
                                style={{ color: '#3b82f6' }}
                              >
                                <Send size={16} />
                              </button>
                              <button 
                                className="btn-icon" 
                                title="Regularizar pago"
                                style={{ color: '#16a34a' }}
                              >
                                <CreditCard size={16} />
                              </button>
                              <button 
                                className="btn-icon" 
                                title="Llamar"
                                style={{ color: '#f59e0b' }}
                              >
                                <Phone size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#78716c', padding: '3rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ fontWeight: '500' }}>No hay pagos pendientes</p>
                  <p style={{ fontSize: '0.8125rem' }}>Todos los pagos están al día</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default InicioView;