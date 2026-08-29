import { AsistenciaModel } from '../models/asistencia.model.js';

// Regex para validar formato UUID (ej. "f47ac10b-58cc-4372-a567-0e02b2c3d479")
const isUUID = (str) => typeof str === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

// Obtener el estado de la asistencia del usuario en el día de hoy
export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || !isUUID(userId)) {
      return res.status(400).json({ 
        ok: false, 
        message: `El ID de usuario '${userId}' no tiene formato UUID válido.` 
      });
    }

    const todayRecord = await AsistenciaModel.hasAttendedToday(userId);
    return res.status(200).json({
      ok: true,
      hasAttendedToday: !!todayRecord,
      todayRecord: todayRecord || null
    });
  } catch (error) {
    console.error('Error al consultar estado de asistencia hoy:', error);
    return res.status(500).json({ 
      ok: false, 
      message: `Error al consultar la base de datos PostgreSQL: ${error.message}`, 
      error: error.message 
    });
  }
};

// Obtener el historial de asistencias del usuario
export const getUserAttendances = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || !isUUID(userId)) {
      return res.status(400).json({ 
        ok: false, 
        message: `El ID de usuario '${userId}' no tiene formato UUID válido.` 
      });
    }

    const attendances = await AsistenciaModel.getByUserId(userId);
    return res.status(200).json({
      ok: true,
      attendances
    });
  } catch (error) {
    console.error('Error al consultar historial de asistencias:', error);
    return res.status(500).json({ 
      ok: false, 
      message: `Error al consultar la base de datos PostgreSQL: ${error.message}`, 
      error: error.message 
    });
  }
};

// Verificar membresía activa del usuario
export const checkMembershipStatus = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || !isUUID(userId)) {
      return res.status(400).json({ 
        ok: false, 
        message: `El ID de usuario '${userId}' no tiene formato UUID válido.` 
      });
    }

    console.log('🔍 checkMembershipStatus called for userId:', userId);
    const activeMembership = await AsistenciaModel.hasActiveMembership(userId);
    const latestMembership = await AsistenciaModel.getLatestMembership(userId);
    console.log('🔍 Membership result:', { activeMembership, latestMembership });
    return res.status(200).json({
      ok: true,
      hasActiveMembership: !!activeMembership,
      membership: latestMembership || null
    });
  } catch (error) {
    console.error('Error al consultar membresía:', error);
    return res.status(500).json({ 
      ok: false, 
      message: `Error al consultar la base de datos PostgreSQL: ${error.message}`, 
      error: error.message 
    });
  }
};

// Registrar una nueva asistencia en la base de datos
export const registerAttendance = async (req, res) => {
  try {
    const userId = req.body.userId || req.body.u_id || req.body.id;
    const observacion = req.body.observacion || req.body.a_observacion || null;

    console.log('🔍 registerAttendance called with userId:', userId);

    if (!userId || !isUUID(userId)) {
      return res.status(400).json({ 
        ok: false, 
        message: `El ID de usuario enviado ('${userId}') no es un UUID válido. Por favor cierra sesión e inicia sesión nuevamente.` 
      });
    }

    // Validación: Verificar que el usuario tenga membresía activa (pago realizado)
    const membership = await AsistenciaModel.hasActiveMembership(userId);
    console.log('🔍 Membership check result:', membership);
    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: "No tienes una membresía activa. Debes realizar un pago para registrar asistencia.",
        requiresPayment: true
      });
    }

    // Validación 1-click al día en el backend:
    const alreadyAttended = await AsistenciaModel.hasAttendedToday(userId);
    if (alreadyAttended) {
      return res.status(400).json({
        ok: false,
        message: "Ya has registrado tu asistencia el día de hoy. Solo se permite 1 asistencia diaria."
      });
    }

    const newAttendance = await AsistenciaModel.create({
      userId,
      observacion
    });

    return res.status(201).json({
      ok: true,
      message: "¡Asistencia registrada con éxito en PostgreSQL!",
      attendance: newAttendance,
      membership: membership
    });
  } catch (error) {
    console.error('Error al guardar asistencia en PostgreSQL:', error);

    // Error 23503 en Postgres es Foreign Key Violation (El ID del usuario no existe en la tabla "usuario")
    if (error.code === '23503') {
      return res.status(400).json({
        ok: false,
        message: "El usuario actual no existe en la tabla de usuarios de PostgreSQL. Por favor cierra sesión e inicia sesión de nuevo con un usuario registrado."
      });
    }

    return res.status(500).json({ 
      ok: false, 
      message: `Error al guardar en la base de datos PostgreSQL: ${error.message}`, 
      error: error.message 
    });
  }
};

// Obtener todas las asistencias con info del usuario (Admin)
export const getAllAttendancesAdmin = async (req, res) => {
  try {
    const attendances = await AsistenciaModel.getAllWithUser();
    return res.status(200).json({
      ok: true,
      attendances
    });
  } catch (error) {
    console.error('Error al consultar todas las asistencias (Admin):', error);
    return res.status(500).json({ 
      ok: false, 
      message: `Error al consultar la base de datos PostgreSQL: ${error.message}`, 
      error: error.message 
    });
  }
};

// Actualizar observación de una asistencia (Admin)
export const updateAttendanceAdmin = async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const { observacion } = req.body;

    if (!attendanceId || isNaN(Number(attendanceId))) {
      return res.status(400).json({ 
        ok: false, 
        message: 'ID de asistencia inválido.' 
      });
    }

    const updated = await AsistenciaModel.update(Number(attendanceId), observacion);
    
    if (!updated) {
      return res.status(404).json({
        ok: false,
        message: 'Asistencia no encontrada.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Asistencia actualizada correctamente.',
      attendance: updated
    });
  } catch (error) {
    console.error('Error al actualizar asistencia (Admin):', error);
    return res.status(500).json({ 
      ok: false, 
      message: `Error al actualizar en la base de datos PostgreSQL: ${error.message}`, 
      error: error.message 
    });
  }
};

// Eliminar una asistencia (Admin)
export const deleteAttendanceAdmin = async (req, res) => {
  try {
    const attendanceId = req.params.id;

    if (!attendanceId || isNaN(Number(attendanceId))) {
      return res.status(400).json({ 
        ok: false, 
        message: 'ID de asistencia inválido.' 
      });
    }

    const deleted = await AsistenciaModel.delete(Number(attendanceId));
    
    if (!deleted) {
      return res.status(404).json({
        ok: false,
        message: 'Asistencia no encontrada.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Asistencia eliminada correctamente.'
    });
  } catch (error) {
    console.error('Error al eliminar asistencia (Admin):', error);
    return res.status(500).json({ 
      ok: false, 
      message: `Error al eliminar en la base de datos PostgreSQL: ${error.message}`, 
      error: error.message 
    });
  }
};
