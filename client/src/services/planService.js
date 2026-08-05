import api from './api';

// Fallback visual en el cliente por si la conexión a la base de datos no trae información
const defaultPlanes = [
  { pe_id: 1, pe_nombre: 'Plan Básico', pe_precio_base: 29.99, pe_eg_id: 1 },
  { pe_id: 2, pe_nombre: 'Plan Pro', pe_precio_base: 49.99, pe_eg_id: 1 },
  { pe_id: 3, pe_nombre: 'Plan VIP Performance', pe_precio_base: 89.99, pe_eg_id: 1 },
  { pe_id: 4, pe_nombre: 'Pase Diario', pe_precio_base: 9.99, pe_eg_id: 1 }
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
  try {
    const response = await api.post('/api/planes', planData);
    return response.data;
  } catch (error) {
    console.error('Error al crear plan:', error);
    return { pe_id: Date.now(), ...planData };
  }
};

export const updatePlan = async (id, planData) => {
  try {
    const response = await api.put(`/api/planes/${id}`, planData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    return { pe_id: id, ...planData };
  }
};

export const deletePlan = async (id) => {
  try {
    const response = await api.delete(`/api/planes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    return { pe_id: id };
  }
};
