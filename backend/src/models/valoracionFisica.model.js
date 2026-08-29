import { pool } from '../config/db.js';

export const ValoracionFisicaModel = {
    // Obtener género del usuario desde la tabla usuario
    getUserGenero: async (userId) => {
        const query = `SELECT u_genero FROM usuario WHERE u_id = $1`;
        const { rows } = await pool.query(query, [userId]);
        return rows[0]?.u_genero || null;
    },

    // Calcular porcentaje de grasa usando fórmula RFM (Relative Fat Mass)
    // Woolcott & Bergman 2018 - sin necesidad de medida de cuello
    // Hombres: RFM = 64 - (20 * altura / cintura)
    // Mujeres: RFM = 76 - (20 * altura / cintura)
    calcularPorcentajeGrasa: ({ genero, estaturaCm, medidaCintura }) => {
        const altura = estaturaCm;
        const cintura = medidaCintura;
        
        if (!altura || !cintura || cintura <= 0) return null;
        
        if (genero === 'M') {
            const rfm = 64 - (20 * altura / cintura);
            return Math.round(Math.max(0, Math.min(100, rfm)) * 100) / 100;
        } else if (genero === 'F') {
            const rfm = 76 - (20 * altura / cintura);
            return Math.round(Math.max(0, Math.min(100, rfm)) * 100) / 100;
        }
        return null;
    },

    // Obtener todas las valoraciones de un usuario (incluye género del usuario)
    getByUserId: async (userId) => {
        const query = `
            SELECT 
                vf.vf_id, vf.vf_u_id, vf.vf_fecha_registro, vf.vf_peso_kg, vf.vf_estatura_cm,
                vf.vf_medida_pecho, vf.vf_medida_cintura, vf.vf_medida_cadera,
                vf.vf_porcentaje_grasa, vf.vf_observaciones, vf.vf_fecha_creacion,
                u.u_genero
            FROM valoracion_fisica vf
            LEFT JOIN usuario u ON vf.vf_u_id = u.u_id
            WHERE vf.vf_u_id = $1
            ORDER BY vf.vf_fecha_registro DESC, vf.vf_fecha_creacion DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    // Obtener una valoración por ID (incluye género del usuario)
    getById: async (id) => {
        const query = `
            SELECT 
                vf.vf_id, vf.vf_u_id, vf.vf_fecha_registro, vf.vf_peso_kg, vf.vf_estatura_cm,
                vf.vf_medida_pecho, vf.vf_medida_cintura, vf.vf_medida_cadera,
                vf.vf_porcentaje_grasa, vf.vf_observaciones, vf.vf_fecha_creacion,
                u.u_genero
            FROM valoracion_fisica vf
            LEFT JOIN usuario u ON vf.vf_u_id = u.u_id
            WHERE vf.vf_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear nueva valoración física (calcula % grasa usando u_genero del usuario)
    create: async ({ vf_u_id, vf_peso_kg, vf_estatura_cm, vf_medida_pecho, vf_medida_cintura, 
                      vf_medida_cadera, vf_observaciones, vf_fecha_registro }) => {
        
        // Obtener género del usuario
        const genero = await ValoracionFisicaModel.getUserGenero(vf_u_id);
        if (!genero) {
            throw new Error('El usuario no tiene género definido (u_genero). Actualice el perfil del usuario.');
        }

        // Calcular porcentaje de grasa
        const vf_porcentaje_grasa = ValoracionFisicaModel.calcularPorcentajeGrasa({
            genero,
            estaturaCm: vf_estatura_cm,
            medidaCintura: vf_medida_cintura
        });

        const query = `
            INSERT INTO valoracion_fisica (
                vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                vf_medida_pecho, vf_medida_cintura, vf_medida_cadera,
                vf_porcentaje_grasa, vf_observaciones
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING vf_id, vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                      vf_medida_pecho, vf_medida_cintura, vf_medida_cadera,
                      vf_porcentaje_grasa, vf_observaciones, vf_fecha_creacion
        `;

        const values = [
            vf_u_id,
            vf_fecha_registro || new Date().toISOString().split('T')[0],
            vf_peso_kg,
            vf_estatura_cm,
            vf_medida_pecho || null,
            vf_medida_cintura,
            vf_medida_cadera || null,
            vf_porcentaje_grasa,
            vf_observaciones || null
        ];

        const { rows } = await pool.query(query, values);
        
        // Agregar género del usuario al resultado
        const result = rows[0];
        result.u_genero = genero;
        return result;
    },

    // Actualizar valoración física (recalcula % grasa usando u_genero del usuario)
    update: async (id, { vf_peso_kg, vf_estatura_cm, vf_medida_pecho, vf_medida_cintura,
                          vf_medida_cadera, vf_observaciones, vf_fecha_registro }) => {
        
        // Obtener la valoración actual para saber el usuario
        const current = await ValoracionFisicaModel.getById(id);
        if (!current) return null;
        
        const genero = current.u_genero;
        if (!genero) {
            throw new Error('El usuario no tiene género definido (u_genero).');
        }

        // Calcular porcentaje de grasa
        const vf_porcentaje_grasa = ValoracionFisicaModel.calcularPorcentajeGrasa({
            genero,
            estaturaCm: vf_estatura_cm,
            medidaCintura: vf_medida_cintura
        });

        const query = `
            UPDATE valoracion_fisica
            SET vf_peso_kg = $1,
                vf_estatura_cm = $2,
                vf_medida_pecho = $3,
                vf_medida_cintura = $4,
                vf_medida_cadera = $5,
                vf_porcentaje_grasa = $6,
                vf_observaciones = $7,
                vf_fecha_registro = $8
            WHERE vf_id = $9
            RETURNING vf_id, vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                      vf_medida_pecho, vf_medida_cintura, vf_medida_cadera,
                      vf_porcentaje_grasa, vf_observaciones, vf_fecha_creacion
        `;

        const values = [
            vf_peso_kg,
            vf_estatura_cm,
            vf_medida_pecho || null,
            vf_medida_cintura,
            vf_medida_cadera || null,
            vf_porcentaje_grasa,
            vf_observaciones || null,
            vf_fecha_registro || new Date().toISOString().split('T')[0],
            id
        ];

        const { rows } = await pool.query(query, values);
        
        // Agregar género del usuario al resultado
        const result = rows[0];
        result.u_genero = genero;
        return result;
    },

    // Eliminar valoración física
    delete: async (id) => {
        const query = `
            DELETE FROM valoracion_fisica
            WHERE vf_id = $1
            RETURNING vf_id
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};