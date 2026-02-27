import { prisma } from '../config/prisma.js';

const getClientes = async (req, res) => {
    try {
        const clientes = await prisma.clientes.findMany({
            where: {},
            include: {
                disciplinas: true,
                profesores: true,
                pagos: true
            }
        });
        res.json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los clientes' });
    }
};

const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await prisma.clientes.findUnique({
            where: { id_cliente: parseInt(id) },
            include: {
                disciplinas: true,
                profesores: true,
                pagos: true
            }
        });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el cliente' });
    }
};

const createCliente = async (req, res) => {
    try {
        const { nombre, apellido, dni, fecha_nacimiento, grupo_sanguineo, id_disciplina, id_profesor_que_cargo } = req.body;

        if (!nombre || !apellido || !id_disciplina) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const cliente = await prisma.clientes.create({
            data: {
                nombre,
                apellido,
                dni,
                fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
                grupo_sanguineo,
                id_disciplina,
                id_profesor_que_cargo: id_profesor_que_cargo ? parseInt(id_profesor_que_cargo) : null,
                activo: true
            },
            include: {
                disciplinas: true,
                profesores: true
            }
        });

        res.status(201).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
};

const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, fecha_nacimiento, grupo_sanguineo, id_disciplina, id_profesor_que_cargo, activo, fecha_ultimo_pago } = req.body;

        const cliente = await prisma.clientes.findUnique({
            where: { id_cliente: parseInt(id) }
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const clienteActualizado = await prisma.clientes.update({
            where: { id_cliente: parseInt(id) },
            data: {
                ...(nombre && { nombre }),
                ...(apellido && { apellido }),
                ...(dni && { dni }),
                ...(fecha_nacimiento && { fecha_nacimiento: new Date(fecha_nacimiento) }),
                ...(grupo_sanguineo && { grupo_sanguineo }),
                ...(id_disciplina && { id_disciplina }),
                ...(id_profesor_que_cargo && { id_profesor_que_cargo: parseInt(id_profesor_que_cargo) }),
                ...(activo !== undefined && { activo }),
                // Allow setting fecha_ultimo_pago to a date or null explicitly
                ...(fecha_ultimo_pago !== undefined && {
                    fecha_ultimo_pago: fecha_ultimo_pago ? new Date(fecha_ultimo_pago) : null
                }),
            },
            include: {
                disciplinas: true,
                profesores: true
            }
        });

        res.json(clienteActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};


const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const clienteId = parseInt(id);

        const cliente = await prisma.clientes.findUnique({
            where: { id_cliente: clienteId }
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Hard delete: first remove related pagos (FK NoAction constraint), then delete cliente
        await prisma.pagos.deleteMany({
            where: { id_cliente: clienteId }
        });

        await prisma.clientes.delete({
            where: { id_cliente: clienteId }
        });

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
};

export {
    getClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
};

