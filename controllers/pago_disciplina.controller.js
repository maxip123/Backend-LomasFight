import { prisma } from '../config/prisma.js';

const getPagos = async (req, res) => {
    try {
        const pagos = await prisma.pago_disciplina.findMany({
            where: { activo: true },
            include: {
                disciplinas: true
            }
        });
        res.json(pagos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los pagos de disciplinas' });
    }
};

const getPagoById = async (req, res) => {
    const { id } = req.params;
    try {
        const pago = await prisma.pago_disciplina.findUnique({
            where: { id_pago_disciplina: parseInt(id) },
            include: {
                disciplinas: true
            }
        });
        if (!pago || !pago.activo) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        res.json(pago);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el pago' });
    }
};

const createPago = async (req, res) => {
    try {
        const { id_disciplina, monto_cuota, periodo_pagado } = req.body;

        if (!id_disciplina || !monto_cuota) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const pago = await prisma.pago_disciplina.create({
            data: {
                id_disciplina: parseInt(id_disciplina),
                monto_cuota: parseFloat(monto_cuota),
                periodo_pagado: periodo_pagado ? new Date(periodo_pagado) : null,
                activo: true
            }
        });

        res.status(201).json(pago);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el pago' });
    }
};

const updatePago = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_disciplina, monto_cuota, periodo_pagado } = req.body;

        const pago = await prisma.pago_disciplina.findUnique({
            where: { id_pago_disciplina: parseInt(id) }
        });

        if (!pago || !pago.activo) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        const pagoActualizado = await prisma.pago_disciplina.update({
            where: { id_pago_disciplina: parseInt(id) },
            data: {
                ...(id_disciplina && { id_disciplina: parseInt(id_disciplina) }),
                ...(monto_cuota && { monto_cuota: parseFloat(monto_cuota) }),
                ...(periodo_pagado && { periodo_pagado: new Date(periodo_pagado) })
            }
        });

        res.json(pagoActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el pago' });
    }
};

const deletePago = async (req, res) => {
    try {
        const { id } = req.params;

        const pago = await prisma.pago_disciplina.findUnique({
            where: { id_pago_disciplina: parseInt(id) }
        });

        if (!pago || !pago.activo) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        const pagoEliminado = await prisma.pago_disciplina.update({
            where: { id_pago_disciplina: parseInt(id) },
            data: { activo: false }
        });

        res.json({ message: 'Pago eliminado correctamente', pago: pagoEliminado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el pago' });
    }
};

export {
    getPagos,
    getPagoById,
    createPago,
    updatePago,
    deletePago
};
