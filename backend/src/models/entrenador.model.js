import { pool } from '../config/db.js';

export const EntrenadorModel = {
    // Obtener todos los entrenadores junto con sus datos de usuario (filtrando usuarios con rol 3)
    getAll: async () => {
        const query = `
            SELECT e.en_u_id, e.en_sueldo_base, e.en_horario_assigned, e.en_especialidad, e.en_fecha_contratacion,
                   u.u_nombres, u.u_apellidos, u.u_correo_electronico, u.u_numero_contacto, u.u_r_id
            FROM entrenador e
            LEFT JOIN usuario u ON e.en_u_id = u.u_id
            WHERE u.u_r_id = 3
            ORDER BY e.en_fecha_contratacion DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener usuarios con rol 3 (Entrenador) que NO están registrados como entrenadores
    getAvailableUsersForTrainer: async () => {
        const query = `
            SELECT u.u_id, u.u_nombres, u.u_apellidos, u.u_correo_electronico, u.u_numero_contacto
            FROM usuario u
            WHERE u.u_r_id = 3
            AND u.u_id NOT IN (SELECT en_u_id FROM entrenador)
            ORDER BY u.u_nombres, u.u_apellidos
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener un entrenador por su ID de usuario (en_u_id)
    getById: async (en_u_id) => {
        const query = `
            SELECT e.en_u_id, e.en_sueldo_base, e.en_horario_assigned, e.en_especialidad, e.en_fecha_contratacion,
                   u.u_nombres, u.u_apellidos, u.u_correo_electronico, u.u_numero_contacto
            FROM entrenador e
            LEFT JOIN usuario u ON e.en_u_id = u.u_id
            WHERE e.en_u_id = $1
        `;
        const { rows } = await pool.query(query, [en_u_id]);
        return rows[0];
    },

    // Crear registro de entrenador
    create: async ({ en_u_id, en_sueldo_base, en_horario_assigned, en_especialidad }) => {
        const query = `
            INSERT INTO entrenador (en_u_id, en_sueldo_base, en_horario_assigned, en_especialidad)
            VALUES ($1, $2, $3, $4)
            RETURNING en_u_id, en_sueldo_base, en_horario_assigned, en_especialidad, en_fecha_contratacion
        `;
        const values = [en_u_id, en_sueldo_base, en_horario_assigned, en_especialidad];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Actualizar registro de entrenador
    update: async (en_u_id, { en_sueldo_base, en_horario_assigned, en_especialidad }) => {
        const query = `
            UPDATE entrenador
            SET en_sueldo_base = $1,
                en_horario_assigned = $2,
                en_especialidad = $3
            WHERE en_u_id = $4
            RETURNING en_u_id, en_sueldo_base, en_horario_assigned, en_especialidad, en_fecha_contratacion
        `;
        const values = [en_sueldo_base, en_horario_assigned, en_especialidad, en_u_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar entrenador
    delete: async (en_u_id) => {
        const query = `
            DELETE FROM entrenador
            WHERE en_u_id = $1
            RETURNING en_u_id
        `;
        const { rows } = await pool.query(query, [en_u_id]);
        return rows[0];
    },

    // Obtener historial de sueldos de todos los entrenadores
    getSalarioHistorial: async () => {
        const query = `
            SELECT 
                e.en_u_id,
                u.u_nombres,
                u.u_apellidos,
                u.u_correo_electronico,
                e.en_sueldo_base,
                e.en_horario_assigned,
                e.en_fecha_contratacion,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'hs_id', hs.hs_id,
                            'hs_monto_pagado', hs.hs_monto_pagado,
                            'hs_fecha_pago', hs.hs_fecha_pago,
                            'hs_periodo_correspondiente', hs.hs_periodo_correspondiente
                        ) ORDER BY hs.hs_fecha_pago DESC
                    ) FILTER (WHERE hs.hs_id IS NOT NULL),
                    '[]'
                ) as historial_pagos,
                COALESCE(SUM(hs.hs_monto_pagado), 0) as total_pagado
            FROM entrenador e
            LEFT JOIN usuario u ON e.en_u_id = u.u_id
            LEFT JOIN historial_sueldo hs ON e.en_u_id = hs.hs_en_u_id
            WHERE u.u_r_id = 3
            GROUP BY e.en_u_id, u.u_nombres, u.u_apellidos, u.u_correo_electronico, e.en_sueldo_base, e.en_horario_assigned, e.en_fecha_contratacion
            ORDER BY e.en_fecha_contratacion DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};
