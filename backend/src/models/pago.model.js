import { pool } from '../config/db.js';

export const PagoModel = {
    // Obtener todos los pagos
    getAll: async () => {
        const query = `
            SELECT pa_id, pa_u_id, pa_pe_id, pa_monto, pa_fecha_pago, pa_metodo_pago, pa_estado
            FROM pago
            ORDER BY pa_fecha_pago DESC
        `;
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.warn('Tabla pago no existente aún en BD, usando controlador fallback.');
            return null;
        }
    },

    // Obtener pago por ID
    getById: async (id) => {
        const query = `
            SELECT pa_id, pa_u_id, pa_pe_id, pa_monto, pa_fecha_pago, pa_metodo_pago, pa_estado
            FROM pago
            WHERE pa_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Registrar pago
    create: async ({ pa_id, pa_u_id, pa_pe_id, pa_monto, pa_metodo_pago, pa_estado = 'Completado' }) => {
        const query = `
            INSERT INTO pago (pa_id, pa_u_id, pa_pe_id, pa_monto, pa_metodo_pago, pa_estado)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING pa_id, pa_u_id, pa_pe_id, pa_monto, pa_fecha_pago, pa_metodo_pago, pa_estado
        `;
        const values = [pa_id, pa_u_id, pa_pe_id, pa_monto, pa_metodo_pago, pa_estado];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Actualizar pago
    update: async (id, { pa_monto, pa_metodo_pago, pa_estado }) => {
        const query = `
            UPDATE pago
            SET pa_monto = $1,
                pa_metodo_pago = $2,
                pa_estado = $3
            WHERE pa_id = $4
            RETURNING pa_id, pa_u_id, pa_pe_id, pa_monto, pa_fecha_pago, pa_metodo_pago, pa_estado
        `;
        const values = [pa_monto, pa_metodo_pago, pa_estado, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar pago
    delete: async (id) => {
        const query = `
            DELETE FROM pago
            WHERE pa_id = $1
            RETURNING pa_id
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};
