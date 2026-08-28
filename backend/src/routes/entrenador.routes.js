import { Router } from 'express';
import {
    getEntrenadores,
    getAvailableUsersForTrainer,
    getEntrenadorById,
    createEntrenador,
    updateEntrenador,
    deleteEntrenador,
    getSalarioHistorial
} from '../controllers/entrenador.controller.js';

const router = Router();

router.get('/', getEntrenadores);
router.get('/disponibles', getAvailableUsersForTrainer);
router.get('/salario-historial', getSalarioHistorial);
router.get('/:id', getEntrenadorById);
router.post('/', createEntrenador);
router.put('/:id', updateEntrenador);
router.delete('/:id', deleteEntrenador);

export default router;
