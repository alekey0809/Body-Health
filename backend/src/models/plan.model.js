import { pool } from '../config/db.js';

export const PlanModel = {
    // Obtener todos los planes de entrenamiento
    getAll: async () => {
        const query = `
            SELECT pe_id, pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id, pe_fecha_creacion 
            FROM plan_entrenamiento 
            ORDER BY pe_id ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener un plan por su ID
    getById: async (id) => {
        const query = `
            SELECT pe_id, pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id, pe_fecha_creacion 
            FROM plan_entrenamiento 
            WHERE pe_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear un nuevo plan de entrenamiento
    create: async ({ pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id = 1 }) => {
        const query = `
            INSERT INTO plan_entrenamiento (pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id)
            VALUES ($1, $2, $3, $4)
            RETURNING pe_id, pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id, pe_fecha_creacion
        `;
        const values = [pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Actualizar un plan existente
    update: async (id, { pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id = 1 }) => {
        const query = `
            UPDATE plan_entrenamiento
            SET pe_nombre = $1,
                pe_duracion_dias = $2,
                pe_precio_base = $3,
                pe_eg_id = $4
            WHERE pe_id = $5
            RETURNING pe_id, pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id, pe_fecha_creacion
        `;
        const values = [pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar un plan
    delete: async (id) => {
        const query = `
            DELETE FROM plan_entrenamiento 
            WHERE pe_id = $1
            RETURNING pe_id
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};
