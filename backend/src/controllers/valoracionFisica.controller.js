import { ValoracionFisicaModel } from '../models/valoracionFisica.model.js';

export const getValoracionesByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const valoraciones = await ValoracionFisicaModel.getByUserId(userId);
        return res.json(valoraciones);
    } catch (error) {
        console.error('Error al obtener valoraciones físicas:', error);
        return res.status(500).json({ ok: false, message: 'Error al obtener valoraciones físicas', error: error.message });
    }
};

export const getValoracionById = async (req, res) => {
    const { id } = req.params;
    try {
        const valoracion = await ValoracionFisicaModel.getById(id);
        if (!valoracion) {
            return res.status(404).json({ ok: false, message: 'Valoración física no encontrada' });
        }
        return res.json(valoracion);
    } catch (error) {
        console.error('Error al obtener valoración física:', error);
        return res.status(500).json({ ok: false, message: 'Error al obtener valoración física', error: error.message });
    }
};

export const createValoracion = async (req, res) => {
    try {
        const { 
            vf_u_id, vf_peso_kg, vf_estatura_cm, vf_medida_pecho, 
            vf_medida_cintura, vf_medida_cadera, vf_observaciones, vf_fecha_registro 
        } = req.body;

        // Validaciones requeridas
        if (!vf_u_id) {
            return res.status(400).json({ ok: false, message: 'El ID del usuario (vf_u_id) es requerido' });
        }
        if (!vf_peso_kg || isNaN(parseFloat(vf_peso_kg))) {
            return res.status(400).json({ ok: false, message: 'El peso (vf_peso_kg) es requerido y debe ser numérico' });
        }
        if (!vf_estatura_cm || isNaN(parseInt(vf_estatura_cm))) {
            return res.status(400).json({ ok: false, message: 'La estatura (vf_estatura_cm) es requerida y debe ser un entero' });
        }
        if (!vf_medida_cintura || isNaN(parseFloat(vf_medida_cintura))) {
            return res.status(400).json({ ok: false, message: 'La medida de cintura (vf_medida_cintura) es requerida y debe ser numérica' });
        }

        // Verificar que el usuario tenga género definido
        const genero = await ValoracionFisicaModel.getUserGenero(vf_u_id);
        if (!genero) {
            return res.status(400).json({ ok: false, message: 'El usuario no tiene género definido. Actualice el perfil del usuario (u_genero: M o F).' });
        }

        // Validar rangos razonables
        const peso = parseFloat(vf_peso_kg);
        const estatura = parseInt(vf_estatura_cm);
        const cintura = parseFloat(vf_medida_cintura);
        const pecho = vf_medida_pecho ? parseFloat(vf_medida_pecho) : null;
        const cadera = vf_medida_cadera ? parseFloat(vf_medida_cadera) : null;

        if (peso < 20 || peso > 300) {
            return res.status(400).json({ ok: false, message: 'El peso debe estar entre 20 y 300 kg' });
        }
        if (estatura < 50 || estatura > 250) {
            return res.status(400).json({ ok: false, message: 'La estatura debe estar entre 50 y 250 cm' });
        }
        if (cintura < 30 || cintura > 200) {
            return res.status(400).json({ ok: false, message: 'La medida de cintura debe estar entre 30 y 200 cm' });
        }
        if (pecho && (pecho < 30 || pecho > 200)) {
            return res.status(400).json({ ok: false, message: 'La medida de pecho debe estar entre 30 y 200 cm' });
        }
        if (cadera && (cadera < 30 || cadera > 200)) {
            return res.status(400).json({ ok: false, message: 'La medida de cadera debe estar entre 30 y 200 cm' });
        }

        // Validar fecha
        let fechaRegistro = vf_fecha_registro || new Date().toISOString().split('T')[0];
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaRegistro)) {
            return res.status(400).json({ ok: false, message: 'La fecha de registro debe tener formato YYYY-MM-DD' });
        }

        const nuevaValoracion = await ValoracionFisicaModel.create({
            vf_u_id,
            vf_peso_kg: peso,
            vf_estatura_cm: estatura,
            vf_medida_pecho: pecho,
            vf_medida_cintura: cintura,
            vf_medida_cadera: cadera,
            vf_observaciones: vf_observaciones?.trim() || null,
            vf_fecha_registro: fechaRegistro
        });

        return res.status(201).json({
            ok: true,
            message: 'Valoración física registrada correctamente',
            valoracion: nuevaValoracion
        });
    } catch (error) {
        console.error('Error al crear valoración física:', error);
        return res.status(500).json({ ok: false, message: error.message || 'Error al crear valoración física', error: error.message });
    }
};

export const updateValoracion = async (req, res) => {
    const { id } = req.params;
    try {
        const { 
            vf_peso_kg, vf_estatura_cm, vf_medida_pecho, 
            vf_medida_cintura, vf_medida_cadera, vf_observaciones, vf_fecha_registro 
        } = req.body;

        // Validaciones
        if (!vf_peso_kg || isNaN(parseFloat(vf_peso_kg))) {
            return res.status(400).json({ ok: false, message: 'El peso (vf_peso_kg) es requerido y debe ser numérico' });
        }
        if (!vf_estatura_cm || isNaN(parseInt(vf_estatura_cm))) {
            return res.status(400).json({ ok: false, message: 'La estatura (vf_estatura_cm) es requerida y debe ser un entero' });
        }
        if (!vf_medida_cintura || isNaN(parseFloat(vf_medida_cintura))) {
            return res.status(400).json({ ok: false, message: 'La medida de cintura (vf_medida_cintura) es requerida y debe ser numérica' });
        }

        const peso = parseFloat(vf_peso_kg);
        const estatura = parseInt(vf_estatura_cm);
        const cintura = parseFloat(vf_medida_cintura);
        const pecho = vf_medida_pecho ? parseFloat(vf_medida_pecho) : null;
        const cadera = vf_medida_cadera ? parseFloat(vf_medida_cadera) : null;

        if (peso < 20 || peso > 300) {
            return res.status(400).json({ ok: false, message: 'El peso debe estar entre 20 y 300 kg' });
        }
        if (estatura < 50 || estatura > 250) {
            return res.status(400).json({ ok: false, message: 'La estatura debe estar entre 50 y 250 cm' });
        }
        if (cintura < 30 || cintura > 200) {
            return res.status(400).json({ ok: false, message: 'La medida de cintura debe estar entre 30 y 200 cm' });
        }
        if (pecho && (pecho < 30 || pecho > 200)) {
            return res.status(400).json({ ok: false, message: 'La medida de pecho debe estar entre 30 y 200 cm' });
        }
        if (cadera && (cadera < 30 || cadera > 200)) {
            return res.status(400).json({ ok: false, message: 'La medida de cadera debe estar entre 30 y 200 cm' });
        }

        let fechaRegistro = vf_fecha_registro || new Date().toISOString().split('T')[0];
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaRegistro)) {
            return res.status(400).json({ ok: false, message: 'La fecha de registro debe tener formato YYYY-MM-DD' });
        }

        const valoracionActualizada = await ValoracionFisicaModel.update(id, {
            vf_peso_kg: peso,
            vf_estatura_cm: estatura,
            vf_medida_pecho: pecho,
            vf_medida_cintura: cintura,
            vf_medida_cadera: cadera,
            vf_observaciones: vf_observaciones?.trim() || null,
            vf_fecha_registro: fechaRegistro
        });

        if (!valoracionActualizada) {
            return res.status(404).json({ ok: false, message: 'Valoración física no encontrada' });
        }

        return res.json({
            ok: true,
            message: 'Valoración física actualizada correctamente',
            valoracion: valoracionActualizada
        });
    } catch (error) {
        console.error('Error al actualizar valoración física:', error);
        return res.status(500).json({ ok: false, message: error.message || 'Error al actualizar valoración física', error: error.message });
    }
};

export const deleteValoracion = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminada = await ValoracionFisicaModel.delete(id);
        if (!eliminada) {
            return res.status(404).json({ ok: false, message: 'Valoración física no encontrada' });
        }
        return res.json({ ok: true, message: 'Valoración física eliminada correctamente', id });
    } catch (error) {
        console.error('Error al eliminar valoración física:', error);
        return res.status(500).json({ ok: false, message: 'Error al eliminar valoración física', error: error.message });
    }
};

// Endpoint para calcular porcentaje de grasa en el frontend (previsualización)
// Usa u_genero del usuario autenticado o pasado por body
export const calcularPorcentajeGrasa = async (req, res) => {
    try {
        const { userId, estatura_cm, medida_cintura } = req.body;

        if (!userId) {
            return res.status(400).json({ ok: false, message: 'userId es requerido para obtener el género del usuario' });
        }
        if (!estatura_cm || isNaN(parseInt(estatura_cm))) {
            return res.status(400).json({ ok: false, message: 'Estatura requerida (entero en cm)' });
        }
        if (!medida_cintura || isNaN(parseFloat(medida_cintura))) {
            return res.status(400).json({ ok: false, message: 'Medida de cintura requerida (numérico)' });
        }

        const genero = await ValoracionFisicaModel.getUserGenero(userId);
        if (!genero) {
            return res.status(400).json({ ok: false, message: 'El usuario no tiene género definido (u_genero)' });
        }

        const porcentaje = ValoracionFisicaModel.calcularPorcentajeGrasa({
            genero,
            estaturaCm: parseInt(estatura_cm),
            medidaCintura: parseFloat(medida_cintura)
        });

        if (porcentaje === null) {
            return res.status(400).json({ ok: false, message: 'No se pudo calcular el porcentaje. Verifique las medidas.' });
        }

        return res.json({ ok: true, porcentaje_grasa: porcentaje, genero });
    } catch (error) {
        console.error('Error al calcular porcentaje de grasa:', error);
        return res.status(500).json({ ok: false, message: 'Error al calcular porcentaje de grasa', error: error.message });
    }
};