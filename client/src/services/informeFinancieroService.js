import api from './api';

/**
 * Obtiene el resumen financiero completo (ingresos + nómina + balance)
 * para un rango de fechas.
 */
export const getResumenFinanciero = async (fechaInicio, fechaFin) => {
  const response = await api.get('/api/informes-financieros/resumen', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
  return response.data;
};

/**
 * Obtiene el detalle de ingresos (facturas) para un rango de fechas.
 * Para exportación a Excel/PDF.
 */
export const getDetalleIngresos = async (fechaInicio, fechaFin) => {
  const response = await api.get('/api/informes-financieros/ingresos/detalle', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
  return response.data;
};

/**
 * Obtiene el detalle de nómina para un rango de fechas.
 * Para exportación a Excel/PDF.
 */
export const getDetalleNomina = async (fechaInicio, fechaFin) => {
  const response = await api.get('/api/informes-financieros/nomina/detalle', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });
  return response.data;
};