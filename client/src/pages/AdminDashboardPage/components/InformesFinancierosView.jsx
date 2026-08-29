import { useState, useEffect } from 'react';
import { 
  Calendar, Download, FileText, FileSpreadsheet, 
  DollarSign, CreditCard, AlertTriangle, TrendingUp, 
  Users, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  getResumenFinanciero, 
  getDetalleIngresos, 
  getDetalleNomina 
} from '../../../services/informeFinancieroService';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const formatDate = (str) => {
  if (!str) return '—';
  try {
    const date = new Date(str);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return str.split('T')[0];
  }
};

const MetricCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="metric-card" style={{ borderLeftColor: color }}>
    <div className="metric-header">
      <Icon size={24} style={{ color }} />
      {trend && (
        <span className={`metric-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
          {trend > 0 ? '▲' : trend < 0 ? '▼' : '●'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="metric-label">{label}</p>
    <p className="metric-value" style={{ color }}>{value}</p>
  </div>
);

const InformesFinancierosView = () => {
  // Estados de fecha
  const [fechaInicio, setFechaInicio] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const year = firstDay.getFullYear();
    const month = String(firstDay.getMonth() + 1).padStart(2, '0');
    const day = String(firstDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Estados de datos
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para detalle/exportación
  const [detalleIngresos, setDetalleIngresos] = useState([]);
  const [detalleNomina, setDetalleNomina] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState({ ingresos: false, nomina: false });

  // Estados para expandir tablas
  const [expandedSections, setExpandedSections] = useState({
    ingresos: false,
    nomina: false,
    entrenadores: false
  });

  const fetchResumen = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResumenFinanciero(fechaInicio, fechaFin);
      if (data.ok) {
        setResumen(data);
      } else {
        setError(data.message || 'Error al cargar el resumen financiero');
      }
    } catch (err) {
      console.error('Error fetching financial report:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
  }, [fechaInicio, fechaFin]);

  const handleFetchDetalleIngresos = async () => {
    setLoadingDetalle(prev => ({ ...prev, ingresos: true }));
    try {
      const data = await getDetalleIngresos(fechaInicio, fechaFin);
      if (data.ok) {
        setDetalleIngresos(data.facturas);
        setExpandedSections(prev => ({ ...prev, ingresos: true }));
      }
    } catch (err) {
      console.error('Error fetching detalle ingresos:', err);
    } finally {
      setLoadingDetalle(prev => ({ ...prev, ingresos: false }));
    }
  };

  const handleFetchDetalleNomina = async () => {
    setLoadingDetalle(prev => ({ ...prev, nomina: true }));
    try {
      const data = await getDetalleNomina(fechaInicio, fechaFin);
      if (data.ok) {
        setDetalleNomina(data.nomina);
        setExpandedSections(prev => ({ ...prev, nomina: true }));
      }
    } catch (err) {
      console.error('Error fetching detalle nomina:', err);
    } finally {
      setLoadingDetalle(prev => ({ ...prev, nomina: false }));
    }
  };

  const handleExportIngresosPDF = () => {
    if (!detalleIngresos.length) return;
    const columns = [
      { key: 'f_id', header: 'Factura #' },
      { key: 'f_fecha_hora', header: 'Fecha', format: formatDate },
      { key: 'u_nombres', header: 'Cliente', format: (v, row) => `${row.u_nombres} ${row.u_apellidos}` },
      { key: 'u_numero_documento', header: 'Cédula' },
      { key: 'u_correo_electronico', header: 'Correo' },
      { key: 'pe_nombre', header: 'Plan' },
      { key: 'f_valor_total', header: 'Monto (COP)', format: (v) => formatCOP(v) },
      { key: 'estado_pago', header: 'Estado' },
    ];
    exportToPDF({
      data: detalleIngresos,
      columns,
      title: `Reporte de Ingresos - ${fechaInicio} a ${fechaFin}`,
      filename: `ingresos_${fechaInicio}_${fechaFin}.pdf`,
    });
  };

  const handleExportIngresosExcel = () => {
    if (!detalleIngresos.length) return;
    const columns = [
      { key: 'f_id', header: 'Factura #' },
      { key: 'f_fecha_hora', header: 'Fecha', format: formatDate },
      { key: 'u_nombres', header: 'Cliente', format: (v, row) => `${row.u_nombres} ${row.u_apellidos}` },
      { key: 'u_numero_documento', header: 'Cédula' },
      { key: 'u_correo_electronico', header: 'Correo' },
      { key: 'pe_nombre', header: 'Plan' },
      { key: 'f_valor_total', header: 'Monto (COP)', format: (v) => formatCOP(v) },
      { key: 'estado_pago', header: 'Estado' },
    ];
    exportToExcel({
      data: detalleIngresos,
      columns,
      title: `Reporte de Ingresos - ${fechaInicio} a ${fechaFin}`,
      filename: `ingresos_${fechaInicio}_${fechaFin}.xlsx`,
    });
  };

  const handleExportNominaPDF = () => {
    if (!detalleNomina.length) return;
    const columns = [
      { key: 'hs_id', header: 'ID' },
      { key: 'hs_fecha_pago', header: 'Fecha Pago', format: formatDate },
      { key: 'hs_periodo_correspondiente', header: 'Período' },
      { key: 'u_nombres', header: 'Entrenador', format: (v, row) => `${row.u_nombres} ${row.u_apellidos}` },
      { key: 'u_correo_electronico', header: 'Correo' },
      { key: 'en_especialidad', header: 'Especialidad' },
      { key: 'hs_monto_pagado', header: 'Monto (COP)', format: (v) => formatCOP(v) },
    ];
    exportToPDF({
      data: detalleNomina,
      columns,
      title: `Reporte de Nómina - ${fechaInicio} a ${fechaFin}`,
      filename: `nomina_${fechaInicio}_${fechaFin}.pdf`,
    });
  };

  const handleExportNominaExcel = () => {
    if (!detalleNomina.length) return;
    const columns = [
      { key: 'hs_id', header: 'ID' },
      { key: 'hs_fecha_pago', header: 'Fecha Pago', format: formatDate },
      { key: 'hs_periodo_correspondiente', header: 'Período' },
      { key: 'u_nombres', header: 'Entrenador', format: (v, row) => `${row.u_nombres} ${row.u_apellidos}` },
      { key: 'u_correo_electronico', header: 'Correo' },
      { key: 'en_especialidad', header: 'Especialidad' },
      { key: 'hs_monto_pagado', header: 'Monto (COP)', format: (v) => formatCOP(v) },
    ];
    exportToExcel({
      data: detalleNomina,
      columns,
      title: `Reporte de Nómina - ${fechaInicio} a ${fechaFin}`,
      filename: `nomina_${fechaInicio}_${fechaFin}.xlsx`,
    });
  };

  const handleExportResumenPDF = () => {
    if (!resumen) return;
    const { ingresos, nomina, balance, periodo } = resumen;
    const data = [
      { concepto: 'Total Facturado', valor: formatCOP(ingresos.total_facturado) },
      { concepto: 'Total Pagado', valor: formatCOP(ingresos.total_pagado) },
      { concepto: 'Total Pendiente', valor: formatCOP(ingresos.total_pendiente) },
      { concepto: 'Cantidad Facturas', valor: ingresos.cantidad_facturas.toString() },
      { concepto: 'Facturas Pagadas', valor: ingresos.facturas_pagadas.toString() },
      { concepto: 'Facturas Pendientes', valor: ingresos.facturas_pendientes.toString() },
      { concepto: '---', valor: '---' },
      { concepto: 'Total Nómina', valor: formatCOP(nomina.total_nomina) },
      { concepto: 'Cantidad Pagos Nómina', valor: nomina.cantidad_pagos.toString() },
      { concepto: 'Entrenadores Pagados', valor: nomina.entrenadores_pagados.toString() },
      { concepto: '---', valor: '---' },
      { concepto: 'UTILIDAD ESTIMADA', valor: formatCOP(balance.utilidad_estimada) },
    ];
    const columns = [
      { key: 'concepto', header: 'Concepto' },
      { key: 'valor', header: 'Valor' },
    ];
    exportToPDF({
      data,
      columns,
      title: `Resumen Financiero - ${periodo.fecha_inicio} a ${periodo.fecha_fin}`,
      filename: `resumen_financiero_${periodo.fecha_inicio}_${periodo.fecha_fin}.pdf`,
      orientation: 'portrait',
    });
  };

  const handleExportResumenExcel = () => {
    if (!resumen) return;
    const { ingresos, nomina, balance, periodo } = resumen;
    const data = [
      { concepto: 'Total Facturado', valor: formatCOP(ingresos.total_facturado) },
      { concepto: 'Total Pagado', valor: formatCOP(ingresos.total_pagado) },
      { concepto: 'Total Pendiente', valor: formatCOP(ingresos.total_pendiente) },
      { concepto: 'Cantidad Facturas', valor: ingresos.cantidad_facturas.toString() },
      { concepto: 'Facturas Pagadas', valor: ingresos.facturas_pagadas.toString() },
      { concepto: 'Facturas Pendientes', valor: ingresos.facturas_pendientes.toString() },
      { concepto: 'Total Nómina', valor: formatCOP(nomina.total_nomina) },
      { concepto: 'Cantidad Pagos Nómina', valor: nomina.cantidad_pagos.toString() },
      { concepto: 'Entrenadores Pagados', valor: nomina.entrenadores_pagados.toString() },
      { concepto: 'UTILIDAD ESTIMADA', valor: formatCOP(balance.utilidad_estimada) },
    ];
    const columns = [
      { key: 'concepto', header: 'Concepto' },
      { key: 'valor', header: 'Valor' },
    ];
    exportToExcel({
      data,
      columns,
      title: `Resumen Financiero - ${periodo.fecha_inicio} a ${periodo.fecha_fin}`,
      filename: `resumen_financiero_${periodo.fecha_inicio}_${periodo.fecha_fin}.xlsx`,
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="informes-financieros">
      {/* Header */}
      <section className="page-title-section">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Administración
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Informes Financieros
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '42rem' }}>
            Resumen de ingresos, nómina y balance del gimnasio por período.
          </p>
        </div>
      </section>

      {/* Date Range Filter */}
      <section className="filter-section">
        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="fecha-inicio" className="filter-label">
              <Calendar size={14} /> Fecha Inicio
            </label>
            <input
              type="date"
              id="fecha-inicio"
              className="filter-input"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              max={fechaFin}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="fecha-fin" className="filter-label">
              <Calendar size={14} /> Fecha Fin
            </label>
            <input
              type="date"
              id="fecha-fin"
              className="filter-input"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              min={fechaInicio}
              max={(new Date().toISOString().split('T')[0])}
            />
          </div>
          <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
            <button 
              className="btn-primary" 
              onClick={fetchResumen}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}
            >
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
              {loading ? 'Cargando...' : 'Generar Informe'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-banner">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
      </section>

      {resumen && (
        <>
          {/* Resumen Cards */}
          <section className="stats-grid">
            <MetricCard
              icon={DollarSign}
              label="Total Facturado"
              value={formatCOP(resumen.ingresos.total_facturado)}
              color="#16a34a"
            />
            <MetricCard
              icon={CreditCard}
              label="Total Pagado"
              value={formatCOP(resumen.ingresos.total_pagado)}
              color="#0284c7"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Total Pendiente"
              value={formatCOP(resumen.ingresos.total_pendiente)}
              color="#f59e0b"
            />
            <MetricCard
              icon={Users}
              label="Total Nómina"
              value={formatCOP(resumen.nomina.total_nomina)}
              color="#7c3aed"
            />
            <MetricCard
              icon={TrendingUp}
              label="Utilidad Estimada"
              value={formatCOP(resumen.balance.utilidad_estimada)}
              color={resumen.balance.utilidad_estimada >= 0 ? '#16a34a' : 'var(--error)'}
            />
          </section>

          {/* Export Resumen Buttons */}
          <div className="export-bar">
            <button className="btn-secondary" onClick={handleExportResumenPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={15} /> Exportar Resumen PDF
            </button>
            <button className="btn-secondary" onClick={handleExportResumenExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileSpreadsheet size={15} /> Exportar Resumen Excel
            </button>
          </div>

          {/* Ingresos Section */}
          <section className="report-section">
            <div className="report-header" onClick={() => toggleSection('ingresos')}>
              <div className="report-title">
                <DollarSign size={20} style={{ color: '#16a34a' }} />
                <h3>Resumen de Ingresos</h3>
              </div>
              <div className="report-actions">
                <span className="report-count">{resumen.ingresos.cantidad_facturas} facturas</span>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={expandedSections.ingresos ? undefined : handleFetchDetalleIngresos}
                  disabled={loadingDetalle.ingresos || expandedSections.ingresos}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {loadingDetalle.ingresos ? (
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : expandedSections.ingresos ? (
                    <>
                      <ChevronUp size={14} /> Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} /> Ver Detalle
                    </>
                  )}
                </button>
                {detalleIngresos.length > 0 && (
                  <>
                    <button className="btn-secondary btn-sm" onClick={handleExportIngresosPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={14} /> PDF
                    </button>
                    <button className="btn-secondary btn-sm" onClick={handleExportIngresosExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileSpreadsheet size={14} /> Excel
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="report-summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Facturado</span>
                <span className="summary-value" style={{ color: '#16a34a' }}>{formatCOP(resumen.ingresos.total_facturado)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pagado</span>
                <span className="summary-value" style={{ color: '#0284c7' }}>{formatCOP(resumen.ingresos.total_pagado)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pendiente</span>
                <span className="summary-value" style={{ color: '#f59e0b' }}>{formatCOP(resumen.ingresos.total_pendiente)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Facturas</span>
                <span className="summary-value">{resumen.ingresos.cantidad_facturas} ({resumen.ingresos.facturas_pagadas} pagadas / {resumen.ingresos.facturas_pendientes} pendientes)</span>
              </div>
            </div>

            {expandedSections.ingresos && detalleIngresos.length > 0 && (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Factura #</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Cédula</th>
                      <th>Plan</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleIngresos.map((f) => (
                      <tr key={f.f_id}>
                        <td><code>#{f.f_id}</code></td>
                        <td>{formatDate(f.f_fecha_hora)}</td>
                        <td>{f.u_nombres} {f.u_apellidos}</td>
                        <td>{f.u_numero_documento}</td>
                        <td><span className="badge badge-primary">{f.pe_nombre}</span></td>
                        <td><strong>{formatCOP(f.f_valor_total)}</strong></td>
                        <td>
                          <span className={`badge ${f.f_ep_id === 2 ? 'badge-success' : f.f_ep_id === 3 ? 'badge-error' : 'badge-warning'}`}>
                            {f.estado_pago}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Nómina Section */}
          <section className="report-section">
            <div className="report-header" onClick={() => toggleSection('nomina')}>
              <div className="report-title">
                <Users size={20} style={{ color: '#7c3aed' }} />
                <h3>Resumen de Nómina</h3>
              </div>
              <div className="report-actions">
                <span className="report-count">{resumen.nomina.cantidad_pagos} pagos · {resumen.nomina.entrenadores_pagados} entrenadores</span>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={expandedSections.nomina ? undefined : handleFetchDetalleNomina}
                  disabled={loadingDetalle.nomina || expandedSections.nomina}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {loadingDetalle.nomina ? (
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : expandedSections.nomina ? (
                    <>
                      <ChevronUp size={14} /> Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} /> Ver Detalle
                    </>
                  )}
                </button>
                {detalleNomina.length > 0 && (
                  <>
                    <button className="btn-secondary btn-sm" onClick={handleExportNominaPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={14} /> PDF
                    </button>
                    <button className="btn-secondary btn-sm" onClick={handleExportNominaExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileSpreadsheet size={14} /> Excel
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="report-summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Nómina</span>
                <span className="summary-value" style={{ color: '#7c3aed' }}>{formatCOP(resumen.nomina.total_nomina)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Cantidad Pagos</span>
                <span className="summary-value">{resumen.nomina.cantidad_pagos}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Entrenadores Pagados</span>
                <span className="summary-value">{resumen.nomina.entrenadores_pagados}</span>
              </div>
            </div>

            {expandedSections.nomina && detalleNomina.length > 0 && (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha Pago</th>
                      <th>Período</th>
                      <th>Entrenador</th>
                      <th>Especialidad</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleNomina.map((n) => (
                      <tr key={n.hs_id}>
                        <td><code>{n.hs_id}</code></td>
                        <td>{formatDate(n.hs_fecha_pago)}</td>
                        <td>{n.hs_periodo_correspondiente}</td>
                        <td>{n.u_nombres} {n.u_apellidos}</td>
                        <td>{n.en_especialidad || '—'}</td>
                        <td><strong>{formatCOP(n.hs_monto_pagado)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Desglose por entrenador */}
            {resumen.nomina.desglose_por_entrenador.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <div className="report-header" onClick={() => toggleSection('entrenadores')} style={{ cursor: 'pointer' }}>
                  <div className="report-title">
                    <Users size={20} style={{ color: '#7c3aed' }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Desglose por Entrenador</h4>
                  </div>
                  <span className="report-count">{resumen.nomina.desglose_por_entrenador.length} entrenadores</span>
                  <ChevronDown size={14} style={{ transform: expandedSections.entrenadores ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {expandedSections.entrenadores && (
                  <div className="report-table-container">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Entrenador</th>
                          <th>Especialidad</th>
                          <th>Sueldo Base</th>
                          <th>Pagos en Período</th>
                          <th>Total Pagado</th>
                          <th>Último Pago</th>
                          <th>Último Período</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.nomina.desglose_por_entrenador.map((e) => (
                          <tr key={e.en_u_id}>
                            <td>{e.u_nombres} {e.u_apellidos}</td>
                            <td>{e.en_especialidad || '—'}</td>
                            <td>{formatCOP(e.en_sueldo_base)}</td>
                            <td>{e.cantidad_pagos}</td>
                            <td><strong>{formatCOP(e.total_pagado)}</strong></td>
                            <td>{e.ultima_fecha_pago ? formatDate(e.ultima_fecha_pago) : '—'}</td>
                            <td>{e.ultimo_periodo || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Balance Section */}
          <section className="report-section balance-section">
            <div className="balance-header">
              <div className="balance-title">
                <TrendingUp size={24} style={{ color: resumen.balance.utilidad_estimada >= 0 ? '#16a34a' : 'var(--error)' }} />
                <h3>Balance Básico</h3>
              </div>
              <div className={`balance-result ${resumen.balance.utilidad_estimada >= 0 ? 'positive' : 'negative'}`}>
                {formatCOP(resumen.balance.utilidad_estimada)}
              </div>
            </div>
            
            <div className="balance-breakdown">
              <div className="balance-item income">
                <div className="balance-item-header">
                  <DollarSign size={16} style={{ color: '#16a34a' }} />
                  <span>Total Ingresos</span>
                </div>
                <div className="balance-item-value" style={{ color: '#16a34a' }}>
                  {formatCOP(resumen.balance.total_ingresos)}
                </div>
              </div>
              <div className="balance-item expense">
                <div className="balance-item-header">
                  <Users size={16} style={{ color: '#7c3aed' }} />
                  <span>Total Nómina</span>
                </div>
                <div className="balance-item-value" style={{ color: '#7c3aed' }}>
                  -{formatCOP(resumen.balance.total_nomina)}
                </div>
              </div>
              <div className="balance-item result">
                <div className="balance-item-header">
                  <TrendingUp size={16} style={{ color: resumen.balance.utilidad_estimada >= 0 ? '#16a34a' : 'var(--error)' }} />
                  <span>Utilidad Estimada</span>
                </div>
                <div className={`balance-item-value ${resumen.balance.utilidad_estimada >= 0 ? 'positive' : 'negative'}`}>
                  {resumen.balance.utilidad_estimada >= 0 ? '+' : ''}{formatCOP(resumen.balance.utilidad_estimada)}
                </div>
              </div>
            </div>

            <div className="export-bar" style={{ marginTop: '1rem', justifyContent: 'flex-start' }}>
              <button className="btn-secondary" onClick={handleExportResumenPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={15} /> Exportar Balance PDF
              </button>
              <button className="btn-secondary" onClick={handleExportResumenExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileSpreadsheet size={15} /> Exportar Balance Excel
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default InformesFinancierosView;