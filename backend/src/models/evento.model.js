import { pool } from '../config/db.js';

export const EventoModel = {
    // Obtener todos los eventos (para Admin CRUD)
    getAll: async () => {
        const query = `
            SELECT e.ev_id, e.ev_nombre, e.ev_descripcion, e.ev_fecha_hora, 
                   e.ev_u_id, e.ev_fecha_creacion,
                   COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
            FROM evento e
            LEFT JOIN usuario u ON e.ev_u_id = u.u_id
            ORDER BY e.ev_fecha_hora DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener eventos futuros (para usuarios)
    getFuturos: async () => {
        const query = `
            SELECT e.ev_id, e.ev_nombre, e.ev_descripcion, e.ev_fecha_hora, 
                   e.ev_u_id, e.ev_fecha_creacion,
                   COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
            FROM evento e
            LEFT JOIN usuario u ON e.ev_u_id = u.u_id
            WHERE e.ev_fecha_hora >= NOW()
            ORDER BY e.ev_fecha_hora ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener evento por ID
    getById: async (id) => {
        const query = `
            SELECT e.ev_id, e.ev_nombre, e.ev_descripcion, e.ev_fecha_hora, 
                   e.ev_u_id, e.ev_fecha_creacion,
                   COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
            FROM evento e
            LEFT JOIN usuario u ON e.ev_u_id = u.u_id
            WHERE e.ev_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear nuevo evento y generar notificación para el admin
    create: async ({ ev_u_id, ev_nombre, ev_descripcion, ev_fecha_hora }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insertar el evento
            const eventoQuery = `
                INSERT INTO evento (ev_u_id, ev_nombre, ev_descripcion, ev_fecha_hora)
                VALUES ($1, $2, $3, $4)
                RETURNING ev_id, ev_u_id, ev_nombre, ev_descripcion, ev_fecha_hora, ev_fecha_creacion
            `;
            const eventoValues = [ev_u_id, ev_nombre, ev_descripcion || null, ev_fecha_hora];
            const { rows: eventoRows } = await client.query(eventoQuery, eventoValues);
            const nuevoEvento = eventoRows[0];

            // 2. Crear notificación para el admin que creó el evento
            const notifQuery = `
                INSERT INTO notificacion (n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_evento_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING n_id, n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_leida, n_fecha_envio, n_evento_id
            `;
            const notifValues = [
                ev_u_id,
                'EVENTO_CREADO',
                `Nuevo evento creado: ${ev_nombre}`,
                `Has creado el evento "${ev_nombre}" programado para el ${new Date(ev_fecha_hora).toLocaleDateString('es-CO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}.`,
                nuevoEvento.ev_id
            ];
            await client.query(notifQuery, notifValues);

            await client.query('COMMIT');
            return nuevoEvento;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Actualizar evento existente
    update: async (id, { ev_nombre, ev_descripcion, ev_fecha_hora }) => {
        const query = `
            UPDATE evento
            SET ev_nombre = $1,
                ev_descripcion = $2,
                ev_fecha_hora = $3
            WHERE ev_id = $4
            RETURNING ev_id, ev_u_id, ev_nombre, ev_descripcion, ev_fecha_hora, ev_fecha_creacion
        `;
        const values = [
            ev_nombre,
            ev_descripcion || null,
            ev_fecha_hora,
            id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar evento
    delete: async (id) => {
        const query = `
            DELETE FROM evento
            WHERE ev_id = $1
            RETURNING ev_id
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};