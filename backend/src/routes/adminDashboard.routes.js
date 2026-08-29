import express from 'express';
import { getAdminDashboardKPIs, getAsistenciasMensual, getVentasPorPlan, getSociosAusentes, getPagosPendientes } from '../controllers/adminDashboard.controller.js';

const router = express.Router();

// GET /api/admin-dashboard/kpis → KPIs para el dashboard de admin
router.get('/kpis', getAdminDashboardKPIs);

// GET /api/admin-dashboard/asistencias-mensual → Asistencias mensuales con horas pico
router.get('/asistencias-mensual', getAsistenciasMensual);

// GET /api/admin-dashboard/ventas-por-plan → Ventas por tipo de plan
router.get('/ventas-por-plan', getVentasPorPlan);

// GET /api/admin-dashboard/socios-ausentes → Socios sin visitas en últimos N días
router.get('/socios-ausentes', getSociosAusentes);

// GET /api/admin-dashboard/pagos-pendientes → Socios con pagos pendientes/mora
router.get('/pagos-pendientes', getPagosPendientes);

export default router;