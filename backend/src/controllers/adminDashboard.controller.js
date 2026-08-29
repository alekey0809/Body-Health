import { UserModel } from '../models/user.model.js';
import { FacturaModel } from '../models/factura.model.js';
import { pool } from '../config/db.js';

export const getAdminDashboardKPIs = async (req, res) => {
    try {
        const now = new Date();
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(now.getDate() + 5);
        
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const fechaInicioMes = currentMonthStart.toISOString().split('T')[0];
        const fechaFinMes = currentMonthEnd.toISOString().split('T')[0];

        // 1. Socios Activos: Total actual (membresías vigentes)
        const sociosActivosQuery = `
            SELECT COUNT(DISTINCT m.m_u_id) as total
            FROM membresia m
            WHERE m.m_eg_id = 9 
            AND m.m_fecha_vencimiento >= CURRENT_DATE
        `;
        const { rows: sociosActivosResult } = await pool.query(sociosActivosQuery);
        const sociosActivos = parseInt(sociosActivosResult[0]?.total) || 0;

        // 2. Próximos a Vencer: Vencimientos en los próximos 5 días
        const proximosVencerQuery = `
            SELECT COUNT(DISTINCT m.m_u_id) as total
            FROM membresia m
            WHERE m.m_eg_id = 9 
            AND m.m_fecha_vencimiento > CURRENT_DATE
            AND m.m_fecha_vencimiento <= CURRENT_DATE + INTERVAL '5 days'
        `;
        const { rows: proximosVencerResult } = await pool.query(proximosVencerQuery);
        const proximosVencer = parseInt(proximosVencerResult[0]?.total) || 0;

        // 3. Socios Vencidos / En Mora: Membresías vencidas o facturas pendientes
        const sociosVencidosQuery = `
            SELECT COUNT(DISTINCT m.m_u_id) as total
            FROM membresia m
            WHERE m.m_eg_id != 9 
            OR m.m_fecha_vencimiento < CURRENT_DATE
        `;
        const { rows: sociosVencidosResult } = await pool.query(sociosVencidosQuery);
        const sociosVencidos = parseInt(sociosVencidosResult[0]?.total) || 0;

        // 4. Total Ventas del Mes: Ingresos consolidados del mes actual
        const resumenIngresos = await FacturaModel.getResumenIngresosPorFecha(fechaInicioMes, fechaFinMes);
        const totalVentasMes = parseFloat(resumenIngresos?.total_facturado) || 0;

        return res.json({
            ok: true,
            kpis: {
                sociosActivos,
                proximosVencer,
                sociosVencidos,
                totalVentasMes
            }
        });
    } catch (error) {
        console.error('[AdminDashboard] Error getting KPIs:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error al obtener KPIs del dashboard', 
            error: error.message 
        });
    }
};

// GET /api/admin-dashboard/asistencias-mensual - Asistencias por día del mes actual con horas pico
export const getAsistenciasMensual = async (req, res) => {
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const fechaInicio = monthStart.toISOString().split('T')[0];
        const fechaFin = monthEnd.toISOString().split('T')[0];

        // Asistencias por día y hora del mes
        const asistenciasPorDiaQuery = `
            SELECT 
                DATE(a_fecha_hora) as fecha,
                EXTRACT(HOUR FROM a_fecha_hora) as hora,
                COUNT(*) as total
            FROM asistencia
            WHERE a_fecha_hora::date BETWEEN $1 AND $2
            GROUP BY DATE(a_fecha_hora), EXTRACT(HOUR FROM a_fecha_hora)
            ORDER BY DATE(a_fecha_hora), EXTRACT(HOUR FROM a_fecha_hora)
        `;
        const { rows: asistenciasRaw } = await pool.query(asistenciasPorDiaQuery, [fechaInicio, fechaFin]);

        // Procesar: agrupar por día y por hora
        const porDia = {};
        const porHora = {};

        asistenciasRaw.forEach(row => {
            const fecha = row.fecha;
            const hora = parseInt(row.hora);
            
            // Por día
            if (!porDia[fecha]) {
                porDia[fecha] = { fecha, total: 0, horas: {} };
            }
            porDia[fecha].total++;
            porDia[fecha].horas[hora] = (porDia[fecha].horas[hora] || 0) + 1;

            // Por hora (global)
            porHora[hora] = (porHora[hora] || 0) + 1;
        });

        // Convertir a arrays ordenados
        const diasDelMes = [];
        const diasEnMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        for (let d = 1; d <= diasEnMes; d++) {
            const fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const diaData = porDia[fechaStr] || { fecha: fechaStr, total: 0, horas: {} };
            
            // Encontrar hora pico del día
            let horaPicoDia = null;
            let maxAsistenciasHora = 0;
            Object.entries(diaData.horas).forEach(([hora, count]) => {
                if (count > maxAsistenciasHora) {
                    maxAsistenciasHora = count;
                    horaPicoDia = parseInt(hora);
                }
            });

            diasDelMes.push({
                fecha: fechaStr,
                dia: d,
                total: diaData.total,
                horaPico: horaPicoDia,
                maxAsistenciasHora
            });
        }

        // Horas pico globales (top 5)
        const horasPicoGlobal = Object.entries(porHora)
            .map(([hora, total]) => ({ hora: parseInt(hora), total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // Promedio semanal
        const semanas = {};
        diasDelMes.forEach(dia => {
            const fecha = new Date(dia.fecha);
            const semanaNum = Math.ceil(fecha.getDate() / 7);
            if (!semanas[semanaNum]) semanas[semanaNum] = { semana: semanaNum, total: 0, dias: 0 };
            semanas[semanaNum].total += dia.total;
            semanas[semanaNum].dias++;
        });

        const resumenSemanal = Object.values(semanas).map(s => ({
            semana: s.semana,
            total: s.total,
            promedioDiario: s.dias > 0 ? Math.round(s.total / s.dias) : 0
        }));

        return res.json({
            ok: true,
            periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
            asistenciasPorDia: diasDelMes,
            horasPicoGlobal,
            resumenSemanal,
            totalMes: diasDelMes.reduce((sum, d) => sum + d.total, 0)
        });
    } catch (error) {
        console.error('[AdminDashboard] Error getting asistencias mensual:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error al obtener asistencias mensuales', 
            error: error.message 
        });
    }
};

// GET /api/admin-dashboard/ventas-por-plan - Ventas por tipo de plan del mes actual
export const getVentasPorPlan = async (req, res) => {
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const fechaInicio = monthStart.toISOString().split('T')[0];
        const fechaFin = monthEnd.toISOString().split('T')[0];

        const query = `
            SELECT 
                pe.pe_id,
                pe.pe_nombre,
                pe.pe_precio_base,
                COUNT(df.df_id) as cantidad_vendida,
                SUM(df.df_subtotal) as total_ingresos
            FROM detalle_factura df
            JOIN factura f ON df.f_id = f.f_id
            JOIN plan_entrenamiento pe ON df.pe_id = pe.pe_id
            WHERE f.f_fecha_hora::date BETWEEN $1 AND $2
            GROUP BY pe.pe_id, pe.pe_nombre, pe.pe_precio_base
            ORDER BY total_ingresos DESC
        `;
        const { rows } = await pool.query(query, [fechaInicio, fechaFin]);

        const totalGeneral = rows.reduce((sum, r) => sum + parseFloat(r.total_ingresos), 0);

        const datos = rows.map(row => ({
            planId: row.pe_id,
            nombre: row.pe_nombre,
            precioBase: parseFloat(row.pe_precio_base),
            cantidadVendida: parseInt(row.cantidad_vendida),
            totalIngresos: parseFloat(row.total_ingresos),
            porcentaje: totalGeneral > 0 ? Math.round((parseFloat(row.total_ingresos) / totalGeneral) * 100) : 0
        }));

        return res.json({
            ok: true,
            periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
            planes: datos,
            totalGeneral
        });
    } catch (error) {
        console.error('[AdminDashboard] Error getting ventas por plan:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error al obtener ventas por plan', 
            error: error.message 
        });
    }
};

// GET /api/admin-dashboard/socios-ausentes - Usuarios sin visitas en los últimos N días
export const getSociosAusentes = async (req, res) => {
    try {
        const diasAusencia = parseInt(req.query.dias) || 15;
        const limite = parseInt(req.query.limite) || 50;

        const query = `
            WITH ultimas_visitas AS (
                SELECT 
                    a_u_id,
                    MAX(a_fecha_hora) as ultima_visita
                FROM asistencia
                GROUP BY a_u_id
            ),
            socios_con_membresia AS (
                SELECT DISTINCT
                    m.m_u_id,
                    m.m_fecha_vencimiento,
                    m.m_eg_id
                FROM membresia m
                WHERE m.m_eg_id = 9
                AND m.m_fecha_vencimiento >= CURRENT_DATE
            )
            SELECT 
                u.u_id,
                u.u_nombres,
                u.u_apellidos,
                u.u_numero_documento,
                u.u_correo_electronico,
                u.u_numero_contacto,
                uv.ultima_visita,
                CURRENT_DATE - uv.ultima_visita::date as dias_sin_visita,
                scm.m_fecha_vencimiento
            FROM usuario u
            JOIN socios_con_membresia scm ON u.u_id = scm.m_u_id
            LEFT JOIN ultimas_visitas uv ON u.u_id = uv.a_u_id
            WHERE uv.ultima_visita IS NULL 
               OR uv.ultima_visita < CURRENT_DATE - INTERVAL '${diasAusencia} days'
            ORDER BY uv.ultima_visita ASC NULLS FIRST
            LIMIT $1
        `;
        const { rows } = await pool.query(query, [limite]);

        const socios = rows.map(row => ({
            id: row.u_id,
            nombre: `${row.u_nombres} ${row.u_apellidos}`,
            documento: row.u_numero_documento,
            correo: row.u_correo_electronico,
            telefono: row.u_numero_contacto,
            ultimaVisita: row.ultima_visita ? new Date(row.ultima_visita).toLocaleDateString('es-CO') : 'Nunca',
            diasSinVisita: row.ultima_visita ? parseInt(row.dias_sin_visita) : 999,
            fechaVencimiento: row.m_fecha_vencimiento ? new Date(row.m_fecha_vencimiento).toLocaleDateString('es-CO') : null,
            estadoVisita: row.ultima_visita ? 'Inactivo' : 'Sin visitas'
        }));

        return res.json({
            ok: true,
            criterio: `Sin visitas en los últimos ${diasAusencia} días`,
            total: socios.length,
            socios
        });
    } catch (error) {
        console.error('[AdminDashboard] Error getting socios ausentes:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error al obtener socios ausentes', 
            error: error.message 
        });
    }
};

// GET /api/admin-dashboard/pagos-pendientes - Socios en mora con pagos pendientes
export const getPagosPendientes = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 50;

        const query = `
            SELECT 
                f.f_id,
                f.f_valor_total,
                f.f_fecha_hora,
                f.f_ep_id,
                ep.ep_nombre AS estado_pago,
                u.u_id,
                u.u_nombres,
                u.u_apellidos,
                u.u_numero_documento,
                u.u_correo_electronico,
                u.u_numero_contacto,
                pe.pe_nombre,
                m.m_id as membresia_id,
                m.m_fecha_vencimiento,
                m.m_eg_id,
                eg.eg_nombre AS estado_membresia
            FROM factura f
            JOIN usuario u ON f.f_u_id = u.u_id
            JOIN detalle_factura df ON df.f_id = f.f_id
            JOIN plan_entrenamiento pe ON df.pe_id = pe.pe_id
            LEFT JOIN membresia m ON m.f_id = f.f_id
            LEFT JOIN estado_pago ep ON f.f_ep_id = ep.ep_id
            LEFT JOIN estado_general eg ON m.m_eg_id = eg.eg_id
            WHERE f.f_ep_id != 2
            AND (m.m_eg_id IS NULL OR m.m_eg_id != 9 OR m.m_fecha_vencimiento < CURRENT_DATE)
            ORDER BY f.f_fecha_hora DESC
            LIMIT $1
        `;
        const { rows } = await pool.query(query, [limite]);

        const pagos = rows.map(row => ({
            facturaId: row.f_id,
            fecha: new Date(row.f_fecha_hora).toLocaleDateString('es-CO'),
            valor: parseFloat(row.f_valor_total),
            estadoPago: row.estado_pago,
            socio: {
                id: row.u_id,
                nombre: `${row.u_nombres} ${row.u_apellidos}`,
                documento: row.u_numero_documento,
                correo: row.u_correo_electronico,
                telefono: row.u_numero_contacto
            },
            plan: row.pe_nombre,
            membresia: {
                id: row.membresia_id,
                fechaVencimiento: row.m_fecha_vencimiento ? new Date(row.m_fecha_vencimiento).toLocaleDateString('es-CO') : null,
                estado: row.estado_membresia
            },
            diasVencido: row.m_fecha_vencimiento && new Date(row.m_fecha_vencimiento) < new Date() 
                ? Math.ceil((new Date() - new Date(row.m_fecha_vencimiento)) / (1000 * 60 * 60 * 24))
                : 0
        }));

        const totalPendiente = pagos.reduce((sum, p) => sum + p.valor, 0);

        return res.json({
            ok: true,
            totalPendiente,
            cantidad: pagos.length,
            pagos
        });
    } catch (error) {
        console.error('[AdminDashboard] Error getting pagos pendientes:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error al obtener pagos pendientes', 
            error: error.message 
        });
    }
};