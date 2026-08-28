import { pool } from '../config/db.js';

export const ValoracionFisicaModel = {
    // Calcular porcentaje de grasa usando fórmula US Navy
    // Hombres: %Fat = 495 / (1.0324 - 0.19077 * log10(cintura - cuello) + 0.15456 * log10(altura)) - 450
    // Mujeres: %Fat = 495 / (1.29579 - 0.35004 * log10(cintura + cadera - cuello) + 0.22100 * log10(altura)) - 450
    calcularPorcentajeGrasa: ({ genero, estaturaCm, medidaCintura, medidaCadera, medidaCuello }) => {
        const altura = estaturaCm;
        const cintura = medidaCintura;
        const cuello = medidaCuello;
        
        if (genero === 'M') {
            // Fórmula para hombres
            const valor = cintura - cuello;
            if (valor <= 0) return null;
            const logCinturaCuello = Math.log10(valor);
            const logAltura = Math.log10(altura);
            const denominador = 1.0324 - 0.19077 * logCinturaCuello + 0.15456 * logAltura;
            if (denominador <= 0) return null;
            return Math.round((495 / denominador - 450) * 100) / 100;
        } else if (genero === 'F') {
            // Fórmula para mujeres (requiere cadera)
            if (!medidaCadera || medidaCadera <= 0) return null;
            const valor = cintura + medidaCadera - cuello;
            if (valor <= 0) return null;
            const logCinturaCaderaCuello = Math.log10(valor);
            const logAltura = Math.log10(altura);
            const denominador = 1.29579 - 0.35004 * logCinturaCaderaCuello + 0.22100 * logAltura;
            if (denominador <= 0) return null;
            return Math.round((495 / denominador - 450) * 100) / 100;
        }
        return null;
    },

    // Obtener todas las valoraciones de un usuario
    getByUserId: async (userId) => {
        const query = `
            SELECT vf_id, vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                   vf_medida_pecho, vf_medida_cintura, vf_medida_cadera, vf_medida_cuello,
                   vf_genero, vf_porcentaje_grasa, vf_observaciones, vf_fecha_creacion
            FROM valoracion_fisica
            WHERE vf_u_id = $1
            ORDER BY vf_fecha_registro DESC, vf_fecha_creacion DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    // Obtener una valoración por ID
    getById: async (id) => {
        const query = `
            SELECT vf_id, vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                   vf_medida_pecho, vf_medida_cintura, vf_medida_cadera, vf_medida_cuello,
                   vf_genero, vf_porcentaje_grasa, vf_observaciones, vf_fecha_creacion
            FROM valoracion_fisica
            WHERE vf_id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear nueva valoración física
    create: async ({ vf_u_id, vf_peso_kg, vf_estatura_cm, vf_medida_pecho, vf_medida_cintura, 
                      vf_medida_cadera, vf_medida_cuello, vf_genero, vf_observaciones, vf_fecha_registro }) => {
        
        // Calcular porcentaje de grasa
        const vf_porcentaje_grasa = ValoracionFisicaModel.calcularPorcentajeGrasa({
            genero: vf_genero,
            estaturaCm: vf_estatura_cm,
            medidaCintura: vf_medida_cintura,
            medidaCadera: vf_medida_cadera,
            medidaCuello: vf_medida_cuello
        });

        const query = `
            INSERT INTO valoracion_fisica (
                vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                vf_medida_pecho, vf_medida_cintura, vf_medida_cadera, vf_medida_cuello,
                vf_genero, vf_porcentaje_grasa, vf_observaciones
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING vf_id, vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                      vf_medida_pecho, vf_medida_cintura, vf_medida_cadera, vf_medida_cuello,
                      vf_genero, vf_porcentaje_grasa, vf_observaciones, vf_fecha_creacion
        `;

        const values = [
            vf_u_id,
            vf_fecha_registro || new Date().toISOString().split('T')[0],
            vf_peso_kg,
            vf_estatura_cm,
            vf_medida_pecho || null,
            vf_medida_cintura,
            vf_medida_cadera || null,
            vf_medida_cuello,
            vf_genero,
            vf_porcentaje_grasa,
            vf_observaciones || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Actualizar valoración física
    update: async (id, { vf_peso_kg, vf_estatura_cm, vf_medida_pecho, vf_medida_cintura,
                          vf_medida_cadera, vf_medida_cuello, vf_genero, vf_observaciones, vf_fecha_registro }) => {
        
        // Calcular porcentaje de grasa
        const vf_porcentaje_grasa = ValoracionFisicaModel.calcularPorcentajeGrasa({
            genero: vf_genero,
            estaturaCm: vf_estatura_cm,
            medidaCintura: vf_medida_cintura,
            medidaCadera: vf_medida_cadera,
            medidaCuello: vf_medida_cuello
        });

        const query = `
            UPDATE valoracion_fisica
            SET vf_peso_kg = $1,
                vf_estatura_cm = $2,
                vf_medida_pecho = $3,
                vf_medida_cintura = $4,
                vf_medida_cadera = $5,
                vf_medida_cuello = $6,
                vf_genero = $7,
                vf_porcentaje_grasa = $8,
                vf_observaciones = $9,
                vf_fecha_registro = $10
            WHERE vf_id = $11
            RETURNING vf_id, vf_u_id, vf_fecha_registro, vf_peso_kg, vf_estatura_cm,
                      vf_medida_pecho, vf_medida_cintura, vf_medida_cadera, vf_medida_cuello,
                      vf_genero, vf_porcentaje_grasa, vf_observaciones, vf_fecha_creacion
        `;

        const values = [
            vf_peso_kg,
            vf_estatura_cm,
            vf_medida_pecho || null,
            vf_medida_cintura,
            vf_medida_cadera || null,
            vf_medida_cuello,
            vf_genero,
            vf_porcentaje_grasa,
            vf_observaciones || null,
            vf_fecha_registro || new Date().toISOString().split('T')[0],
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
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