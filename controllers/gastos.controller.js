import { prisma } from '../config/prisma.js';

const getGastos = async (req, res) => {
    try {
        const gastos = await prisma.gastos.findMany({
            where: { activo: true },
            orderBy: { fecha_gasto: 'desc' }
        });
        res.json(gastos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos' });
    }
};

const getGastoById = async (req, res) => {
    const { id } = req.params;
    try {
        const gasto = await prisma.gastos.findUnique({
            where: { id_gasto: parseInt(id) }
        });
        if (!gasto || !gasto.activo) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        res.json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el gasto' });
    }
};

const createGasto = async (req, res) => {
    try {
        const { concepto, monto, fecha_gasto } = req.body;

        if (!concepto || !monto) {
            return res.status(400).json({ error: 'Faltan campos requeridos (concepto, monto)' });
        }

        const gasto = await prisma.gastos.create({
            data: {
                concepto,
                monto: parseFloat(monto),
                fecha_gasto: fecha_gasto ? new Date(fecha_gasto) : new Date(),
                activo: true
            }
        });

        res.status(201).json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el gasto' });
    }
};

const updateGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const { concepto, monto, fecha_gasto } = req.body;

        const gasto = await prisma.gastos.findUnique({
            where: { id_gasto: parseInt(id) }
        });

        if (!gasto || !gasto.activo) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }

        const gastoActualizado = await prisma.gastos.update({
            where: { id_gasto: parseInt(id) },
            data: {
                ...(concepto && { concepto }),
                ...(monto && { monto: parseFloat(monto) }),
                ...(fecha_gasto && { fecha_gasto: new Date(fecha_gasto) })
            }
        });

        res.json(gastoActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el gasto' });
    }
};

const deleteGasto = async (req, res) => {
    try {
        const { id } = req.params;

        const gasto = await prisma.gastos.findUnique({
            where: { id_gasto: parseInt(id) }
        });

        if (!gasto || !gasto.activo) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }

        // Borrado lógico
        await prisma.gastos.update({
            where: { id_gasto: parseInt(id) },
            data: { activo: false }
        });

        res.json({ message: 'Gasto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
};

export {
    getGastos,
    getGastoById,
    createGasto,
    updateGasto,
    deleteGasto
};
