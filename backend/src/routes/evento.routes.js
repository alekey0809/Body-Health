import { Router } from 'express';
import { 
    getEventos, 
    getEventosFuturos, 
    getEventoById, 
    createEvento, 
    updateEvento, 
    deleteEvento 
} from '../controllers/evento.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/eventos
 * @desc    Obtener lista de todos los eventos
 */
router.get('/', getEventos);

/**
 * @route   GET /api/eventos/futuros
 * @desc    Obtener solo eventos donde ev_fecha_hora >= NOW()
 */
router.get('/futuros', getEventosFuturos);

/**
 * @route   GET /api/eventos/:id
 * @desc    Obtener un evento por su ev_id (serial)
 */
router.get('/:id', getEventoById);

/**
 * @route   POST /api/eventos
 * @desc    Crear un nuevo evento (Solo Admin)
 * @body    { ev_nombre: string(150), ev_descripcion?: string, ev_fecha_hora: ISOString, ev_u_id: UUID }
 */
router.post('/', verifyToken, verifyAdmin, createEvento);

/**
 * @route   PUT /api/eventos/:id
 * @desc    Actualizar un evento existente por su ev_id (Solo Admin)
 */
router.put('/:id', verifyToken, verifyAdmin, updateEvento);

/**
 * @route   DELETE /api/eventos/:id
 * @desc    Eliminar un evento por su ev_id (Solo Admin)
 */
router.delete('/:id', verifyToken, verifyAdmin, deleteEvento);

export default router;