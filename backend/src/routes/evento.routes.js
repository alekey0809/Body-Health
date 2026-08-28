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

router.get('/', getEventos);
router.get('/futuros', getEventosFuturos);
router.get('/:id', getEventoById);
router.post('/', createEvento);
router.put('/:id', updateEvento);
router.delete('/:id', deleteEvento);

export default router;