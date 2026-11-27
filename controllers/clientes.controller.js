import { prisma } from '../config/prisma.js';
import { isAdmin } from '../middleware/auth.middleware.js';

// Un profesor solo puede ver/modificar alumnos que tiene a cargo
const puedeGestionar = (req, cliente) =>
    isAdmin(req) || (req.user?.id_profesor != null && cliente.id_profesor_que_cargo === req.user.id_profesor);

const getClientes = async (req, res) => {
    try {
        const { id_profesor } = req.query;
        const whereClause = { activo: true };
        
        if (!isAdmin(req)) {
            // Profesor: siempre limitado a sus alumnos, ignorando el query param
            if (req.user?.id_profesor == null) return res.json([]);
            whereClause.id_profesor_que_cargo = req.user.id_profesor;
        } else if (id_profesor) {
            // Admin: filtro opcional por profesor
            whereClause.id_profesor_que_cargo = parseInt(id_profesor);
        }

        const clientes = await prisma.clientes.findMany({
            where: whereClause,
            include: {
                disciplinas: true,
                profesores: true,
                pagos: { where: { activo: true } }
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
                pagos: { where: { activo: true } }
            }
        });
        if (!cliente || !puedeGestionar(req, cliente)) {
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
        const {
            nombre,
            apellido,
            dni,
            fecha_nacimiento,
            grupo_sanguineo,
            domicilio,
            id_disciplina,
            id_profesor_que_cargo,
            numero_celular,
            numero_celular_emergencia,
            alergia_medicamento,
            tiempo_entrenamiento
        } = req.body;

        if (!nombre || !apellido || !id_disciplina) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Un profesor solo puede crear alumnos a su cargo
        let profesorACargo = id_profesor_que_cargo ? parseInt(id_profesor_que_cargo) : null;
        if (!isAdmin(req)) {
            if (req.user?.id_profesor == null) {
                return res.status(403).json({ error: 'Tu usuario no está vinculado a un profesor' });
            }
            profesorACargo = req.user.id_profesor;
        }

        const cliente = await prisma.clientes.create({
            data: {
                nombre,
                apellido,
                dni: dni || null,
                fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
                grupo_sanguineo: grupo_sanguineo || null,
                domicilio: domicilio || null,
                id_disciplina,
                id_profesor_que_cargo: profesorACargo,
                numero_celular: numero_celular || null,
                numero_celular_emergencia: numero_celular_emergencia || null,
                alergia_medicamento: alergia_medicamento || null,
                tiempo_entrenamiento: tiempo_entrenamiento || null,
                activo: true
            },
            include: {
                disciplinas: true,
                profesores: true
            }
        });

        res.status(201).json(cliente);
    } catch (error) {
        if (error?.code === 'P2002') {
            return res.status(409).json({ error: 'Ya existe un alumno con ese DNI (puede estar dado de baja)' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
};

const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            apellido,
            dni,
            fecha_nacimiento,
            grupo_sanguineo,
            domicilio,
            id_disciplina,
            id_profesor_que_cargo,
            activo,
            inactivo,
            fecha_ultimo_pago,
            fecha_vencimiento,
            numero_celular,
            numero_celular_emergencia,
            alergia_medicamento,
            tiempo_entrenamiento
        } = req.body;

        const cliente = await prisma.clientes.findUnique({
            where: { id_cliente: parseInt(id) }
        });

        if (!cliente || !puedeGestionar(req, cliente)) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Un profesor no puede reasignar el alumno a otro profesor
        const cambiaProfesor = isAdmin(req) && id_profesor_que_cargo !== undefined;

        const clienteActualizado = await prisma.clientes.update({
            where: { id_cliente: parseInt(id) },
            data: {
                ...(nombre && { nombre }),
                ...(apellido && { apellido }),
                ...(dni !== undefined && { dni: dni || null }),
                ...(fecha_nacimiento !== undefined && { fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null }),
                ...(grupo_sanguineo !== undefined && { grupo_sanguineo: grupo_sanguineo || null }),
                ...(domicilio !== undefined && { domicilio: domicilio || null }),
                ...(id_disciplina && { id_disciplina }),
                ...(cambiaProfesor && { id_profesor_que_cargo: id_profesor_que_cargo ? parseInt(id_profesor_que_cargo) : null }),
                ...(activo !== undefined && { activo }),
                ...(inactivo !== undefined && { inactivo }), // nuevo campo estado inactivo
                ...(fecha_ultimo_pago !== undefined && {
                    fecha_ultimo_pago: fecha_ultimo_pago ? new Date(fecha_ultimo_pago) : null
                }),
                ...(fecha_vencimiento !== undefined && {
                    fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null
                }),
                ...(numero_celular !== undefined && { numero_celular: numero_celular || null }),
                ...(numero_celular_emergencia !== undefined && { numero_celular_emergencia: numero_celular_emergencia || null }),
                ...(alergia_medicamento !== undefined && { alergia_medicamento: alergia_medicamento || null }),
                ...(tiempo_entrenamiento !== undefined && { tiempo_entrenamiento: tiempo_entrenamiento || null }),
            },
            include: {
                disciplinas: true,
                profesores: true
            }
        });

        res.json(clienteActualizado);
    } catch (error) {
        if (error?.code === 'P2002') {
            return res.status(409).json({ error: 'Ya existe un alumno con ese DNI (puede estar dado de baja)' });
        }
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

        if (!cliente || !puedeGestionar(req, cliente)) {
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

