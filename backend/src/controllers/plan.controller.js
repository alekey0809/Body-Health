import { PlanModel } from '../models/plan.model.js';
import { pool } from '../config/db.js';

// Fallback por si la base de datos no tiene registros cargados aún
const defaultPlanes = [
    { pe_id: 1, pe_nombre: 'Mensual', pe_precio_base: 45.00, pe_eg_id: 1 },
    { pe_id: 2, pe_nombre: 'Trimestral', pe_precio_base: 120.00, pe_eg_id: 1 },
    { pe_id: 3, pe_nombre: 'Semestral', pe_precio_base: 210.00, pe_eg_id: 1 },
    { pe_id: 4, pe_nombre: 'Anual', pe_precio_base: 380.00, pe_eg_id: 1 }
];

export const getPlanes = async (req, res) => {
    try {
        const planes = await PlanModel.getAll();
        if (planes && planes.length > 0) {
            return res.json(planes);
        }
        return res.json(defaultPlanes);
    } catch (error) {
        console.error('Error al obtener planes de la BD:', error.message);
        return res.json(defaultPlanes);
    }
};

export const getPlanById = async (req, res) => {
    const { id } = req.params;
    try {
        const plan = await PlanModel.getById(id);
        if (plan) {
            return res.json(plan);
        }
        const fallback = defaultPlanes.find(p => String(p.pe_id) === String(id)) || defaultPlanes[0];
        return res.json(fallback);
    } catch (error) {
        console.error('Error al obtener el plan por ID:', error.message);
        const fallback = defaultPlanes.find(p => String(p.pe_id) === String(id)) || defaultPlanes[0];
        return res.json(fallback);
    }
};

export const createPlan = async (req, res) => {
    try {
        const { pe_nombre, pe_precio_base, pe_eg_id } = req.body;
        const newPlan = await PlanModel.create({ pe_nombre, pe_precio_base, pe_eg_id });
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el plan', error: error.message });
    }
};

export const updatePlan = async (req, res) => {
    const { id } = req.params;
    try {
        const { pe_nombre, pe_precio_base, pe_eg_id } = req.body;
        const updatedPlan = await PlanModel.update(id, { pe_nombre, pe_precio_base, pe_eg_id });
        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plan', error: error.message });
    }
};

export const getMembresiasByPlan = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                m.m_id,
                m.m_u_id,
                m.m_fecha_inicio,
                m.m_fecha_vencimiento,
                m.m_eg_id,
                eg.eg_nombre AS estado_membresia,
                u.u_nombres,
                u.u_apellidos,
                u.u_numero_documento,
                CASE 
                    WHEN m.m_fecha_vencimiento >= CURRENT_DATE AND m.m_eg_id = 9 THEN true
                    ELSE false
                END AS es_vigente
            FROM membresia m
            JOIN usuario u ON m.m_u_id = u.u_id
            LEFT JOIN estado_general eg ON m.m_eg_id = eg.eg_id
            WHERE m.m_pe_id = $1
            ORDER BY m.m_fecha_inicio DESC
        `;
        const { rows } = await pool.query(query, [id]);
        
        const vigentes = rows.filter(m => m.es_vigente);
        const vencidas = rows.filter(m => !m.es_vigente);
        
        res.json({
            ok: true,
            total: rows.length,
            vigentes: vigentes.length,
            vencidas: vencidas.length,
            membresias: rows
        });
    } catch (error) {
        console.error('Error al obtener membresías del plan:', error.message);
        res.status(500).json({ ok: false, message: 'Error al obtener membresías del plan', error: error.message });
    }
};

export const deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        const checkQuery = 'SELECT COUNT(*) FROM membresia WHERE m_pe_id = $1';
        const { rows } = await pool.query(checkQuery, [id]);
        const count = parseInt(rows[0].count, 10);
        
        if (count > 0) {
            return res.status(400).json({ 
                ok: false, 
                message: `No se puede eliminar el plan. Tiene ${count} membresía(s) asociada(s). Elimine o reasigne las membresías primero.` 
            });
        }
        
        await PlanModel.delete(id);
        res.json({ message: 'Plan eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plan', error: error.message });
    }
};
