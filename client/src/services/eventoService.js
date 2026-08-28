import api from './api';

export const getEventos = async () => {
  try {
    const response = await api.get('/api/eventos');
    return response.data;
  } catch (error) {
    console.error('Error al conectar con la API de eventos:', error);
    throw error;
  }
};

export const getEventosFuturos = async () => {
  try {
    const response = await api.get('/api/eventos/futuros');
    return response.data;
  } catch (error) {
    console.error('Error al obtener eventos futuros:', error);
    throw error;
  }
};

export const getEventoById = async (id) => {
  try {
    const response = await api.get(`/api/eventos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener evento por ID:', error);
    throw error;
  }
};

export const createEvento = async (eventoData) => {
  try {
    const response = await api.post('/api/eventos', eventoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear evento:', error);
    throw error;
  }
};

export const updateEvento = async (id, eventoData) => {
  try {
    const response = await api.put(`/api/eventos/${id}`, eventoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    throw error;
  }
};

export const deleteEvento = async (id) => {
  try {
    const response = await api.delete(`/api/eventos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    throw error;
  }
};