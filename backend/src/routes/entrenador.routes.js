import { Router } from 'express';
import {
    getEntrenadores,
    getEntrenadorById,
    createEntrenador,
    updateEntrenador,
    deleteEntrenador
} from '../controllers/entrenador.controller.js';

const router = Router();

router.get('/', getEntrenadores);
router.get('/:id', getEntrenadorById);
router.post('/', createEntrenador);
router.put('/:id', updateEntrenador);
router.delete('/:id', deleteEntrenador);

export default router;
