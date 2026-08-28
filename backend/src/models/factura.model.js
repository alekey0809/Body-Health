import { pool } from '../config/db.js';

export const FacturaModel = {
    // Buscar usuario por número de documento (para autocomplete)
    findUserByCedula: async (cedula) => {
        const query = `
            SELECT u_id, u_nombres, u_apellidos, u_correo_electronico
            FROM usuario
            WHERE u_numero_documento = $1
            LIMIT 1
        `;
        const { rows } = await pool.query(query, [cedula]);
        return rows[0] || null;
    },

    // Obtener todos los planes
    getPlanes: async () => {
        const query = `
            SELECT pe_id, pe_nombre, pe_precio_base
            FROM plan_entrenamiento
            ORDER BY pe_id ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Registrar factura + detalle_factura + membresia en una sola transacción
    registrarPago: async ({ u_id, pe_id, precio_unitario }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insertar factura (usar defaults: f_em_id=1, f_ep_id=1 'PENDIENTE')
            const facturaRes = await client.query(
                `INSERT INTO factura 
                 (f_u_id, f_concepto_pago, f_valor_total, f_impuestos, f_medio_pago, f_fecha_hora)
                 VALUES ($1, 'Inscripción Plan', $2, 0, 'Efectivo', NOW())
                 RETURNING f_id, f_fecha_hora, f_ep_id`,
                [u_id, precio_unitario]
            );
            const { f_id, f_fecha_hora } = facturaRes.rows[0];

            // 2. Insertar detalle_factura (df_cantidad default 1)
            await client.query(
                `INSERT INTO detalle_factura (f_id, pe_id, df_precio_unitario, df_subtotal)
                 VALUES ($1, $2, $3, $4)`,
                [f_id, pe_id, precio_unitario, precio_unitario]
            );

            // 3. Insertar membresia (30 días desde hoy, m_eg_id = 9 Activo)
            const membresiaRes = await client.query(
                `INSERT INTO membresia (m_u_id, m_pe_id, f_id, m_fecha_inicio, m_fecha_vencimiento, m_eg_id)
                 VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 9)
                 RETURNING m_id, m_fecha_inicio, m_fecha_vencimiento, m_eg_id`,
                [u_id, pe_id, f_id]
            );
            const membresia = membresiaRes.rows[0];

            await client.query('COMMIT');
            return { f_id, f_fecha_hora, membresia };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Obtener todas las facturas con info de usuario y plan (para tabla CRUD)
    getAll: async () => {
        const query = `
            SELECT
                f.f_id,
                f.f_valor_total,
                f.f_fecha_hora,
                f.f_ep_id,
                ep.ep_nombre AS estado_pago,
                u.u_id,
                u.u_numero_documento,
                u.u_nombres,
                u.u_apellidos,
                u.u_correo_electronico,
                pe.pe_id,
                pe.pe_nombre,
                df.df_precio_unitario,
                df.df_subtotal,
                m.m_id,
                m.m_fecha_inicio,
                m.m_fecha_vencimiento
            FROM factura f
            JOIN usuario u ON f.f_u_id = u.u_id
            JOIN detalle_factura df ON df.f_id = f.f_id
            JOIN plan_entrenamiento pe ON df.pe_id = pe.pe_id
            LEFT JOIN membresia m ON m.f_id = f.f_id
            LEFT JOIN estado_pago ep ON f.f_ep_id = ep.ep_id
            ORDER BY f.f_fecha_hora DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener factura por ID
    getById: async (f_id) => {
        const query = `
            SELECT
                f.f_id, f.f_valor_total, f.f_fecha_hora, f.f_ep_id,
                ep.ep_nombre AS estado_pago,
                u.u_id, u.u_numero_documento, u.u_nombres, u.u_apellidos, u.u_correo_electronico,
                pe.pe_id, pe.pe_nombre,
                df.df_precio_unitario, df.df_subtotal,
                m.m_id, m.m_fecha_inicio, m.m_fecha_vencimiento
            FROM factura f
            JOIN usuario u ON f.f_u_id = u.u_id
            JOIN detalle_factura df ON df.f_id = f.f_id
            JOIN plan_entrenamiento pe ON df.pe_id = pe.pe_id
            LEFT JOIN membresia m ON m.f_id = f.f_id
            LEFT JOIN estado_pago ep ON f.f_ep_id = ep.ep_id
            WHERE f.f_id = $1
        `;
        const { rows } = await pool.query(query, [f_id]);
        return rows[0] || null;
    },

    // Actualizar estado de pago de una factura
    updateEstadoPago: async (f_id, ep_id) => {
        const query = `
            UPDATE factura SET f_ep_id = $2 WHERE f_id = $1 RETURNING f_id, f_ep_id
        `;
        const { rows } = await pool.query(query, [f_id, ep_id]);
        return rows[0] || null;
    },

    // Eliminar factura en cascada (membresia → detalle_factura → factura)
    delete: async (f_id) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM membresia WHERE f_id = $1', [f_id]);
            await client.query('DELETE FROM detalle_factura WHERE f_id = $1', [f_id]);
            const res = await client.query(
                'DELETE FROM factura WHERE f_id = $1 RETURNING f_id',
                [f_id]
            );
            await client.query('COMMIT');
            return res.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Obtener membresías de un usuario (activas y vencidas)
    getMembresiasByUsuario: async (u_id) => {
        const query = `
            SELECT
                m.m_id,
                m.m_u_id,
                m.m_pe_id,
                m.m_fecha_inicio,
                m.m_fecha_vencimiento,
                m.m_eg_id,
                eg.eg_nombre AS estado_membresia,
                pe.pe_id,
                pe.pe_nombre,
                pe.pe_precio_base,
                f.f_id,
                f.f_valor_total,
                f.f_fecha_hora,
                f.f_ep_id,
                ep.ep_nombre AS estado_pago,
                CASE 
                    WHEN m.m_fecha_vencimiento >= CURRENT_DATE AND m.m_eg_id = 9 THEN true
                    ELSE false
                END AS es_vigente
            FROM membresia m
            JOIN plan_entrenamiento pe ON m.m_pe_id = pe.pe_id
            JOIN factura f ON m.f_id = f.f_id
            LEFT JOIN estado_general eg ON m.m_eg_id = eg.eg_id
            LEFT JOIN estado_pago ep ON f.f_ep_id = ep.ep_id
            WHERE m.m_u_id = $1
            ORDER BY m.m_fecha_inicio DESC
        `;
        const { rows } = await pool.query(query, [u_id]);
        return rows;
    }
};
