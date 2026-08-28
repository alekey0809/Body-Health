import { EntrenadorModel } from '../models/entrenador.model.js';

export const getEntrenadores = async (req, res) => {
    try {
        const entrenadores = await EntrenadorModel.getAll();
        return res.json(entrenadores);
    } catch (error) {
        console.error('Error al obtener entrenadores:', error.message);
        return res.status(500).json({ message: 'Error al obtener entrenadores', error: error.message });
    }
};

export const getAvailableUsersForTrainer = async (req, res) => {
    try {
        const users = await EntrenadorModel.getAvailableUsersForTrainer();
        return res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios disponibles para entrenador:', error.message);
        return res.status(500).json({ message: 'Error al obtener usuarios disponibles', error: error.message });
    }
};

export const getEntrenadorById = async (req, res) => {
    const { id } = req.params;
    try {
        const entrenador = await EntrenadorModel.getById(id);
        if (!entrenador) {
            return res.status(404).json({ message: 'Entrenador no encontrado' });
        }
        return res.json(entrenador);
    } catch (error) {
        console.error('Error al obtener entrenador por ID:', error.message);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

export const createEntrenador = async (req, res) => {
    try {
        const { en_u_id, en_sueldo_base, en_horario_assigned, en_especialidad } = req.body;
        if (!en_u_id) {
            return res.status(400).json({ message: 'El en_u_id (ID de usuario) es obligatorio' });
        }
        const newEntrenador = await EntrenadorModel.create({ en_u_id, en_sueldo_base, en_horario_assigned, en_especialidad });
        return res.status(201).json(newEntrenador);
    } catch (error) {
        console.error('Error al crear entrenador:', error.message);
        return res.status(500).json({ message: 'Error al crear entrenador', error: error.message });
    }
};

export const updateEntrenador = async (req, res) => {
    const { id } = req.params;
    try {
        const { en_sueldo_base, en_horario_assigned, en_especialidad } = req.body;
        const updated = await EntrenadorModel.update(id, { en_sueldo_base, en_horario_assigned, en_especialidad });
        if (!updated) {
            return res.status(404).json({ message: 'Entrenador no encontrado' });
        }
        return res.json(updated);
    } catch (error) {
        console.error('Error al actualizar entrenador:', error.message);
        return res.status(500).json({ message: 'Error al actualizar entrenador', error: error.message });
    }
};

export const deleteEntrenador = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await EntrenadorModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Entrenador no encontrado' });
        }
        return res.json({ message: 'Entrenador eliminado correctamente', id });
    } catch (error) {
        console.error('Error al eliminar entrenador:', error.message);
        return res.status(500).json({ message: 'Error al eliminar entrenador', error: error.message });
    }
};

export const getSalarioHistorial = async (req, res) => {
    try {
        const historial = await EntrenadorModel.getSalarioHistorial();
        return res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial de sueldos:', error.message);
        return res.status(500).json({ message: 'Error al obtener historial de sueldos', error: error.message });
    }
};
