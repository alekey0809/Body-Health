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

export const getMembresiasByUsuario = async (userId) => {
  try {
    const response = await api.get(`/api/pagos/usuario/${userId}`, {
      headers: getCsrfHeaders()
    });
    if (response.data.ok && Array.isArray(response.data.membresias)) {
      return response.data.membresias;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener membresías del usuario:', error);
    return [];
  }
};

export const getPagosByUsuario = async (userId) => {
  try {
    const response = await api.get(`/api/pagos/usuario/${userId}`, {
      headers: getCsrfHeaders()
    });
    if (response.data.ok && Array.isArray(response.data.membresias)) {
      // Transform to match old format for backward compatibility
      return response.data.membresias.map(m => ({
        f_id: m.factura.f_id,
        f_valor_total: m.factura.f_valor_total,
        f_fecha_hora: m.factura.f_fecha_hora,
        f_ep_id: m.factura.f_ep_id,
        pe_nombre: m.plan.pe_nombre,
        m_fecha_vencimiento: m.fecha_vencimiento,
        estado_pago: m.factura.estado_pago,
        es_vigente: m.es_vigente
      }));
    }
    return [];
  } catch (error) {
    console.error('Error al obtener pagos del usuario:', error);
    return [];
  }
};
