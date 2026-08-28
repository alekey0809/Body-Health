import { Router } from 'express';
import {
    getHistorialSueldos,
    getResumenSueldosEntrenadores,
    getHistorialSueldoByTrainer,
    createHistorialSueldo,
    updateHistorialSueldo,
    deleteHistorialSueldo
} from '../controllers/historialSueldo.controller.js';

const router = Router();

router.get('/', getHistorialSueldos);
router.get('/resumen', getResumenSueldosEntrenadores);
router.get('/entrenador/:en_u_id', getHistorialSueldoByTrainer);
router.post('/', createHistorialSueldo);
router.put('/:id', updateHistorialSueldo);
router.delete('/:id', deleteHistorialSueldo);

export default router;