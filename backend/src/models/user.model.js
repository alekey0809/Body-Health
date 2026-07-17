import { pool } from '../config/db.js';
import crypto from 'crypto';

export const UserModel = {
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

    // Crear un nuevo usuario (Para el Registro)
    create: async ({ nombres, apellidos, idTipoDoc, numeroDoc, correo, contrasena, idRol, contacto, idEstadoGen }) => {
        
        if (!contrasena || typeof contrasena !== 'string') {
            throw new Error('La contraseña es requerida y debe ser un texto válido');
        }

        // 1. Generar un UUID único para el usuario
        const u_id = crypto.randomUUID();

        // 2. Cifrar la contraseña usando SHA-256 (método nativo rápido)
        const hashContrasena = crypto.createHash('sha256').update(contrasena).digest('hex');

        const query = `
            INSERT INTO usuario (
                u_id, u_nombres, u_apellidos, u_td_id, u_numero_documento, 
                u_correo_electronico, u_contrasena, u_r_id, u_numero_contacto, u_eg_id
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING u_id, u_correo_electronico;                                                                                                                                                                                                                 
        `;

        const values = [
            u_id, nombres, apellidos, idTipoDoc, numeroDoc, 
            correo, hashContrasena, idRol, contacto, idEstadoGen
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }
};