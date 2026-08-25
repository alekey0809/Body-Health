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

  // Inicializar datos de referencia (estado_general, empresa, estado_pago)
  initReferenceData: async () => {
    try {
      // estado_general - asegurar que exista eg_id = 1 'Activo'
      await pool.query(`
        INSERT INTO estado_general (eg_id, eg_nombre, eg_tipo_entidad) 
        VALUES (1, 'Activo', 'membresia')
        ON CONFLICT (eg_id) DO NOTHING
      `);

      // empresa - asegurar que exista em_id = 1
      await pool.query(`
        INSERT INTO empresa (em_id, em_nit, em_nombre, em_direccion, em_telefono) 
        VALUES (1, '900000000-1', 'BodyHealth Gym', 'Calle 123 #45-67', 6041234567)
        ON CONFLICT (em_id) DO NOTHING
      `);

      // estado_pago - asegurar que existan los estados
      await pool.query(`
        INSERT INTO estado_pago (ep_id, ep_nombre, ep_fecha_cambio) VALUES 
        (1, 'PENDIENTE', CURRENT_TIMESTAMP),
        (2, 'APROBADO', CURRENT_TIMESTAMP),
        (3, 'RECHAZADO', CURRENT_TIMESTAMP),
        (4, 'EN_PROCESO', CURRENT_TIMESTAMP),
        (5, 'ANULADO', CURRENT_TIMESTAMP)
        ON CONFLICT (ep_id) DO NOTHING
      `);

      console.log('✅ Datos de referencia verificados (estado_general, empresa, estado_pago)');
    } catch (err) {
      console.error('❌ Error al inicializar datos de referencia:', err.message);
    }
  },

  // Verificar si el usuario tiene membresía activa (pago realizado y vigente)
  hasActiveMembership: async (userId) => {
    const query = `
      SELECT m.m_id, m.m_fecha_inicio, m.m_fecha_vencimiento, m.m_eg_id, pe.pe_nombre
      FROM membresia m
      JOIN plan_entrenamiento pe ON m.m_pe_id = pe.pe_id
      WHERE m.m_u_id = $1::uuid
        AND m.m_fecha_vencimiento >= CURRENT_DATE
        AND m.m_eg_id = 1  -- Estado activo en estado_general
      ORDER BY m.m_fecha_vencimiento DESC
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [userId]);
    console.log('🔍 hasActiveMembership check:', { userId, found: rows.length > 0, membership: rows[0] || null });
    return rows.length > 0 ? rows[0] : null;
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
AsistenciaModel.initReferenceData();
