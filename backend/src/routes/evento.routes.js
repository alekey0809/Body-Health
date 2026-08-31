import { Router } from 'express';
import { 
    getEventos, 
    getEventosFuturos, 
    getEventoById, 
    createEvento, 
    updateEvento, 
    deleteEvento 
} from '../controllers/evento.controller.js';

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
 * @desc    Crear un nuevo evento
 * @body    { ev_nombre: string(50), ev_descripcion?: string, ev_fecha_hora: ISOString, ev_u_id: UUID }
 */
router.post('/', createEvento);

/**
 * @route   PUT /api/eventos/:id
 * @desc    Actualizar un evento existente por su ev_id
 */
router.put('/:id', updateEvento);

/**
 * @route   DELETE /api/eventos/:id
 * @desc    Eliminar un evento por su ev_id
 */
router.delete('/:id', deleteEvento);

export default router;