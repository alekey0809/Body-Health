import api from './api';

const defaultPagos = [
  {
    pa_id: 'TRX-9821',
    pa_u_id: 'u01a89b2-1111-4234-8888-abcdef123401',
    pa_pe_id: 2,
    pa_monto: 49.99,
    pa_fecha_pago: '2026-07-22',
    pa_metodo_pago: 'Tarjeta de Crédito',
    pa_estado: 'Completado',
    clientName: 'Laura Gómez',
    clientEmail: 'laura.gomez@gmail.com',
    planName: 'Plan Pro'
  },
  {
    pa_id: 'TRX-9820',
    pa_u_id: 'u01a89b2-2222-4234-8888-abcdef123402',
    pa_pe_id: 3,
    pa_monto: 89.99,
    pa_fecha_pago: '2026-07-21',
    pa_metodo_pago: 'MercadoPago',
    pa_estado: 'Completado',
    clientName: 'Roberto Silva',
    clientEmail: 'roberto.s@hotmail.com',
    planName: 'Plan VIP Performance'
  },
  {
    pa_id: 'TRX-9819',
    pa_u_id: 'u01a89b2-4444-4234-8888-abcdef123404',
    pa_pe_id: 1,
    pa_monto: 29.99,
    pa_fecha_pago: '2026-07-21',
    pa_metodo_pago: 'Transferencia Bancaria',
    pa_estado: 'Pendiente',
    clientName: 'Ana Belén',
    clientEmail: 'anabelen@yahoo.com',
    planName: 'Plan Básico'
  }
];

export const getPagos = async () => {
  try {
    const response = await api.get('/api/pagos');
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    return defaultPagos;
  } catch (error) {
    console.error('Error al conectar con la API de pagos:', error);
    return defaultPagos;
  }
};

export const createPago = async (pagoData) => {
  try {
    const response = await api.post('/api/pagos', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear pago:', error);
    return { pa_id: pagoData.pa_id || `TRX-${Date.now()}`, ...pagoData };
  }
};

export const updatePago = async (id, pagoData) => {
  try {
    const response = await api.put(`/api/pagos/${id}`, pagoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    return { pa_id: id, ...pagoData };
  }
};

export const deletePago = async (id) => {
  try {
    const response = await api.delete(`/api/pagos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    return { pa_id: id };
  }
};
