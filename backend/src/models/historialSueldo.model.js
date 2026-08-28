import { pool } from '../config/db.js';

export const HistorialSueldoModel = {
    // Obtener todo el historial de sueldos con datos del entrenador
    getAll: async () => {
        const query = `
            SELECT hs.hs_id, hs.hs_en_u_id, hs.hs_monto_pago, hs.hs_fecha_pago, hs.hs_periodo_correspondiente,
                   u.u_nombres, u.u_apellidos, u.u_correo_electronico,
                   e.en_sueldo_base, e.en_especialidad
            FROM historial_sueldo hs
            LEFT JOIN entrenador e ON hs.hs_en_u_id = e.en_u_id
            LEFT JOIN usuario u ON e.en_u_id = u.u_id
            ORDER BY hs.hs_fecha_pago DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener historial de sueldos por entrenador
    getByTrainer: async (en_u_id) => {
        const query = `
            SELECT hs.hs_id, hs.hs_en_u_id, hs.hs_monto_pago, hs.hs_fecha_pago, hs.hs_periodo_correspondiente,
                   u.u_nombres, u.u_apellidos, u.u_correo_electronico,
                   e.en_sueldo_base, e.en_especialidad
            FROM historial_sueldo hs
            LEFT JOIN entrenador e ON hs.hs_en_u_id = e.en_u_id
            LEFT JOIN usuario u ON e.en_u_id = u.u_id
            WHERE hs.hs_en_u_id = $1
            ORDER BY hs.hs_fecha_pago DESC
        `;
        const { rows } = await pool.query(query, [en_u_id]);
        return rows;
    },

    // Obtener resumen de pagos por entrenador (total pagado, último pago, etc.)
    getResumenPorEntrenador: async () => {
        const query = `
            SELECT 
                e.en_u_id,
                u.u_nombres,
                u.u_apellidos,
                u.u_correo_electronico,
                e.en_sueldo_base,
                e.en_especialidad,
                e.en_fecha_contratacion,
                COALESCE(SUM(hs.hs_monto_pago), 0) as total_pagado,
                COUNT(hs.hs_id) as cantidad_pagos,
                MAX(hs.hs_fecha_pago) as ultima_fecha_pago,
                MAX(hs.hs_periodo_correspondiente) as ultimo_periodo
            FROM entrenador e
            LEFT JOIN usuario u ON e.en_u_id = u.u_id
            LEFT JOIN historial_sueldo hs ON e.en_u_id = hs.hs_en_u_id
            WHERE u.u_r_id = 3
            GROUP BY e.en_u_id, u.u_nombres, u.u_apellidos, u.u_correo_electronico, e.en_sueldo_base, e.en_especialidad, e.en_fecha_contratacion
            ORDER BY u.u_nombres, u.u_apellidos
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Crear registro de pago de sueldo
    create: async ({ hs_en_u_id, hs_monto_pago, hs_fecha_pago, hs_periodo_correspondiente }) => {
        const query = `
            INSERT INTO historial_sueldo (hs_en_u_id, hs_monto_pago, hs_fecha_pago, hs_periodo_correspondiente)
            VALUES ($1, $2, $3, $4)
            RETURNING hs_id, hs_en_u_id, hs_monto_pago, hs_fecha_pago, hs_periodo_correspondiente
        `;
        const values = [hs_en_u_id, hs_monto_pago, hs_fecha_pago, hs_periodo_correspondiente];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Actualizar registro de pago
    update: async (hs_id, { hs_monto_pago, hs_fecha_pago, hs_periodo_correspondiente }) => {
        const query = `
            UPDATE historial_sueldo
            SET hs_monto_pago = $1,
                hs_fecha_pago = $2,
                hs_periodo_correspondiente = $3
            WHERE hs_id = $4
            RETURNING hs_id, hs_en_u_id, hs_monto_pago, hs_fecha_pago, hs_periodo_correspondiente
        `;
        const values = [hs_monto_pago, hs_fecha_pago, hs_periodo_correspondiente, hs_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar registro de pago
    delete: async (hs_id) => {
        const query = `
            DELETE FROM historial_sueldo
            WHERE hs_id = $1
            RETURNING hs_id
        `;
        const { rows } = await pool.query(query, [hs_id]);
        return rows[0];
    }
};