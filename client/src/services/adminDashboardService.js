import api from './api';

/**
 * Obtiene los KPIs principales para el dashboard de administración
 */
export const getAdminKPIs = async () => {
  const response = await api.get('/api/admin-dashboard/kpis');
  return response.data;
};

/**
 * Obtiene datos de asistencias mensuales con horas pico
 */
export const getAsistenciasMensual = async () => {
  const response = await api.get('/api/admin-dashboard/asistencias-mensual');
  return response.data;
};

/**
 * Obtiene ventas por tipo de plan del mes actual
 */
export const getVentasPorPlan = async () => {
  const response = await api.get('/api/admin-dashboard/ventas-por-plan');
  return response.data;
};

/**
 * Obtiene socios ausentes (sin visitas en últimos N días)
 */
export const getSociosAusentes = async (dias = 15, limite = 50) => {
  const response = await api.get('/api/admin-dashboard/socios-ausentes', {
    params: { dias, limite }
  });
  return response.data;
};

/**
 * Obtiene pagos pendientes / socios en mora
 */
export const getPagosPendientes = async (limite = 50) => {
  const response = await api.get('/api/admin-dashboard/pagos-pendientes', {
    params: { limite }
  });
  return response.data;
};