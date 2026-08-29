import { Router } from 'express';
import {
    getResumenFinanciero,
    getDetalleIngresos,
    getDetalleNomina
} from '../controllers/informeFinanciero.controller.js';

const router = Router();

// Resumen financiero completo (ingresos + nómina + balance)
router.get('/resumen', getResumenFinanciero);

// Detalle de ingresos (facturas) para exportación
router.get('/ingresos/detalle', getDetalleIngresos);

// Detalle de nómina para exportación
router.get('/nomina/detalle', getDetalleNomina);

export default router;