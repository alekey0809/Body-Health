import api from './api';

/**
 * Obtiene todos los usuarios desde la base de datos.
 */
export const getUsuarios = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

/**
 * Obtiene un usuario por su UUID.
 */
export const getUsuarioById = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

/**
 * Crea un nuevo usuario via el endpoint de registro admin.
 * El modelo espera: nombres, apellidos, idTipoDoc, numeroDoc,
 * correo, contrasena, idRol, contacto, idEstadoGen
 */
export const createUsuario = async ({
  u_nombres,
  u_apellidos,
  u_td_id,
  u_numero_documento,
  u_correo_electronico,
  u_contrasena,
  u_r_id,
  u_numero_contacto,
  u_eg_id,
}) => {
  const response = await api.post('/api/users/register', {
    nombres: u_nombres,
    apellidos: u_apellidos,
    idTipoDoc: u_td_id,
    numeroDoc: u_numero_documento || null,
    correo: u_correo_electronico,
    contrasena: u_contrasena || '123456',
    idRol: u_r_id,
    contacto: u_numero_contacto || null,
    idEstadoGen: u_eg_id,
  });
  return response.data?.user ?? response.data;
};

/**
 * Actualiza un usuario existente (endpoint de admin).
 * El modelo updateAdmin espera: nombres, apellidos, idTipoDoc,
 * numeroDoc, correo, idRol, contacto, idEstadoGen
 */
export const updateUsuarioAdmin = async (id, {
  u_nombres,
  u_apellidos,
  u_td_id,
  u_numero_documento,
  u_correo_electronico,
  u_r_id,
  u_numero_contacto,
  u_eg_id,
}) => {
  const response = await api.put(`/api/users/${id}`, {
    nombres: u_nombres,
    apellidos: u_apellidos,
    idTipoDoc: u_td_id,
    numeroDoc: u_numero_documento || null,
    correo: u_correo_electronico,
    idRol: u_r_id,
    contacto: u_numero_contacto || null,
    idEstadoGen: u_eg_id,
  });
  return response.data?.user ?? response.data;
};

/**
 * Elimina un usuario por su UUID.
 */
export const deleteUsuario = async (id) => {
  const response = await api.delete(`/api/users/${id}`);
  return response.data;
};
