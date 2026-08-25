import { FacturaModel } from '../models/factura.model.js';

// GET /api/pagos/usuario/cedula/:cedula  → autocomplete por cédula
export const getUserByCedula = async (req, res) => {
    try {
        const user = await FacturaModel.findUserByCedula(req.params.cedula);
        if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        return res.json({ ok: true, user });
    } catch (error) {
        console.error('Error buscando usuario por cédula:', error.message);
        return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
    }
};

// GET /api/pagos/planes  → lista de planes para el select
export const getPlanes = async (req, res) => {
    try {
        const planes = await FacturaModel.getPlanes();
        return res.json(planes);
    } catch (error) {
        console.error('Error obteniendo planes:', error.message);
        return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
    }
};

// GET /api/pagos  → listado completo de pagos/facturas
export const getPagos = async (req, res) => {
    try {
        const pagos = await FacturaModel.getAll();
        return res.json(pagos);
    } catch (error) {
        console.error('Error al obtener pagos:', error.message);
        return res.status(500).json({ ok: false, message: 'Error al obtener pagos' });
    }
};

// GET /api/pagos/:id  → detalle de una factura
export const getPagoById = async (req, res) => {
    try {
        const pago = await FacturaModel.getById(req.params.id);
        if (!pago) return res.status(404).json({ ok: false, message: 'Pago no encontrado' });
        return res.json(pago);
    } catch (error) {
        console.error('Error al obtener pago:', error.message);
        return res.status(500).json({ ok: false, message: 'Error al obtener pago' });
    }
};

// POST /api/pagos  → registrar pago (factura + detalle_factura + membresia)
export const createPago = async (req, res) => {
    const { cedula, pe_id } = req.body;

    // Validar campos requeridos antes de tocar la BD
    if (!cedula || String(cedula).trim() === '') {
        return res.status(400).json({ ok: false, message: 'El campo cédula es requerido' });
    }
    const peIdInt = parseInt(pe_id, 10);
    if (!pe_id || isNaN(peIdInt)) {
        return res.status(400).json({ ok: false, message: 'El campo pe_id es requerido y debe ser un número válido' });
    }

    try {
        // 1. Buscar usuario por cédula
        const usuario = await FacturaModel.findUserByCedula(String(cedula).trim());
        if (!usuario) {
            return res.status(404).json({ ok: false, message: 'Usuario con esa cédula no encontrado' });
        }

        // 2. Obtener precio del plan (pe_precio_base llega como string desde pg → Number)
        const planes = await FacturaModel.getPlanes();
        const plan = planes.find(p => p.pe_id === peIdInt);
        if (!plan) {
            return res.status(404).json({ ok: false, message: 'Plan no encontrado' });
        }

        // 3. Registrar transacción completa
        const resultado = await FacturaModel.registrarPago({
            u_id: usuario.u_id,
            pe_id: plan.pe_id,
            precio_unitario: Number(plan.pe_precio_base)
        });

        return res.status(201).json({
            ok: true,
            message: 'Pago registrado correctamente',
            f_id: resultado.f_id,
            f_fecha_hora: resultado.f_fecha_hora,
            membresia: resultado.membresia
        });
    } catch (error) {
        console.error('Error al registrar pago:', error.message);
        return res.status(500).json({ ok: false, message: 'Error al registrar pago', error: error.message });
    }
};

// DELETE /api/pagos/:id  → eliminar factura en cascada
export const deletePago = async (req, res) => {
    try {
        const deleted = await FacturaModel.delete(req.params.id);
        if (!deleted) return res.status(404).json({ ok: false, message: 'Pago no encontrado' });
        return res.json({ ok: true, message: 'Pago eliminado correctamente', f_id: deleted.f_id });
    } catch (error) {
        console.error('Error al eliminar pago:', error.message);
        return res.status(500).json({ ok: false, message: 'Error al eliminar pago' });
    }
};

// PATCH /api/pagos/:id/estado  → actualizar estado de pago
export const updateEstadoPago = async (req, res) => {
    const { ep_id } = req.body;
    const { id } = req.params;

    if (!ep_id || isNaN(parseInt(ep_id, 10))) {
        return res.status(400).json({ ok: false, message: 'ep_id es requerido y debe ser un número' });
    }

    try {
        const updated = await FacturaModel.updateEstadoPago(parseInt(id, 10), parseInt(ep_id, 10));
        if (!updated) return res.status(404).json({ ok: false, message: 'Pago no encontrado' });
        return res.json({ ok: true, message: 'Estado actualizado', factura: updated });
    } catch (error) {
        console.error('Error al actualizar estado:', error.message);
        return res.status(500).json({ ok: false, message: 'Error al actualizar estado' });
    }
};
