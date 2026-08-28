import { Router } from 'express';
import { 
    getNotificaciones, 
    getNotificacionById,
    marcarLeida,
    marcarTodasLeidas,
    deleteNotificacion,
    getNoLeidasCount,
    verificarAlertasMembresia
} from '../controllers/notificacion.controller.js';

const router = Router();

// Todas las rutas requieren autenticación (se valida en el middleware auth.middleware.js)
router.get('/', getNotificaciones);
router.get('/no-leidas/count', getNoLeidasCount);
router.get('/:id', getNotificacionById);
router.put('/:id/leer', marcarLeida);
router.put('/leer-todas', marcarTodasLeidas);
router.delete('/:id', deleteNotificacion);

// Admin: trigger manual para verificar alertas de membresía
router.post('/verificar-membresias', verificarAlertasMembresia);

export default router;