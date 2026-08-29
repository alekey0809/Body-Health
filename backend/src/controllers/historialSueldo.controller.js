import { HistorialSueldoModel } from '../models/historialSueldo.model.js';

export const getHistorialSueldos = async (req, res) => {
    try {
        const historial = await HistorialSueldoModel.getAll();
        return res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial de sueldos:', error.message);
        return res.status(500).json({ message: 'Error al obtener historial de sueldos', error: error.message });
    }
};

export const getResumenSueldosEntrenadores = async (req, res) => {
    try {
        const resumen = await HistorialSueldoModel.getResumenPorEntrenador();
        return res.json(resumen);
    } catch (error) {
        console.error('Error al obtener resumen de sueldos:', error.message);
        return res.status(500).json({ message: 'Error al obtener resumen de sueldos', error: error.message });
    }
};

export const getHistorialSueldoByTrainer = async (req, res) => {
    const { en_u_id } = req.params;
    try {
        const historial = await HistorialSueldoModel.getByTrainer(en_u_id);
        return res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial de sueldo por entrenador:', error.message);
        return res.status(500).json({ message: 'Error al obtener historial de sueldo', error: error.message });
    }
};

export const createHistorialSueldo = async (req, res) => {
    try {
        const { hs_en_u_id, hs_monto_pagado, hs_fecha_pago, hs_periodo_correspondiente } = req.body;
        if (!hs_en_u_id || !hs_monto_pagado || !hs_fecha_pago || !hs_periodo_correspondiente) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        const nuevo = await HistorialSueldoModel.create({ hs_en_u_id, hs_monto_pagado, hs_fecha_pago, hs_periodo_correspondiente });
        return res.status(201).json(nuevo);
    } catch (error) {
        console.error('Error al crear registro de sueldo:', error.message);
        return res.status(500).json({ message: 'Error al registrar pago de sueldo', error: error.message });
    }
};

export const updateHistorialSueldo = async (req, res) => {
    const { id } = req.params;
    try {
        const { hs_monto_pagado, hs_fecha_pago, hs_periodo_correspondiente } = req.body;
        const actualizado = await HistorialSueldoModel.update(id, { hs_monto_pagado, hs_fecha_pago, hs_periodo_correspondiente });
        if (!actualizado) {
            return res.status(404).json({ message: 'Registro de sueldo no encontrado' });
        }
        return res.json(actualizado);
    } catch (error) {
        console.error('Error al actualizar registro de sueldo:', error.message);
        return res.status(500).json({ message: 'Error al actualizar registro de sueldo', error: error.message });
    }
};

export const deleteHistorialSueldo = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminado = await HistorialSueldoModel.delete(id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Registro de sueldo no encontrado' });
        }
        return res.json({ message: 'Registro de sueldo eliminado correctamente', id });
    } catch (error) {
        console.error('Error al eliminar registro de sueldo:', error.message);
        return res.status(500).json({ message: 'Error al eliminar registro de sueldo', error: error.message });
    }
};