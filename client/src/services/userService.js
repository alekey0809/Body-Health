import api from './api';

const defaultUsuarios = [
  {
    u_id: 'u01a89b2-1111-4234-8888-abcdef123401',
    u_nombres: 'Laura',
    u_apellidos: 'Gómez',
    u_td_id: 1,
    u_numero_documento: 1020304050,
    u_correo_electronico: 'laura.gomez@gmail.com',
    u_r_id: 1, // Cliente
    u_numero_contacto: 3001234567,
    u_eg_id: 1, // Activo
    u_fecha_creacion: '2026-01-15T10:00:00Z'
  },
  {
    u_id: 'u01a89b2-2222-4234-8888-abcdef123402',
    u_nombres: 'Roberto',
    u_apellidos: 'Silva',
    u_td_id: 1,
    u_numero_documento: 1098765432,
    u_correo_electronico: 'roberto.s@hotmail.com',
    u_r_id: 1,
    u_numero_contacto: 3119876543,
    u_eg_id: 1,
    u_fecha_creacion: '2026-03-10T14:30:00Z'
  },
  {
    u_id: 'u01a89b2-3333-4234-8888-abcdef123403',
    u_nombres: 'Elena',
    u_apellidos: 'Valery',
    u_td_id: 1,
    u_numero_documento: 1055443322,
    u_correo_electronico: 'elena.valery@bodyhealth.com',
    u_r_id: 2, // Entrenador
    u_numero_contacto: 3205554433,
    u_eg_id: 1,
    u_fecha_creacion: '2025-08-01T09:00:00Z'
  },
  {
    u_id: 'u01a89b2-4444-4234-8888-abcdef123404',
    u_nombres: 'Admin',
    u_apellidos: 'Principal',
    u_td_id: 1,
    u_numero_documento: 1000000001,
    u_correo_electronico: 'admin@bodyhealth.com',
    u_r_id: 3, // Admin
    u_numero_contacto: 3000000000,
    u_eg_id: 1,
    u_fecha_creacion: '2025-01-01T00:00:00Z'
  }
];

export const getUsuarios = async () => {
  try {
    const response = await api.get('/api/users');
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    return defaultUsuarios;
  } catch (error) {
    console.error('Error al conectar con la API de usuarios:', error);
    return defaultUsuarios;
  }
};

export const getUsuarioById = async (id) => {
  try {
    const response = await api.get(`/api/users/${id}`);
    if (response.data) {
      return response.data;
    }
    return defaultUsuarios.find(u => u.u_id === id) || defaultUsuarios[0];
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return defaultUsuarios.find(u => u.u_id === id) || defaultUsuarios[0];
  }
};

export const createUsuario = async (userData) => {
  try {
    const response = await api.post('/api/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { u_id: `u-${Date.now()}`, ...userData, u_fecha_creacion: new Date().toISOString() };
  }
};

export const updateUsuarioAdmin = async (id, userData) => {
  try {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { u_id: id, ...userData };
  }
};

export const deleteUsuario = async (id) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return { u_id: id };
  }
};
