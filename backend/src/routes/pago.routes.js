import { Router } from 'express';
import {
    getPagos,
    getPagoById,
    createPago,
    deletePago,
    getUserByCedula,
    getPlanes,
    updateEstadoPago,
    getMembresiasByUsuario
} from '../controllers/pago.controller.js';

const router = Router();

// Autocomplete: buscar usuario por cédula
router.get('/usuario/cedula/:cedula', getUserByCedula);

// Historial de membresías por usuario
router.get('/usuario/:u_id', getMembresiasByUsuario);

// Planes para el select dinámico
router.get('/planes', getPlanes);

// CRUD Pagos (Facturas)
router.get('/', getPagos);
router.get('/:id', getPagoById);
router.post('/', createPago);
router.delete('/:id', deletePago);
router.patch('/:id/estado', updateEstadoPago);

export default router;
