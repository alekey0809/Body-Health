import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, 
  Weight, Heart, Activity, BarChart2, History, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend
} from 'recharts';
import { 
  calculateAllMetrics, 
  generateHistoricalComparison, 
  prepareChartData,
  formatChange 
} from '../../../utils/physicalMetricsUtils';
import { getValoracionesByUser } from '../../../services/valoracionFisicaService';
import './PhysicalTracking.css';

const PhysicalTracking = ({ user }) => {
  const [valoraciones, setValoraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('peso');
  const [showFullHistory, setShowFullHistory] = useState(false);

  const userId = user?.id || user?.u_id || user?.u_id;
  const genero = user?.genero || user?.u_genero || 'M';

  useEffect(() => {
    const fetchValoraciones = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const data = await getValoracionesByUser(userId);
        setValoraciones(data || []);
      } catch (err) {
        console.error('Error fetching valoraciones:', err);
        setError('No se pudieron cargar las valoraciones físicas');
      } finally {
        setLoading(false);
      }
    };
    fetchValoraciones();
  }, [userId]);

  const comparison = useMemo(() => 
    generateHistoricalComparison(valoraciones, genero), 
    [valoraciones, genero]
  );

  const chartData = useMemo(() => 
    prepareChartData(valoraciones), 
    [valoraciones]
  );

  const metricConfig = {
    peso: { key: 'peso', label: 'Peso (kg)', unit: 'kg', color: '#3b82f6', lowerBetter: true },
    cintura: { key: 'cintura', label: 'Cintura (cm)', unit: 'cm', color: '#ef4444', lowerBetter: true },
    cadera: { key: 'cadera', label: 'Cadera (cm)', unit: 'cm', color: '#f97316', lowerBetter: false },
    pecho: { key: 'pecho', label: 'Pecho (cm)', unit: 'cm', color: '#22c55e', lowerBetter: false },
    imc: { key: 'imc', label: 'IMC', unit: '', color: '#8b5cf6', lowerBetter: null },
    icc: { key: 'icc', label: 'ICC', unit: '', color: '#ec4899', lowerBetter: true },
    ica: { key: 'ica', label: 'ICA', unit: '', color: '#06b6d4', lowerBetter: true },
  };

  const currentConfig = metricConfig[selectedMetric];

  const MetricCard = ({ title, value, classification, icon, unit = '', trend }) => {
    const trendIcon = trend === 'up' ? <TrendingUp className="trend-up" /> : 
                      trend === 'down' ? <TrendingDown className="trend-down" /> : 
                      <Minus className="trend-stable" />;
    
    return (
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-icon" style={{ backgroundColor: classification?.color || 'var(--primary)' }}>
            {icon}
          </span>
          <div className="trend-badge" style={{ 
            color: trend === 'up' ? (currentConfig?.lowerBetter ? '#ef4444' : '#22c55e') : 
                  trend === 'down' ? (currentConfig?.lowerBetter ? '#22c55e' : '#ef4444') : 'var(--on-surface-variant)'
          }}>
            {trendIcon}
          </div>
        </div>
        <div className="metric-value">
          <span className="value">{value !== null ? value : '—'}</span>
          <span className="unit">{unit}</span>
        </div>
        <div className="metric-classification" style={{ color: classification?.color || 'var(--on-surface-variant)' }}>
          {classification?.label || 'Sin datos'}
        </div>
        <div className="metric-range">{classification?.range || classification?.riesgo || classification?.estado || ''}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="physical-tracking loading">
        <div className="loading-spinner"></div>
        <p>Cargando seguimiento físico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="physical-tracking error">
        <AlertCircle size={32} className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

  if (!comparison || valoraciones.length === 0) {
    return (
      <div className="physical-tracking empty">
        <Activity size={48} className="empty-icon" />
        <h3>Sin valoraciones físicas</h3>
        <p>Registra tu primera valoración para ver el seguimiento y estadísticas</p>
      </div>
    );
  }

  const { metricasActuales, comparativas, hayCambio, totalMediciones, primeraFecha, ultimaFecha } = comparison;

  return (
    <div className="physical-tracking">
      {/* Header con resumen */}
      <div className="tracking-header">
        <div className="header-info">
          <h3><BarChart2 size={20} /> Seguimiento y Estadísticas Físicas</h3>
          <p className="header-subtitle">
            {totalMediciones} medición{totalMediciones !== 1 ? 'es' : ''} • 
            {new Date(primeraFecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} - 
            {new Date(ultimaFecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {hayCambio && (
          <button 
            className="btn-history-toggle" 
            onClick={() => setShowFullHistory(!showFullHistory)}
          >
            <History size={16} />
            {showFullHistory ? 'Ocultar historial' : 'Ver historial completo'}
            <ChevronRight size={16} className={showFullHistory ? 'rotated' : ''} />
          </button>
        )}
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="metrics-grid">
        <MetricCard
          title="IMC"
          value={metricasActuales.imc.value}
          classification={metricasActuales.imc}
          icon={<Weight size={20} />}
          trend={comparativas?.imc?.tendencia}
        />
        <MetricCard
          title="ICC (Cintura/Cadera)"
          value={metricasActuales.icc.value}
          classification={metricasActuales.icc}
          icon={<Heart size={20} />}
          trend={comparativas?.icc?.tendencia}
        />
        <MetricCard
          title="ICA (Cintura/Altura)"
          value={metricasActuales.ica.value}
          classification={metricasActuales.ica}
          icon={<Activity size={20} />}
          trend={comparativas?.ica?.tendencia}
        />
        <MetricCard
          title="% Grasa (RFM)"
          value={metricasActuales.rfm.value}
          classification={metricasActuales.rfm}
          icon={<Activity size={20} />}
          unit="%"
          trend={comparativas?.rfm?.tendencia}
        />
      </div>

      {/* Comparativa histórica (Primera vs Última) */}
      {hayCambio && comparativas && (
        <div className="comparison-section">
          <h4 className="section-title">
            <TrendingUp size={16} /> Comparativa: Primera vs Última medición
          </h4>
          <div className="comparison-grid">
            {[
              { key: 'peso', label: 'Peso', unit: 'kg', config: metricConfig.peso },
              { key: 'cintura', label: 'Cintura', unit: 'cm', config: metricConfig.cintura },
              { key: 'cadera', label: 'Cadera', unit: 'cm', config: metricConfig.cadera },
              { key: 'pecho', label: 'Pecho', unit: 'cm', config: metricConfig.pecho },
            ].map(({ key, label, unit, config }) => {
              const change = comparativas[key];
              if (!change) return null;
              
              const primera = comparison.metricasIniciales.raw[key];
              const ultima = comparison.metricasActuales.raw[key];
              
              return (
                <div key={key} className={`comparison-item ${change.tendencia === 'down' && config.lowerBetter ? 'improved' : change.tendencia === 'up' && config.lowerBetter ? 'worsened' : ''}`}>
                  <div className="comparison-label">{label}</div>
                  <div className="comparison-values">
                    <span className="value-initial">{primera}{unit}</span>
                    <span className="arrow">→</span>
                    <span className="value-final">{ultima}{unit}</span>
                  </div>
                  <div className={`comparison-change ${change.tendencia}`}>
                    <span className="absolute">
                      {change.absoluta >= 0 ? '+' : ''}{change.absoluta}{unit}
                    </span>
                    <span className="percent">
                      ({change.porcentual >= 0 ? '+' : ''}{change.porcentual}%)
                    </span>
                    <span className={`trend-indicator ${change.tendencia === 'down' ? 'down' : change.tendencia === 'up' ? 'up' : 'neutral'}`}>
                      {change.tendencia === 'down' ? '↓ Bajó' : 
                       change.tendencia === 'up' ? '↑ Subió' : '➡ Estable'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico de evolución temporal */}
      <div className="chart-section">
        <div className="chart-header">
          <h4 className="section-title">Evolución Temporal</h4>
          <div className="metric-selector">
            {Object.entries(metricConfig).map(([key, config]) => (
              <button
                key={key}
                className={`metric-tab ${selectedMetric === key ? 'active' : ''}`}
                onClick={() => setSelectedMetric(key)}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="var(--on-surface-variant)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                stroke="var(--on-surface-variant)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => currentConfig.unit ? `${value}${currentConfig.unit}` : value}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--outline-variant)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'var(--on-surface)', fontWeight: 600 }}
                itemStyle={{ color: currentConfig.color, fontWeight: 'bold' }}
                formatter={(value, name) => [value, metricConfig[name]?.label || name]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(name) => metricConfig[name]?.label || name}
              />
              <Line 
                type="monotone" 
                dataKey={currentConfig.key} 
                stroke={currentConfig.color} 
                strokeWidth={3} 
                dot={{ 
                  r: 5, 
                  fill: currentConfig.color, 
                  strokeWidth: 2, 
                  stroke: '#fff' 
                }} 
                activeDot={{ r: 7, strokeWidth: 3 }}
                name={currentConfig.label}
              />
              {currentConfig.key === 'ica' && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="ica" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
          
          {/* Línea de referencia para ICA */}
          {selectedMetric === 'ica' && (
            <div className="chart-reference">
              <span className="ref-line healthy"></span>
              <span>{'ICA < 0.5 = Saludable'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Historial completo de mediciones */}
      {showFullHistory && (
        <div className="history-section">
          <h4 className="section-title">
            <History size={16} /> Historial Completo de Valoraciones
          </h4>
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso (kg)</th>
                  <th>Cintura (cm)</th>
                  <th>Cadera (cm)</th>
                  <th>Pecho (cm)</th>
                  <th>IMC</th>
                  <th>ICC</th>
                  <th>ICA</th>
                  <th>% Grasa</th>
                </tr>
              </thead>
              <tbody>
                {[...valoraciones].sort((a, b) => new Date(b.vf_fecha_registro) - new Date(a.vf_fecha_registro)).map((v) => {
                  const metrics = calculateAllMetrics(v, genero);
                  return (
                    <tr key={v.vf_id}>
                      <td>{new Date(v.vf_fecha_registro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>{v.vf_peso_kg || '—'}</td>
                      <td>{v.vf_medida_cintura || '—'}</td>
                      <td>{v.vf_medida_cadera || '—'}</td>
                      <td>{v.vf_medida_pecho || '—'}</td>
                      <td>
                        <span className={`metric-badge ${metrics.imc.classification?.label?.toLowerCase().includes('normal') ? 'good' : ''}`}>
                          {metrics.imc.value || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`metric-badge ${metrics.icc.classification?.riesgo === 'Bajo' ? 'good' : metrics.icc.classification?.riesgo === 'Alto' ? 'bad' : ''}`}>
                          {metrics.icc.value || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`metric-badge ${metrics.ica.classification?.healthy ? 'good' : 'bad'}`}>
                          {metrics.ica.value || '—'}
                        </span>
                      </td>
                      <td>{metrics.rfm.value ? `${metrics.rfm.value}%` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalTracking;