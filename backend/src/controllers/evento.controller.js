import { EventoModel } from '../models/evento.model.js';
// Expresión regular para verificar UUID v4 o UUID estándar RFC4122
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * GET /api/eventos
 * Solución al Error 500
 */
export const getEventos = async (req, res) => {
    try {
        const eventos = await EventoModel.getAll();
        return res.status(200).json(eventos);
    } catch (error) {
        console.error('================ ERROR 500 EN GET /api/eventos ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('===============================================================');
        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar los eventos en la base de datos.', 
            error: error.message 
        });
    }
};
/**
 * GET /api/eventos/futuros
 */
export const getEventosFuturos = async (req, res) => {
    try {
        const eventos = await EventoModel.getFuturos();
        return res.status(200).json(eventos);
    } catch (error) {
        console.error('================ ERROR 500 EN GET /api/eventos/futuros ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('=======================================================================');
        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar los eventos futuros.', 
            error: error.message 
        });
    }
};
/**
 * GET /api/eventos/:id
 */
export const getEventoById = async (req, res) => {
    const { id } = req.params;
    const ev_id = Number(id);
    if (!Number.isInteger(ev_id) || ev_id <= 0) {
        return res.status(400).json({ 
            message: 'El parametro id debe ser un numero entero valido (serial).' 
        });
    }
    try {
        const evento = await EventoModel.getById(ev_id);
        if (!evento) {
            return res.status(404).json({ message: `No se encontro el evento con ID ${ev_id}.` });
        }
        return res.status(200).json(evento);
    } catch (error) {
        console.error('================ ERROR 500 EN GET /api/eventos/:id ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('====================================================================');
        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar el evento.', 
            error: error.message 
        });
    }
};
/**
 * POST /api/eventos
 * Solución al Error 400
 */
export const createEvento = async (req, res) => {
    try {
        const { ev_nombre, ev_descripcion, ev_fecha_hora, ev_u_id } = req.body;
        const errors = [];
        // 1. Validar ev_nombre (varchar 50, obligatorio)
        if (!ev_nombre || typeof ev_nombre !== 'string' || ev_nombre.trim() === '') {
            errors.push('El campo ev_nombre es obligatorio y no puede estar vacio.');
        } else if (ev_nombre.trim().length > 150) {
            errors.push('El campo ev_nombre no debe exceder los 150 caracteres.');
        }
        // 2. Validar ev_descripcion (text, opcional)
        if (ev_descripcion !== undefined && ev_descripcion !== null && typeof ev_descripcion !== 'string') {
            errors.push('El campo ev_descripcion debe ser una cadena de texto valida.');
        }
        // 3. Validar ev_fecha_hora (timestamp, obligatorio)
        if (!ev_fecha_hora || isNaN(Date.parse(ev_fecha_hora))) {
            errors.push('El campo ev_fecha_hora es obligatorio y debe tener un formato de fecha valido (ISO 8601).');
        }
        // 4. Validar ev_u_id (uuid FK -> usuario.u_id, obligatorio)
        const userId = ev_u_id || req.user?.u_id || req.user?.id;
        if (!userId || typeof userId !== 'string' || !UUID_REGEX.test(userId.trim())) {
            errors.push('El campo ev_u_id es obligatorio y debe ser un UUID valido (ej: 123e4567-e89b-12d3-a456-426614174000).');
        }
        // Si existen fallas en los datos, responder HTTP 400 Bad Request
        if (errors.length > 0) {
            return res.status(400).json({ 
                message: 'Error de validacion en los datos enviados (400 Bad Request)', 
                errors 
            });
        }
        const newEvento = await EventoModel.create({
            ev_nombre: ev_nombre.trim(),
            ev_descripcion: ev_descripcion ? ev_descripcion.trim() : null,
            ev_fecha_hora,
            ev_u_id: userId.trim()
        });
        return res.status(201).json({
            message: 'Evento creado exitosamente',
            evento: newEvento
        });
    } catch (error) {
        console.error('================ ERROR 500 EN POST /api/eventos ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('================================================================');
        return res.status(500).json({ 
            message: 'Error interno del servidor al registrar el evento.', 
            error: error.message 
        });
    }
};
/**
 * PUT /api/eventos/:id
 */
export const updateEvento = async (req, res) => {
    const { id } = req.params;
    const ev_id = Number(id);
    if (!Number.isInteger(ev_id) || ev_id <= 0) {
        return res.status(400).json({ message: 'El parametro id debe ser un numero entero valido.' });
    }
    try {
        const { ev_nombre, ev_descripcion, ev_fecha_hora } = req.body;
        const errors = [];
        if (!ev_nombre || typeof ev_nombre !== 'string' || ev_nombre.trim() === '') {
            errors.push('El campo ev_nombre es obligatorio.');
        }
        if (!ev_fecha_hora || isNaN(Date.parse(ev_fecha_hora))) {
            errors.push('El campo ev_fecha_hora es obligatorio y debe tener una fecha valida.');
        }
        if (errors.length > 0) {
            return res.status(400).json({ message: 'Error de validacion', errors });
        }
        const existingEvento = await EventoModel.getById(ev_id);
        if (!existingEvento) {
            return res.status(404).json({ message: `No existe el evento con ID ${ev_id}.` });
        }
        const updatedEvento = await EventoModel.update(ev_id, {
            ev_nombre: ev_nombre.trim(),
            ev_descripcion: ev_descripcion ? ev_descripcion.trim() : null,
            ev_fecha_hora
        });
        return res.status(200).json({
            message: 'Evento actualizado exitosamente',
            evento: updatedEvento
        });
    } catch (error) {
        console.error('================ ERROR 500 EN PUT /api/eventos/:id ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('===================================================================');
        return res.status(500).json({ 
            message: 'Error interno del servidor al actualizar el evento.', 
            error: error.message 
        });
    }
};
/**
 * DELETE /api/eventos/:id
 */
export const deleteEvento = async (req, res) => {
    const { id } = req.params;
    const ev_id = Number(id);
    if (!Number.isInteger(ev_id) || ev_id <= 0) {
        return res.status(400).json({ message: 'El parametro id debe ser un numero entero valido.' });
    }
    try {
        const existingEvento = await EventoModel.getById(ev_id);
        if (!existingEvento) {
            return res.status(404).json({ message: `No existe el evento con ID ${ev_id}.` });
        }
        await EventoModel.delete(ev_id);
        return res.status(200).json({ message: 'Evento eliminado exitosamente', ev_id });
    } catch (error) {
        console.error('================ ERROR 500 EN DELETE /api/eventos/:id ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('======================================================================');
        return res.status(500).json({ 
            message: 'Error interno del servidor al eliminar el evento.', 
            error: error.message 
        });
    }
};