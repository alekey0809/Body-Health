import api from './api';

// Fallback visual en el cliente por si la conexión a la base de datos no trae información
const defaultPlanes = [
  { pe_id: 1, pe_nombre: 'Mensual', pe_duracion_dias: 30, pe_precio_base: 45.00, pe_eg_id: 1 },
  { pe_id: 2, pe_nombre: 'Trimestral', pe_duracion_dias: 90, pe_precio_base: 120.00, pe_eg_id: 1 },
  { pe_id: 3, pe_nombre: 'Semestral', pe_duracion_dias: 180, pe_precio_base: 210.00, pe_eg_id: 1 }
];

export const getPlanes = async () => {
  try {
    const response = await api.get('/api/planes');
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    return defaultPlanes;
  } catch (error) {
    console.error('Error al conectar con la API de planes:', error);
    return defaultPlanes;
  }
};

export const getPlanById = async (id) => {
  try {
    const response = await api.get(`/api/planes/${id}`);
    if (response.data) {
      return response.data;
    }
    return defaultPlanes.find(p => String(p.pe_id) === String(id)) || defaultPlanes[0];
  } catch (error) {
    console.error('Error al obtener el plan por ID:', error);
    return defaultPlanes.find(p => String(p.pe_id) === String(id)) || defaultPlanes[0];
  }
};

export const createPlan = async (planData) => {
  const response = await api.post('/api/planes', planData);
  return response.data;
};

export const updatePlan = async (id, planData) => {
  const response = await api.put(`/api/planes/${id}`, planData);
  return response.data;
};

export const deletePlan = async (id) => {
  const response = await api.delete(`/api/planes/${id}`);
  return response.data;
};
