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
 *         vf_medida_cintura, vf_medida_cadera, vf_medida_cuello, 
 *         vf_genero, vf_observaciones, vf_fecha_registro
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
 */
export const calcularPorcentajeGrasa = async ({ genero, estatura_cm, medida_cintura, medida_cadera, medida_cuello }) => {
  const response = await api.post('/api/valoracion-fisica/calcular-grasa', {
    genero,
    estatura_cm,
    medida_cintura,
    medida_cadera,
    medida_cuello
  });
  return response.data;
};

/**
 * Calcula el porcentaje de grasa localmente (US Navy Method)
 * Hombres: %Fat = 495 / (1.0324 - 0.19077 * log10(cintura - cuello) + 0.15456 * log10(altura)) - 450
 * Mujeres: %Fat = 495 / (1.29579 - 0.35004 * log10(cintura + cadera - cuello) + 0.22100 * log10(altura)) - 450
 */
export const calcularPorcentajeGrasaLocal = ({ genero, estaturaCm, medidaCintura, medidaCadera, medidaCuello }) => {
  const altura = estaturaCm;
  const cintura = medidaCintura;
  const cuello = medidaCuello;
  
  if (genero === 'M') {
    const valor = cintura - cuello;
    if (valor <= 0) return null;
    const logCinturaCuello = Math.log10(valor);
    const logAltura = Math.log10(altura);
    const denominador = 1.0324 - 0.19077 * logCinturaCuello + 0.15456 * logAltura;
    if (denominador <= 0) return null;
    return Math.round((495 / denominador - 450) * 100) / 100;
  } else if (genero === 'F') {
    if (!medidaCadera || medidaCadera <= 0) return null;
    const valor = cintura + medidaCadera - cuello;
    if (valor <= 0) return null;
    const logCinturaCaderaCuello = Math.log10(valor);
    const logAltura = Math.log10(altura);
    const denominador = 1.29579 - 0.35004 * logCinturaCaderaCuello + 0.22100 * logAltura;
    if (denominador <= 0) return null;
    return Math.round((495 / denominador - 450) * 100) / 100;
  }
  return null;
};