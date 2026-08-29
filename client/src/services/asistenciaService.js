import api from './api';

/**
 * Obtiene todas las asistencias con información del usuario (Admin)
 */
export const getAllAttendancesAdmin = async () => {
  const response = await api.get('/api/asistencia/admin/all');
  return response.data;
};

/**
 * Actualiza la observación de una asistencia (Admin)
 */
export const updateAttendanceAdmin = async (attendanceId, observacion) => {
  const response = await api.put(`/api/asistencia/admin/${attendanceId}`, { observacion });
  return response.data;
};

/**
 * Elimina una asistencia (Admin)
 */
export const deleteAttendanceAdmin = async (attendanceId) => {
  const response = await api.delete(`/api/asistencia/admin/${attendanceId}`);
  return response.data;
};