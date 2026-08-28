import { EventoModel } from '../models/evento.model.js';

export const getEventos = async (req, res) => {
    try {
        const eventos = await EventoModel.getAll();
        return res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return res.status(500).json({ message: 'Error al obtener los eventos', error: error.message });
    }
};

export const getEventosFuturos = async (req, res) => {
    try {
        const eventos = await EventoModel.getFuturos();
        return res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos futuros:', error);
        return res.status(500).json({ message: 'Error al obtener los eventos futuros', error: error.message });
    }
};

export const getEventoById = async (req, res) => {
    const { id } = req.params;
    try {
        const evento = await EventoModel.getById(id);
        if (!evento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        return res.json(evento);
    } catch (error) {
        console.error('Error al obtener evento por ID:', error);
        return res.status(500).json({ message: 'Error al obtener el evento', error: error.message });
    }
};

export const createEvento = async (req, res) => {
    try {
        const { ev_u_id, ev_nombre, ev_descripcion, ev_fecha_hora } = req.body;
        
        if (!ev_nombre || !ev_fecha_hora) {
            return res.status(400).json({ message: 'El nombre y la fecha/hora del evento son obligatorios.' });
        }

        // Usar el usuario autenticado si no se proporciona ev_u_id
        const userId = ev_u_id || req.user?.u_id;
        if (!userId) {
            return res.status(400).json({ message: 'Usuario no autenticado' });
        }

        const newEvento = await EventoModel.create({
            ev_u_id: userId,
            ev_nombre,
            ev_descripcion,
            ev_fecha_hora
        });
        
        return res.status(201).json(newEvento);
    } catch (error) {
        console.error('Error al crear evento:', error);
        return res.status(500).json({ message: 'Error al crear el evento', error: error.message });
    }
};

export const updateEvento = async (req, res) => {
    const { id } = req.params;
    try {
        const { ev_nombre, ev_descripcion, ev_fecha_hora } = req.body;
        
        if (!ev_nombre || !ev_fecha_hora) {
            return res.status(400).json({ message: 'El nombre y la fecha/hora del evento son obligatorios.' });
        }

        const updatedEvento = await EventoModel.update(id, {
            ev_nombre,
            ev_descripcion,
            ev_fecha_hora
        });
        
        if (!updatedEvento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        
        return res.json(updatedEvento);
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        return res.status(500).json({ message: 'Error al actualizar el evento', error: error.message });
    }
};

export const deleteEvento = async (req, res) => {
    const { id } = req.params;
    try {
        await EventoModel.delete(id);
        return res.json({ message: 'Evento eliminado correctamente', id });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        return res.status(500).json({ message: 'Error al eliminar el evento', error: error.message });
    }
};