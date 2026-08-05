import { pool } from '../config/db.js';
import crypto from 'crypto';

export const UserModel = {
    // Obtener todos los usuarios (Para Admin CRUD)
    getAll: async () => {
        const query = `
            SELECT u_id, u_nombres, u_apellidos, u_td_id, u_numero_documento, 
                   u_correo_electronico, u_r_id, u_numero_contacto, u_eg_id, u_fecha_creacion
            FROM usuario
            ORDER BY u_fecha_creacion DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener un usuario por su ID
    getById: async (id) => {
        const query = `
            SELECT u_id, u_nombres, u_apellidos, u_td_id, u_numero_documento, 
                   u_correo_electronico, u_r_id, u_numero_contacto, u_eg_id, u_fecha_creacion
            FROM usuario
            WHERE u_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Buscar un usuario por su correo electrónico (Para el Login)
    findByEmail: async (email) => {
        const query = `
            SELECT u_id, u_nombres, u_apellidos, u_correo_electronico, u_contrasena, u_eg_id, u_r_id 
            FROM usuario 
            WHERE u_correo_electronico = $1
        `;
        const { rows } = await pool.query(query, [email]);
        return rows[0]; 
    },

    // Actualizar perfil del usuario (nombre, apellidos, contacto)
    updateProfile: async (userId, { nombres, apellidos, contacto }) => {
        const query = `
            UPDATE usuario
            SET u_nombres = $1,
                u_apellidos = $2,
                u_numero_contacto = $3
            WHERE u_id = $4
            RETURNING u_id, u_nombres, u_apellidos, u_correo_electronico, u_numero_contacto, u_r_id
        `;
        const { rows } = await pool.query(query, [nombres, apellidos, contacto, userId]);
        return rows[0];
    },

    // Actualización administrativa completa de usuario
    updateAdmin: async (userId, { nombres, apellidos, idTipoDoc, numeroDoc, correo, idRol, contacto, idEstadoGen }) => {
        const query = `
            UPDATE usuario
            SET u_nombres = $1,
                u_apellidos = $2,
                u_td_id = $3,
                u_numero_documento = $4,
                u_correo_electronico = $5,
                u_r_id = $6,
                u_numero_contacto = $7,
                u_eg_id = $8
            WHERE u_id = $9
            RETURNING u_id, u_nombres, u_apellidos, u_td_id, u_numero_documento, u_correo_electronico, u_r_id, u_numero_contacto, u_eg_id
        `;
        const values = [nombres, apellidos, idTipoDoc || 1, numeroDoc || null, correo, idRol || 1, contacto || null, idEstadoGen || 1, userId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Crear un nuevo usuario (Para Registro y Admin CRUD)
    create: async ({ nombres, apellidos, idTipoDoc = 1, numeroDoc = null, correo, contrasena = '123456', idRol = 1, contacto = null, idEstadoGen = 1 }) => {
        if (!contrasena || typeof contrasena !== 'string') {
            throw new Error('La contraseña es requerida y debe ser un texto válido');
        }

        const u_id = crypto.randomUUID();
        const hashContrasena = crypto.createHash('sha256').update(contrasena).digest('hex');

        const query = `
            INSERT INTO usuario (
                u_id, u_nombres, u_apellidos, u_td_id, u_numero_documento, 
                u_correo_electronico, u_contrasena, u_r_id, u_numero_contacto, u_eg_id
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING u_id, u_nombres, u_apellidos, u_correo_electronico, u_r_id, u_eg_id, u_fecha_creacion;
        `;

        const values = [
            u_id, nombres, apellidos, idTipoDoc, numeroDoc, 
            correo, hashContrasena, idRol, contacto, idEstadoGen
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar usuario
    delete: async (userId) => {
        const query = `
            DELETE FROM usuario
            WHERE u_id = $1
            RETURNING u_id
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows[0];
    }
};