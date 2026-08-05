import api from './api';

/**
 * Obtiene todos los entrenadores desde la base de datos.
 * Retorna un array con datos de la tabla entrenador + join con usuario.
 */
export const getEntrenadores = async () => {
  const response = await api.get('/api/entrenadores');
  return response.data;
};

/**
 * Obtiene un entrenador por su UUID (en_u_id).
 */
export const getEntrenadorById = async (id) => {
  const response = await api.get(`/api/entrenadores/${id}`);
  return response.data;
};

/**
 * Crea un nuevo registro de entrenador.
 * @param {{ en_u_id: string, en_sueldo_base: number, en_horario_assigned: string }} data
 */
export const createEntrenador = async (data) => {
  const response = await api.post('/api/entrenadores', data);
  return response.data;
};

/**
 * Actualiza los campos de un entrenador existente.
 * @param {string} id - UUID del entrenador (en_u_id)
 * @param {{ en_sueldo_base: number, en_horario_assigned: string }} data
 */
export const updateEntrenador = async (id, data) => {
  const response = await api.put(`/api/entrenadores/${id}`, data);
  return response.data;
};

/**
 * Elimina un entrenador por su UUID.
 * @param {string} id - UUID del entrenador (en_u_id)
 */
export const deleteEntrenador = async (id) => {
  const response = await api.delete(`/api/entrenadores/${id}`);
  return response.data;
};
