import { Router } from 'express';
import { 
    getValoracionesByUser, 
    getValoracionById, 
    createValoracion, 
    updateValoracion, 
    deleteValoracion,
    calcularPorcentajeGrasa
} from '../controllers/valoracionFisica.controller.js';

const router = Router();

// Rutas para valoraciones físicas por usuario
router.get('/usuario/:userId', getValoracionesByUser);
router.get('/:id', getValoracionById);
router.post('/', createValoracion);
router.put('/:id', updateValoracion);
router.delete('/:id', deleteValoracion);

// Endpoint para cálculo previo de porcentaje de grasa (usado en frontend)
router.post('/calcular-grasa', calcularPorcentajeGrasa);

export default router;