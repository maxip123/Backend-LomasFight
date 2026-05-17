import { prisma } from '../config/prisma.js';

const getClientes = async (req, res) => {
    try {
        const { id_profesor } = req.query;
        const whereClause = { activo: true };
        
        // Si se pasa id_profesor, filtrar alumnos por profesor
        if (id_profesor) {
            whereClause.id_profesor_que_cargo = parseInt(id_profesor);
        }

        const clientes = await prisma.clientes.findMany({
            where: whereClause,
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
        const { nombre, apellido, dni, fecha_nacimiento, grupo_sanguineo, domicilio, id_disciplina, id_profesor_que_cargo } = req.body;

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
                domicilio: domicilio || null,
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
        const { nombre, apellido, dni, fecha_nacimiento, grupo_sanguineo, domicilio, id_disciplina, id_profesor_que_cargo, activo, inactivo, fecha_ultimo_pago, fecha_vencimiento } = req.body;

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
                ...(domicilio !== undefined && { domicilio: domicilio || null }),
                ...(id_disciplina && { id_disciplina }),
                ...(id_profesor_que_cargo !== undefined && { id_profesor_que_cargo: id_profesor_que_cargo ? parseInt(id_profesor_que_cargo) : null }),
                ...(activo !== undefined && { activo }),
                ...(inactivo !== undefined && { inactivo }), // nuevo campo estado inactivo
                ...(fecha_ultimo_pago !== undefined && {
                    fecha_ultimo_pago: fecha_ultimo_pago ? new Date(fecha_ultimo_pago) : null
                }),
                ...(fecha_vencimiento !== undefined && {
                    fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null
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

        // Borrado lógico: activo=false, el cliente desaparece de la lista pero sus pagos se conservan
        await prisma.clientes.update({
            where: { id_cliente: clienteId },
            data: { activo: false }
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

