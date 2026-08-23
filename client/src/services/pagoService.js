import api from './api';

// ── Autocomplete ──────────────────────────────────────────────────────────────
export const getUserByCedula = async (cedula) => {
  const response = await api.get(`/api/pagos/usuario/cedula/${cedula}`);
  return response.data;
};

// ── Planes dinámicos ──────────────────────────────────────────────────────────
export const getPlanesPago = async () => {
  try {
    const response = await api.get('/api/pagos/planes');
    return response.data;
  } catch {
    return [];
  }
};

// ── CRUD Pagos ─────────────────────────────────────────────────────────────────
export const getPagos = async () => {
  try {
    const response = await api.get('/api/pagos');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return [];
  }
};

export const getPagoById = async (id) => {
  const response = await api.get(`/api/pagos/${id}`);
  return response.data;
};

export const createPago = async (pagoData) => {
  // pagoData: { cedula, pe_id }
  const response = await api.post('/api/pagos', pagoData);
  return response.data;
};

export const deletePago = async (id) => {
  const response = await api.delete(`/api/pagos/${id}`);
  return response.data;
};
