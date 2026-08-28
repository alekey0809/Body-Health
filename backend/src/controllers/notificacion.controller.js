import { NotificacionModel } from '../models/notificacion.model.js';

export const getNotificaciones = async (req, res) => {
    try {
        const userId = req.user?.u_id;
        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const { soloNoLeidas, tipo, limit } = req.query;
        
        const notificaciones = await NotificacionModel.getByUsuario(userId, {
            soloNoLeidas: soloNoLeidas === 'true',
            tipo: tipo || null,
            limit: parseInt(limit) || 50
        });

        return res.json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
};

export const getNotificacionById = async (req, res) => {
    const { id } = req.params;
    try {
        const notificacion = await NotificacionModel.getById(id);
        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        
        // Verificar que la notificación pertenece al usuario
        if (notificacion.n_u_id !== req.user?.u_id) {
            return res.status(403).json({ message: 'No autorizado' });
        }
        
        return res.json(notificacion);
    } catch (error) {
        console.error('Error al obtener notificación:', error);
        return res.status(500).json({ message: 'Error al obtener la notificación', error: error.message });
    }
};

export const marcarLeida = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar que la notificación pertenece al usuario
        const notificacion = await NotificacionModel.getById(id);
        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        
        if (notificacion.n_u_id !== req.user?.u_id) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const result = await NotificacionModel.marcarLeida(id);
        return res.json(result);
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        return res.status(500).json({ message: 'Error al actualizar notificación', error: error.message });
    }
};

export const marcarTodasLeidas = async (req, res) => {
    try {
        const userId = req.user?.u_id;
        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const result = await NotificacionModel.marcarTodasLeidas(userId);
        return res.json({ message: 'Todas las notificaciones marcadas como leídas', count: result.length });
    } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
        return res.status(500).json({ message: 'Error al actualizar notificaciones', error: error.message });
    }
};

export const deleteNotificacion = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar que la notificación pertenece al usuario
        const notificacion = await NotificacionModel.getById(id);
        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        
        if (notificacion.n_u_id !== req.user?.u_id) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        await NotificacionModel.delete(id);
        return res.json({ message: 'Notificación eliminada correctamente', id });
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        return res.status(500).json({ message: 'Error al eliminar la notificación', error: error.message });
    }
};

export const getNoLeidasCount = async (req, res) => {
    try {
        const userId = req.user?.u_id;
        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const count = await NotificacionModel.contarNoLeidas(userId);
        return res.json({ count });
    } catch (error) {
        console.error('Error al contar no leídas:', error);
        return res.status(500).json({ message: 'Error al contar notificaciones', error: error.message });
    }
};

// Endpoint para trigger manual de verificación de alertas de membresía (admin)
export const verificarAlertasMembresia = async (req, res) => {
    try {
        const count = await NotificacionModel.verificarAlertasMembresia();
        return res.json({ message: 'Verificación completada', alertasCreadas: count });
    } catch (error) {
        console.error('Error al verificar alertas de membresía:', error);
        return res.status(500).json({ message: 'Error al verificar alertas', error: error.message });
    }
};