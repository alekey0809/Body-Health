import { pool } from '../config/db.js';

export const NotificacionModel = {
    // Obtener todas las notificaciones de un usuario
    getByUsuario: async (userId, { soloNoLeidas = false, tipo = null, limit = 50 } = {}) => {
        let query = `
            SELECT n.n_id, n.n_u_id, n.n_tipo_evento, n.n_titulo, n.n_mensaje, 
                   n.n_leida, n.n_fecha_envio, n.n_evento_id, n.n_membresia_id,
                   e.ev_nombre as evento_nombre
            FROM notificacion n
            LEFT JOIN evento e ON n.n_evento_id = e.ev_id
            WHERE n.n_u_id = $1
        `;
        const values = [userId];
        let paramIndex = 2;

        if (soloNoLeidas) {
            query += ` AND n.n_leida = FALSE`;
        }

        if (tipo) {
            query += ` AND n.n_tipo_evento = $${paramIndex}`;
            values.push(tipo);
            paramIndex++;
        }

        query += ` ORDER BY n.n_fecha_envio DESC LIMIT $${paramIndex}`;
        values.push(limit);

        const { rows } = await pool.query(query, values);
        return rows;
    },

    // Obtener notificación por ID
    getById: async (id) => {
        const query = `
            SELECT n.n_id, n.n_u_id, n.n_tipo_evento, n.n_titulo, n.n_mensaje, 
                   n.n_leida, n.n_fecha_envio, n.n_evento_id, n.n_membresia_id,
                   e.ev_nombre as evento_nombre
            FROM notificacion n
            LEFT JOIN evento e ON n.n_evento_id = e.ev_id
            WHERE n.n_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear notificación
    create: async ({ n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_evento_id = null, n_membresia_id = null }) => {
        const query = `
            INSERT INTO notificacion (n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_evento_id, n_membresia_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING n_id, n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_leida, n_fecha_envio, n_evento_id, n_membresia_id
        `;
        const values = [n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_evento_id, n_membresia_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Crear notificación de membresía por vencer
    createMembresiaPorVencer: async (userId, membresiaId, diasRestantes, planNombre) => {
        const query = `
            INSERT INTO notificacion (n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_membresia_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING n_id, n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_leida, n_fecha_envio, n_membresia_id
        `;
        const values = [
            userId,
            'MEMBRESIA_POR_VENCER',
            `Tu membresía vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`,
            `Tu membresía del plan "${planNombre}" está por vencer. Renueva ahora para no perder el acceso a las instalaciones.`,
            membresiaId
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Crear notificación de membresía vencida
    createMembresiaVencida: async (userId, membresiaId, planNombre) => {
        const query = `
            INSERT INTO notificacion (n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_membresia_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING n_id, n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_leida, n_fecha_envio, n_membresia_id
        `;
        const values = [
            userId,
            'MEMBRESIA_VENCIDA',
            'Tu membresía ha vencido',
            `Tu membresía del plan "${planNombre}" ha vencido. Renueva tu plan para seguir disfrutando de los beneficios.`,
            membresiaId
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Marcar como leída
    marcarLeida: async (id) => {
        const query = `
            UPDATE notificacion
            SET n_leida = TRUE
            WHERE n_id = $1
            RETURNING n_id, n_leida
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Marcar todas como leídas para un usuario
    marcarTodasLeidas: async (userId) => {
        const query = `
            UPDATE notificacion
            SET n_leida = TRUE
            WHERE n_u_id = $1 AND n_leida = FALSE
            RETURNING n_id
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    // Eliminar notificación
    delete: async (id) => {
        const query = `
            DELETE FROM notificacion
            WHERE n_id = $1
            RETURNING n_id
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Contar notificaciones no leídas
    contarNoLeidas: async (userId) => {
        const query = `
            SELECT COUNT(*) as total
            FROM notificacion
            WHERE n_u_id = $1 AND n_leida = FALSE
        `;
        const { rows } = await pool.query(query, [userId]);
        return parseInt(rows[0].total);
    },

    // Verificar y crear alertas de membresía (para job programado)
    verificarAlertasMembresia: async () => {
        // Obtener membresías que vencen en 3 días o hoy
        const query = `
            SELECT m.m_id, m.m_u_id, m.m_fecha_vencimiento, m.m_eg_id,
                   pe.pe_nombre
            FROM membresia m
            JOIN plan_entrenamiento pe ON m.m_pe_id = pe.pe_id
            WHERE m.m_eg_id = 1  -- Estado activo
            AND m.m_fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
        `;
        const { rows: membresias } = await pool.query(query);

        for (const m of membresias) {
            const diasRestantes = Math.ceil((new Date(m.m_fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
            
            // Verificar si ya existe notificación para esta membresía y tipo
            const existeQuery = `
                SELECT 1 FROM notificacion 
                WHERE n_membresia_id = $1 AND n_tipo_evento IN ('MEMBRESIA_POR_VENCER', 'MEMBRESIA_VENCIDA')
                AND n_fecha_envio >= CURRENT_DATE
            `;
            const { rows: existe } = await pool.query(existeQuery, [m.m_id]);
            
            if (existe.length === 0) {
                if (diasRestantes <= 0) {
                    await NotificacionModel.createMembresiaVencida(m.m_u_id, m.m_id, m.pe_nombre);
                } else {
                    await NotificacionModel.createMembresiaPorVencer(m.m_u_id, m.m_id, diasRestantes, m.pe_nombre);
                }
            }
        }

        return membresias.length;
    }
};