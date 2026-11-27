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

const DIAS_CUOTA = 31;

const sumarDias = (fecha, dias) => {
    const d = new Date(fecha);
    d.setDate(d.getDate() + dias);
    return d;
};

// Mismo día calendario (fecha_ultimo_pago es DATE, fecha_pago es timestamp)
const mismoDia = (a, b) => !!a && !!b && new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);

/**
 * Recalcula fecha_ultimo_pago / fecha_vencimiento del alumno a partir de su pago activo más reciente.
 * Solo se aplica si el pago afectado era el que definía su último pago: así no se pisan
 * fechas cargadas a mano desde "Gestión de estados".
 */
const recalcularVencimiento = async (tx, idCliente, fechaPagoAfectado) => {
    const cliente = await tx.clientes.findUnique({ where: { id_cliente: idCliente } });
    if (!cliente || !mismoDia(cliente.fecha_ultimo_pago, fechaPagoAfectado)) return;

    const ultimo = await tx.pagos.findFirst({
        where: { id_cliente: idCliente, activo: true },
        orderBy: { fecha_pago: 'desc' }
    });

    await tx.clientes.update({
        where: { id_cliente: idCliente },
        data: ultimo
            ? { fecha_ultimo_pago: ultimo.fecha_pago, fecha_vencimiento: sumarDias(ultimo.fecha_pago, DIAS_CUOTA) }
            : { fecha_ultimo_pago: null, fecha_vencimiento: null }
    });
};

const createPago = async (req, res) => {
    try {
        const { id_cliente, id_disciplina, monto, fecha_pago } = req.body;

        if (!id_cliente || !id_disciplina || !monto) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const clienteId = parseInt(id_cliente);
        // Usar la fecha enviada desde el frontend; si no viene, usar ahora
        const fechaBase = fecha_pago ? new Date(fecha_pago) : new Date();
        if (isNaN(fechaBase.getTime())) {
            return res.status(400).json({ error: 'Fecha de pago inválida' });
        }

        const cliente = await prisma.clientes.findUnique({ where: { id_cliente: clienteId } });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Pago + actualización del alumno en una sola transacción (o se guardan ambos o ninguno)
        const pago = await prisma.$transaction(async (tx) => {
            const nuevo = await tx.pagos.create({
                data: {
                    id_cliente: clienteId,
                    id_disciplina: parseInt(id_disciplina),
                    monto: parseFloat(monto),
                    fecha_pago: fechaBase,
                    activo: true
                },
                include: {
                    clientes: true,
                    disciplinas: true
                }
            });

            // Un pago cargado con fecha anterior al último no acorta el vencimiento vigente
            const esElMasReciente = !cliente.fecha_ultimo_pago || fechaBase >= new Date(cliente.fecha_ultimo_pago);
            await tx.clientes.update({
                where: { id_cliente: clienteId },
                data: esElMasReciente
                    ? { fecha_ultimo_pago: fechaBase, fecha_vencimiento: sumarDias(fechaBase, DIAS_CUOTA), inactivo: false }
                    : { inactivo: false }
            });

            return nuevo;
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

        const pagoActualizado = await prisma.$transaction(async (tx) => {
            const actualizado = await tx.pagos.update({
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

            // Si cambió la fecha (o el alumno), ajustar vencimientos afectados
            const cambioFecha = fecha_pago && !mismoDia(pago.fecha_pago, actualizado.fecha_pago);
            const cambioCliente = actualizado.id_cliente !== pago.id_cliente;
            if (cambioFecha || cambioCliente) {
                await recalcularVencimiento(tx, pago.id_cliente, pago.fecha_pago);
                if (cambioCliente) {
                    await recalcularVencimiento(tx, actualizado.id_cliente, actualizado.fecha_pago);
                }
            }

            return actualizado;
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

        // Borrado lógico + recalcular el vencimiento del alumno si este era su último pago
        const pagoEliminado = await prisma.$transaction(async (tx) => {
            const eliminado = await tx.pagos.update({
                where: { id_pago: parseInt(id) },
                data: { activo: false }
            });
            await recalcularVencimiento(tx, pago.id_cliente, pago.fecha_pago);
            return eliminado;
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