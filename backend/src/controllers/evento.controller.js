import { EventoModel } from '../models/evento.model.js';

/**
 * GET /api/eventos
 * Obtener todos los eventos de la tabla 'evento'
 */
export const getEventos = async (req, res) => {
    try {
        const eventos = await EventoModel.getAll();
        return res.status(200).json(eventos);
    } catch (error) {
        // Captura del stack trace completo en la consola para diagnóstico
        console.error('================ EXCEPCION 500 EN GET /api/eventos ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('===================================================================');

        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar los eventos en la base de datos.', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        console.error('================ EXCEPCION 500 EN GET /api/eventos/futuros ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('===========================================================================');

        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar los eventos futuros.', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        console.error('================ EXCEPCION 500 EN GET /api/eventos/:id ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('========================================================================');

        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar el evento.', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * POST /api/eventos
 */
export const createEvento = async (req, res) => {
    try {
        const { ev_nombre, ev_descripcion, ev_fecha_hora, ev_u_id } = req.body;
        const errors = [];

        if (!ev_nombre || typeof ev_nombre !== 'string' || ev_nombre.trim() === '') {
            errors.push('El campo ev_nombre es obligatorio.');
        }

        if (ev_descripcion !== undefined && ev_descripcion !== null && typeof ev_descripcion !== 'string') {
            errors.push('El campo ev_descripcion debe ser una cadena de texto.');
        }

        if (!ev_fecha_hora || isNaN(Date.parse(ev_fecha_hora))) {
            errors.push('El campo ev_fecha_hora es obligatorio y debe tener un formato ISO valido.');
        }

        const userId = ev_u_id || req.user?.u_id;
        if (!userId) {
            errors.push('El campo ev_u_id es obligatorio para registrar el autor.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ 
                message: 'Error de validación en los datos enviados', 
                errors 
            });
        }

        const newEvento = await EventoModel.create({
            ev_nombre: ev_nombre.trim(),
            ev_descripcion: ev_descripcion ? ev_descripcion.trim() : null,
            ev_fecha_hora,
            ev_u_id: userId
        });

        return res.status(201).json({
            message: 'Evento creado exitosamente',
            evento: newEvento
        });
    } catch (error) {
        console.error('================ EXCEPCION 500 EN POST /api/eventos ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('=====================================================================');

        return res.status(500).json({ 
            message: 'Error interno del servidor al registrar el evento.', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
            return res.status(400).json({ message: 'Error de validación', errors });
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
        console.error('================ EXCEPCION 500 EN PUT /api/eventos/:id ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('========================================================================');

        return res.status(500).json({ 
            message: 'Error interno del servidor al actualizar el evento.', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        console.error('================ EXCEPCION 500 EN DELETE /api/eventos/:id ================');
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('===========================================================================');

        return res.status(500).json({ 
            message: 'Error interno del servidor al eliminar el evento.', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};