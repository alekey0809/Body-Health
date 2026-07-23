import { PlanModel } from '../models/plan.model.js';

// Fallback por si la base de datos no tiene registros cargados aún
const defaultPlanes = [
    { pe_id: 1, pe_nombre: 'Mensual', pe_duracion_dias: 30, pe_precio_base: 45.00, pe_eg_id: 1 },
    { pe_id: 2, pe_nombre: 'Trimestral', pe_duracion_dias: 90, pe_precio_base: 120.00, pe_eg_id: 1 },
    { pe_id: 3, pe_nombre: 'Semestral', pe_duracion_dias: 180, pe_precio_base: 210.00, pe_eg_id: 1 },
    { pe_id: 4, pe_nombre: 'Anual', pe_duracion_dias: 365, pe_precio_base: 380.00, pe_eg_id: 1 }
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
        const { pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id } = req.body;
        const newPlan = await PlanModel.create({ pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id });
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el plan', error: error.message });
    }
};

export const updatePlan = async (req, res) => {
    const { id } = req.params;
    try {
        const { pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id } = req.body;
        const updatedPlan = await PlanModel.update(id, { pe_nombre, pe_duracion_dias, pe_precio_base, pe_eg_id });
        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plan', error: error.message });
    }
};

export const deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        await PlanModel.delete(id);
        res.json({ message: 'Plan eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plan', error: error.message });
    }
};
