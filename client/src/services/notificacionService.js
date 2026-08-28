import api from './api';

export const getNotificaciones = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.soloNoLeidas) queryParams.append('soloNoLeidas', 'true');
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `/api/notificaciones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al conectar con la API de notificaciones:', error);
    throw error;
  }
};

export const getNotificacionById = async (id) => {
  try {
    const response = await api.get(`/api/notificaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificación por ID:', error);
    throw error;
  }
};

export const marcarLeida = async (id) => {
  try {
    const response = await api.put(`/api/notificaciones/${id}/leer`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

export const marcarTodasLeidas = async () => {
  try {
    const response = await api.put('/api/notificaciones/leer-todas');
    return response.data;
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

export const deleteNotificacion = async (id) => {
  try {
    const response = await api.delete(`/api/notificaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
  }
};

export const getNoLeidasCount = async () => {
  try {
    const response = await api.get('/api/notificaciones/no-leidas/count');
    return response.data.count;
  } catch (error) {
    console.error('Error al contar no leídas:', error);
    return 0;
  }
};

// Para admins: trigger manual de verificación de alertas de membresía
export const verificarAlertasMembresia = async () => {
  try {
    const response = await api.post('/api/notificaciones/verificar-membresias');
    return response.data;
  } catch (error) {
    console.error('Error al verificar alertas de membresía:', error);
    throw error;
  }
};