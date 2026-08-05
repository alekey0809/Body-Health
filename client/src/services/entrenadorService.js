import api from './api';

const defaultEntrenadores = [
  {
    en_u_id: 'e01a89b2-1111-4234-8888-abcdef123401',
    en_sueldo_base: 2500.00,
    en_horario_assigned: 'Lunes a Viernes (08:00 AM - 04:00 PM)',
    en_especialidad: 'Yoga',
    en_fecha_contratacion: '2024-01-15',
    u_nombres: 'Elena',
    u_apellidos: 'Valery',
    u_correo_electronico: 'elena.valery@bodyhealth.com',
    u_numero_contacto: 555123456
  },
  {
    en_u_id: 'e01a89b2-2222-4234-8888-abcdef123402',
    en_sueldo_base: 2800.00,
    en_horario_assigned: 'Lunes a Sábado (02:00 PM - 10:00 PM)',
    en_especialidad: 'HIIT',
    en_fecha_contratacion: '2023-11-01',
    u_nombres: 'Marcus',
    u_apellidos: 'Thorne',
    u_correo_electronico: 'marcus.thorne@bodyhealth.com',
    u_numero_contacto: 555987654
  },
  {
    en_u_id: 'e01a89b2-3333-4234-8888-abcdef123403',
    en_sueldo_base: 2600.00,
    en_horario_assigned: 'Lunes a Viernes (06:00 AM - 02:00 PM)',
    en_especialidad: 'Musculación',
    en_fecha_contratacion: '2024-03-20',
    u_nombres: 'Carlos',
    u_apellidos: 'Mendoza',
    u_correo_electronico: 'carlos.mendoza@bodyhealth.com',
    u_numero_contacto: 555456789
  }
];

export const getEntrenadores = async () => {
  try {
    const response = await api.get('/api/entrenadores');
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    return defaultEntrenadores;
  } catch (error) {
    console.error('Error al conectar con la API de entrenadores:', error);
    return defaultEntrenadores;
  }
};

export const getEntrenadorById = async (id) => {
  try {
    const response = await api.get(`/api/entrenadores/${id}`);
    if (response.data) {
      return response.data;
    }
    return defaultEntrenadores.find(e => e.en_u_id === id) || defaultEntrenadores[0];
  } catch (error) {
    console.error('Error al obtener el entrenador por ID:', error);
    return defaultEntrenadores.find(e => e.en_u_id === id) || defaultEntrenadores[0];
  }
};

export const createEntrenador = async (data) => {
  try {
    const response = await api.post('/api/entrenadores', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear entrenador:', error);
    return { ...data, en_fecha_contratacion: new Date().toISOString() };
  }
};

export const updateEntrenador = async (id, data) => {
  try {
    const response = await api.put(`/api/entrenadores/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar entrenador:', error);
    return { en_u_id: id, ...data };
  }
};

export const deleteEntrenador = async (id) => {
  try {
    const response = await api.delete(`/api/entrenadores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar entrenador:', error);
    return { en_u_id: id };
  }
};
