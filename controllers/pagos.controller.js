import { prisma } from '../config/prisma.js';

const getPagos = async (req, res) => {
    try {
        const pagos = await prisma.pagos.findMany({
            where: { activo: true },
            include: {
                clientes: true,
                disciplinas: true
            }
        });
        res.json(pagos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los pagos' });
    }
};

const getPagoById = async (req, res) => {   
    const { id } = req.params;
    try {
        const pago = await prisma.pagos.findUnique({
            where: { id_pago: parseInt(id) },
            include: {
                clientes: true,
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
        const { id_cliente, id_disciplina, monto } = req.body;
        
        if (!id_cliente || !id_disciplina || !monto) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const pago = await prisma.pagos.create({
            data: {
                id_cliente: parseInt(id_cliente),
                id_disciplina: parseInt(id_disciplina),
                monto: parseFloat(monto),
                fecha_pago: new Date(),
                activo: true
            },
            include: {
                clientes: true,
                disciplinas: true
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
        const { id_cliente, id_disciplina, monto, fecha_pago } = req.body;
        
        const pago = await prisma.pagos.findUnique({
            where: { id_pago: parseInt(id) }
        });
        
        if (!pago || !pago.activo) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        
        const pagoActualizado = await prisma.pagos.update({
            where: { id_pago: parseInt(id) },
            data: {
                ...(id_cliente && { id_cliente: parseInt(id_cliente) }),
                ...(id_disciplina && { id_disciplina: parseInt(id_disciplina) }),
                ...(monto && { monto: parseFloat(monto) }),
                ...(fecha_pago && { fecha_pago: new Date(fecha_pago) })
            },
            include: {
                clientes: true,
                disciplinas: true
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
        
        const pago = await prisma.pagos.findUnique({
            where: { id_pago: parseInt(id) }
        });
        
        if (!pago || !pago.activo) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        
        // Borrado lógico
        const pagoEliminado = await prisma.pagos.update({
            where: { id_pago: parseInt(id) },
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