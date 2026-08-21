import { pool } from '../config/db.js';

export const NoticiaModel = {
    // Obtener todas las noticias (para Admin CRUD)
    getAll: async () => {
        const query = `
            SELECT n.n_id, n.n_u_id, n.n_titulo, n.n_contenido, n.n_imagen, 
                   n.n_fecha_publicacion, n.n_fecha_creacion, n.n_estado,
                   COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
            FROM noticia n
            LEFT JOIN usuario u ON n.n_u_id = u.u_id
            ORDER BY n.n_fecha_creacion DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener noticias activas (para Landing Page)
    getActivas: async () => {
        const query = `
            SELECT n.n_id, n.n_u_id, n.n_titulo, n.n_contenido, n.n_imagen, 
                   n.n_fecha_publicacion, n.n_fecha_creacion, n.n_estado,
                   COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
            FROM noticia n
            LEFT JOIN usuario u ON n.n_u_id = u.u_id
            WHERE UPPER(n.n_estado) = 'ACTIVA' OR UPPER(n.n_estado) = 'PUBLICADO'
            ORDER BY n.n_fecha_creacion DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener noticia por ID
    getById: async (id) => {
        const query = `
            SELECT n.n_id, n.n_u_id, n.n_titulo, n.n_contenido, n.n_imagen, 
                   n.n_fecha_publicacion, n.n_fecha_creacion, n.n_estado,
                   COALESCE(u.u_nombres || ' ' || u.u_apellidos, 'Admin BodyHealth') AS autor_nombre
            FROM noticia n
            LEFT JOIN usuario u ON n.n_u_id = u.u_id
            WHERE n.n_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear nueva noticia
    create: async ({ n_u_id, n_titulo, n_contenido, n_imagen, n_fecha_publicacion, n_estado = 'ACTIVA' }) => {
        let userId = n_u_id;

        // Si no se proporcionó n_u_id, buscamos el primer usuario disponible en la BD
        if (!userId) {
            const userRes = await pool.query(`SELECT u_id FROM usuario LIMIT 1`);
            if (userRes.rows.length > 0) {
                userId = userRes.rows[0].u_id;
            } else {
                throw new Error("No existe ningún usuario en la base de datos para asociar la noticia.");
            }
        }

        const query = `
            INSERT INTO noticia (n_u_id, n_titulo, n_contenido, n_imagen, n_fecha_publicacion, n_estado)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING n_id, n_u_id, n_titulo, n_contenido, n_imagen, n_fecha_publicacion, n_fecha_creacion, n_estado
        `;
        const values = [
            userId,
            n_titulo,
            n_contenido,
            n_imagen || null,
            n_fecha_publicacion || new Date(),
            n_estado || 'ACTIVA'
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Actualizar noticia existente
    update: async (id, { n_titulo, n_contenido, n_imagen, n_fecha_publicacion, n_estado }) => {
        const query = `
            UPDATE noticia
            SET n_titulo = $1,
                n_contenido = $2,
                n_imagen = $3,
                n_fecha_publicacion = $4,
                n_estado = $5
            WHERE n_id = $6
            RETURNING n_id, n_u_id, n_titulo, n_contenido, n_imagen, n_fecha_publicacion, n_fecha_creacion, n_estado
        `;
        const values = [
            n_titulo,
            n_contenido,
            n_imagen || null,
            n_fecha_publicacion || new Date(),
            n_estado,
            id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar noticia
    delete: async (id) => {
        const query = `
            DELETE FROM noticia
            WHERE n_id = $1
            RETURNING n_id
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};
