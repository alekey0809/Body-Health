import { Router } from 'express';
import {
    getPagos,
    getPagoById,
    createPago,
    updatePago,
    deletePago
} from '../controllers/pago.controller.js';

const router = Router();

router.get('/', getPagos);
router.get('/:id', getPagoById);
router.post('/', createPago);
router.put('/:id', updatePago);
router.delete('/:id', deletePago);

export default router;
