import { pool } from '../config/db.js';
export const EventoModel = {
    // Obtener todos los eventos (para Admin CRUD)
    getAll: async () => {
        const client = await pool.connect();
        try {
            const query = `
                SELECT e.ev_id, 
                       e.ev_nombre, 
                       e.ev_descripcion, 
                       TO_CHAR(e.ev_fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_hora, 
                       e.ev_u_id, 
                       TO_CHAR(e.ev_fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_creacion,
                       COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
                FROM evento e
                LEFT JOIN usuario u ON e.ev_u_id = u.u_id
                ORDER BY e.ev_fecha_hora DESC
            `;
            const { rows } = await client.query(query);
            return rows;
        } finally {
            client.release();
        }
    },
    // Obtener eventos futuros (para usuarios)
    getFuturos: async () => {
        const client = await pool.connect();
        try {
            const query = `
                SELECT e.ev_id, 
                       e.ev_nombre, 
                       e.ev_descripcion, 
                       TO_CHAR(e.ev_fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_hora, 
                       e.ev_u_id, 
                       TO_CHAR(e.ev_fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_creacion,
                       COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
                FROM evento e
                LEFT JOIN usuario u ON e.ev_u_id = u.u_id
                WHERE e.ev_fecha_hora >= NOW()
                ORDER BY e.ev_fecha_hora ASC
            `;
            const { rows } = await client.query(query);
            return rows;
        } finally {
            client.release();
        }
    },
    // Obtener evento por ID
    getById: async (id) => {
        const client = await pool.connect();
        try {
            const query = `
                SELECT e.ev_id, 
                       e.ev_nombre, 
                       e.ev_descripcion, 
                       TO_CHAR(e.ev_fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_hora, 
                       e.ev_u_id, 
                       TO_CHAR(e.ev_fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_creacion,
                       COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
                FROM evento e
                LEFT JOIN usuario u ON e.ev_u_id = u.u_id
                WHERE e.ev_id = $1
            `;
            const { rows } = await client.query(query, [id]);
            return rows[0];
        } finally {
            client.release();
        }
    },
    // Crear nuevo evento y generar notificación para el usuario/admin que lo creó
    create: async ({ ev_u_id, ev_nombre, ev_descripcion, ev_fecha_hora }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // 1. Insertar el evento
            const eventoQuery = `
                INSERT INTO evento (ev_u_id, ev_nombre, ev_descripcion, ev_fecha_hora)
                VALUES ($1, $2, $3, $4)
                RETURNING ev_id, 
                          ev_u_id, 
                          ev_nombre, 
                          ev_descripcion, 
                          TO_CHAR(ev_fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_hora, 
                          TO_CHAR(ev_fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_creacion
            `;
            const eventoValues = [ev_u_id, ev_nombre, ev_descripcion || null, ev_fecha_hora];
            const { rows: eventoRows } = await client.query(eventoQuery, eventoValues);
            const nuevoEvento = eventoRows[0];
            // 2. Crear notificación para todos los usuarios registrados
            const fechaFormateada = new Date(ev_fecha_hora).toLocaleString('es-CO', {
                dateStyle: 'full',
                timeStyle: 'short'
            });
            const notifQuery = `
                INSERT INTO notificacion (n_u_id, n_tipo_evento, n_titulo, n_mensaje, n_evento_id)
                SELECT u_id, 'EVENTO_CREADO', $1, $2, $3
                FROM usuario
            `;
            const notifValues = [
                `🎉 Nuevo Evento: ${ev_nombre}`,
                `Se ha programado el evento "${ev_nombre}" para el ${fechaFormateada}. ${ev_descripcion ? `Detalles: ${ev_descripcion}` : '¡Te esperamos!'}`,
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
        const client = await pool.connect();
        try {
            const query = `
                UPDATE evento
                SET ev_nombre = $1,
                    ev_descripcion = $2,
                    ev_fecha_hora = $3
                WHERE ev_id = $4
                RETURNING ev_id, 
                          ev_u_id, 
                          ev_nombre, 
                          ev_descripcion, 
                          TO_CHAR(ev_fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_hora, 
                          TO_CHAR(ev_fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS ev_fecha_creacion
            `;
            const values = [
                ev_nombre,
                ev_descripcion || null,
                ev_fecha_hora,
                id
            ];
            const { rows } = await client.query(query, values);
            return rows[0];
        } finally {
            client.release();
        }
    },
    // Eliminar evento
    delete: async (id) => {
        const client = await pool.connect();
        try {
            const query = `
                DELETE FROM evento
                WHERE ev_id = $1
                RETURNING ev_id
            `;
            const { rows } = await client.query(query, [id]);
            return rows[0];
        } finally {
            client.release();
        }
    }
};