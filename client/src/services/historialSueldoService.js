import api from './api';

/**
 * Obtiene todo el historial de sueldos desde la base de datos.
 */
export const getHistorialSueldos = async () => {
  const response = await api.get('/api/historial-sueldos');
  return response.data;
};

/**
 * Obtiene el resumen de sueldos pagados por entrenador.
 * Incluye: total pagado, cantidad de pagos, último pago, último período.
 */
export const getResumenSueldosEntrenadores = async () => {
  const response = await api.get('/api/historial-sueldos/resumen');
  return response.data;
};

/**
 * Obtiene el historial de sueldos de un entrenador específico.
 */
export const getHistorialSueldoByTrainer = async (en_u_id) => {
  const response = await api.get(`/api/historial-sueldos/entrenador/${en_u_id}`);
  return response.data;
};

/**
 * Crea un nuevo registro de pago de sueldo.
 */
export const createHistorialSueldo = async (data) => {
  const response = await api.post('/api/historial-sueldos', data);
  return response.data;
};

/**
 * Actualiza un registro de pago de sueldo.
 */
export const updateHistorialSueldo = async (id, data) => {
  const response = await api.put(`/api/historial-sueldos/${id}`, data);
  return response.data;
};

/**
 * Elimina un registro de pago de sueldo.
 */
export const deleteHistorialSueldo = async (id) => {
  const response = await api.delete(`/api/historial-sueldos/${id}`);
  return response.data;
};