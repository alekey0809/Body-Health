import { FacturaModel } from '../models/factura.model.js';
import { HistorialSueldoModel } from '../models/historialSueldo.model.js';

// GET /api/informes-financieros/resumen  → Resumen completo de ingresos, nómina y balance
export const getResumenFinanciero = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        console.log('[InformeFinanciero] Request params:', { fecha_inicio, fecha_fin });

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Parámetros fecha_inicio y fecha_fin son requeridos (formato: YYYY-MM-DD)' 
            });
        }

        // Validar formato de fecha
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
            });
        }

        // Obtener resumen de ingresos
        const resumenIngresos = await FacturaModel.getResumenIngresosPorFecha(fecha_inicio, fecha_fin);
        console.log('[InformeFinanciero] Resumen ingresos:', resumenIngresos);
        
        // Obtener resumen de nómina
        const resumenNomina = await HistorialSueldoModel.getResumenNominaPorFecha(fecha_inicio, fecha_fin);
        console.log('[InformeFinanciero] Resumen nómina:', resumenNomina);
        
        // Obtener desglose de nómina por entrenador
        const nominaPorEntrenador = await HistorialSueldoModel.getNominaPorEntrenadorPorFecha(fecha_inicio, fecha_fin);
        console.log('[InformeFinanciero] Desglose entrenadores:', nominaPorEntrenador.length, 'registros');

        // Valores seguros con fallback a 0
        const totalIngresos = parseFloat(resumenIngresos?.total_facturado) || 0;
        const totalPagado = parseFloat(resumenIngresos?.total_pagado) || 0;
        const totalPendiente = parseFloat(resumenIngresos?.total_pendiente) || 0;
        const totalNomina = parseFloat(resumenNomina?.total_nomina) || 0;
        const utilidadEstimada = totalIngresos - totalNomina;

        return res.json({
            ok: true,
            periodo: { fecha_inicio, fecha_fin },
            ingresos: {
                total_facturado: totalIngresos,
                total_pagado: totalPagado,
                total_pendiente: totalPendiente,
                cantidad_facturas: parseInt(resumenIngresos?.cantidad_facturas) || 0,
                facturas_pagadas: parseInt(resumenIngresos?.facturas_pagadas) || 0,
                facturas_pendientes: parseInt(resumenIngresos?.facturas_pendientes) || 0
            },
            nomina: {
                total_nomina: totalNomina,
                cantidad_pagos: parseInt(resumenNomina?.cantidad_pagos) || 0,
                entrenadores_pagados: parseInt(resumenNomina?.entrenadores_pagados) || 0,
                desglose_por_entrenador: nominaPorEntrenador || []
            },
            balance: {
                total_ingresos: totalIngresos,
                total_nomina: totalNomina,
                utilidad_estimada: utilidadEstimada
            }
        });
    } catch (error) {
        console.error('[InformeFinanciero] Error:', error);
        return res.status(500).json({ ok: false, message: 'Error al obtener resumen financiero', error: error.message });
    }
};

// GET /api/informes-financieros/ingresos/detalle  → Detalle de facturas para exportación
export const getDetalleIngresos = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        console.log('[InformeFinanciero] Detalle ingresos params:', { fecha_inicio, fecha_fin });

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Parámetros fecha_inicio y fecha_fin son requeridos' 
            });
        }

        const facturas = await FacturaModel.getFacturasPorFecha(fecha_inicio, fecha_fin);
        console.log('[InformeFinanciero] Detalle ingresos rows:', facturas?.length || 0);
        return res.json({ ok: true, facturas: facturas || [] });
    } catch (error) {
        console.error('[InformeFinanciero] Error detalle ingresos:', error);
        return res.status(500).json({ ok: false, message: 'Error al obtener detalle de ingresos', error: error.message });
    }
};

// GET /api/informes-financieros/nomina/detalle  → Detalle de nómina para exportación
export const getDetalleNomina = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        console.log('[InformeFinanciero] Detalle nómina params:', { fecha_inicio, fecha_fin });

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Parámetros fecha_inicio y fecha_fin son requeridos' 
            });
        }

        const nomina = await HistorialSueldoModel.getNominaPorFecha(fecha_inicio, fecha_fin);
        console.log('[InformeFinanciero] Detalle nómina rows:', nomina?.length || 0);
        return res.json({ ok: true, nomina: nomina || [] });
    } catch (error) {
        console.error('[InformeFinanciero] Error detalle nómina:', error);
        return res.status(500).json({ ok: false, message: 'Error al obtener detalle de nómina', error: error.message });
    }
};