import { pool } from '../config/db.js';

export const AsistenciaModel = {
  // Asegurar la creación de la tabla asistencia en PostgreSQL
  initTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS asistencia (
        a_id SERIAL PRIMARY KEY,
        a_s_u_id UUID NOT NULL,
        a_fecha_hora TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        a_observacion VARCHAR(255)
      );
    `;
    try {
      await pool.query(query);
      console.log('✅ Tabla "asistencia" (a_id, a_s_u_id, a_fecha_hora, a_observacion) verificada en PostgreSQL');
    } catch (err) {
      console.error('❌ Error al verificar/crear la tabla asistencia en PostgreSQL:', err.message);
    }
  },

  // Verificar si el usuario ya registró asistencia el día de hoy
  hasAttendedToday: async (userId) => {
    const query = `
      SELECT a_id, a_s_u_id, a_fecha_hora, a_observacion
      FROM asistencia
      WHERE a_s_u_id = $1::uuid
        AND DATE(a_fecha_hora) = CURRENT_DATE
      ORDER BY a_fecha_hora DESC
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Obtener todas las asistencias del usuario desde PostgreSQL
  getByUserId: async (userId) => {
    const query = `
      SELECT a_id, a_s_u_id, a_fecha_hora, a_observacion
      FROM asistencia
      WHERE a_s_u_id = $1::uuid
      ORDER BY a_fecha_hora DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  // Insertar asistencia en PostgreSQL (solo a_s_u_id y a_observacion)
  create: async ({ userId, observacion }) => {
    const query = `
      INSERT INTO asistencia (a_s_u_id, a_observacion)
      VALUES ($1::uuid, $2)
      RETURNING a_id, a_s_u_id, a_fecha_hora, a_observacion;
    `;
    const values = [userId, observacion || null];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
};

// Auto-inicializar la tabla
AsistenciaModel.initTable();
