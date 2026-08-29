import api from './api';

/**
 * Obtiene todas las valoraciones físicas de un usuario
 */
export const getValoracionesByUser = async (userId) => {
  const response = await api.get(`/api/valoracion-fisica/usuario/${userId}`);
  return response.data;
};

/**
 * Obtiene una valoración física por su ID
 */
export const getValoracionById = async (id) => {
  const response = await api.get(`/api/valoracion-fisica/${id}`);
  return response.data;
};

/**
 * Crea una nueva valoración física
 * Espera: vf_u_id, vf_peso_kg, vf_estatura_cm, vf_medida_pecho, 
 *         vf_medida_cintura, vf_medida_cadera, vf_observaciones, vf_fecha_registro
 * El género se toma automáticamente de u_genero del usuario
 */
export const createValoracion = async (valoracionData) => {
  const response = await api.post('/api/valoracion-fisica', valoracionData);
  return response.data;
};

/**
 * Actualiza una valoración física existente
 */
export const updateValoracion = async (id, valoracionData) => {
  const response = await api.put(`/api/valoracion-fisica/${id}`, valoracionData);
  return response.data;
};

/**
 * Elimina una valoración física
 */
export const deleteValoracion = async (id) => {
  const response = await api.delete(`/api/valoracion-fisica/${id}`);
  return response.data;
};

/**
 * Calcula el porcentaje de grasa (endpoint de previsualización)
 * Requiere userId para obtener el género del usuario
 */
export const calcularPorcentajeGrasa = async ({ userId, estatura_cm, medida_cintura }) => {
  const response = await api.post('/api/valoracion-fisica/calcular-grasa', {
    userId,
    estatura_cm,
    medida_cintura
  });
  return response.data;
};

/**
 * Calcula el porcentaje de grasa localmente (RFM - Relative Fat Mass)
 * Woolcott & Bergman 2018
 * Hombres: RFM = 64 - (20 * altura / cintura)
 * Mujeres: RFM = 76 - (20 * altura / cintura)
 */
export const calcularPorcentajeGrasaLocal = ({ genero, estaturaCm, medidaCintura }) => {
  const altura = estaturaCm;
  const cintura = medidaCintura;
  
  if (!altura || !cintura || cintura <= 0) return null;
  
  if (genero === 'M') {
    const rfm = 64 - (20 * altura / cintura);
    return Math.round(Math.max(0, Math.min(100, rfm)) * 100) / 100;
  } else if (genero === 'F') {
    const rfm = 76 - (20 * altura / cintura);
    return Math.round(Math.max(0, Math.min(100, rfm)) * 100) / 100;
  }
  return null;
};