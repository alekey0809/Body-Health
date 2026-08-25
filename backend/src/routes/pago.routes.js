import { Router } from 'express';
import {
    getPagos,
    getPagoById,
    createPago,
    deletePago,
    getUserByCedula,
    getPlanes,
    updateEstadoPago
} from '../controllers/pago.controller.js';

const router = Router();

// Autocomplete: buscar usuario por cédula
router.get('/usuario/cedula/:cedula', getUserByCedula);

// Planes para el select dinámico
router.get('/planes', getPlanes);

// CRUD Pagos (Facturas)
router.get('/', getPagos);
router.get('/:id', getPagoById);
router.post('/', createPago);
router.delete('/:id', deletePago);
router.patch('/:id/estado', updateEstadoPago);

export default router;
