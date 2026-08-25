import api, { getCsrfHeaders } from './api';

// ── Autocomplete ──────────────────────────────────────────────────────────────
export const getUserByCedula = async (cedula) => {
  const response = await api.get(`/api/pagos/usuario/cedula/${cedula}`, {
    headers: getCsrfHeaders()
  });
  return response.data;
};

// ── Planes dinámicos ──────────────────────────────────────────────────────────
export const getPlanesPago = async () => {
  try {
    const response = await api.get('/api/pagos/planes', {
      headers: getCsrfHeaders()
    });
    return response.data;
  } catch {
    return [];
  }
};

// ── CRUD Pagos ─────────────────────────────────────────────────────────────────
export const getPagos = async () => {
  try {
    const response = await api.get('/api/pagos', {
      headers: getCsrfHeaders()
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return [];
  }
};

export const getPagoById = async (id) => {
  const response = await api.get(`/api/pagos/${id}`, {
    headers: getCsrfHeaders()
  });
  return response.data;
};

export const createPago = async (pagoData) => {
  // pagoData: { cedula, pe_id }
  const response = await api.post('/api/pagos', pagoData, {
    headers: getCsrfHeaders()
  });
  return response.data;
};

export const deletePago = async (id) => {
  const response = await api.delete(`/api/pagos/${id}`, {
    headers: getCsrfHeaders()
  });
  return response.data;
};

export const updateEstadoPago = async (id, ep_id) => {
  const response = await api.patch(`/api/pagos/${id}/estado`, { ep_id }, {
    headers: getCsrfHeaders()
  });
  return response.data;
};
