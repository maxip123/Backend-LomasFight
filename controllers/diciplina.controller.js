import { prisma } from '../config/prisma.js';

const getDisciplinas = async (req, res) => {
    try {
        const disciplinas = await prisma.disciplinas.findMany({
            where: { activo: true },
            include: {
                clientes: true,
                horarios: true,
                pagos: true,
                profesores: true
            }
        });
        res.json(disciplinas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las disciplinas' });
    }
};

const getDisciplinaById = async (req, res) => {   
    const { id } = req.params;
    try {
        let disciplina = null;
        
        // Verificamos si el parámetro es un número
        if (!isNaN(id)) {
            // Es un número, buscamos por ID
            disciplina = await prisma.disciplinas.findUnique({
                where: { id_disciplina: parseInt(id) },
                include: {
                    clientes: true,
                    horarios: true,
                    pagos: true,
                    profesores: true
                }
            });
        } else {
            // Es un texto, buscamos por nombre. Como no tiene @unique usamos findFirst.
            disciplina = await prisma.disciplinas.findFirst({
                where: { 
                    nombre_disciplina: { equals: id, mode: 'insensitive' },
                    activo: true 
                },
                include: {
                    clientes: true,
                    horarios: true,
                    pagos: true,
                    profesores: true
                }
            });
        }

        if (!disciplina || !disciplina.activo) {
            return res.status(404).json({ error: 'Disciplina no encontrada' });
        }
        res.json(disciplina);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la disciplina' });
    }
};

const createDisciplina = async (req, res) => {
    try {
        const { nombre_disciplina, cuota, descripcion, img_banner, img_preview, numero_celular } = req.body;
        
        if (!nombre_disciplina || !cuota) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const disciplina = await prisma.disciplinas.create({
            data: {
                nombre_disciplina,
                cuota: parseFloat(cuota),
                descripcion,
                img_banner,
                img_preview,
                numero_celular: numero_celular || null,
                activo: true
            }
        });
        
        res.status(201).json(disciplina);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la disciplina' });
    }
};

const updateDisciplina = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_disciplina, cuota, descripcion, img_banner, img_preview, numero_celular } = req.body;
        
        const disciplina = await prisma.disciplinas.findUnique({
            where: { id_disciplina: parseInt(id) }
        });
        
        if (!disciplina || !disciplina.activo) {
            return res.status(404).json({ error: 'Disciplina no encontrada' });
        }
        
        const disciplinaActualizada = await prisma.disciplinas.update({
            where: { id_disciplina: parseInt(id) },
            data: {
                ...(nombre_disciplina && { nombre_disciplina }),
                ...(cuota && { cuota: parseFloat(cuota) }),
                ...(descripcion && { descripcion }),
                ...(img_banner !== undefined && { img_banner }),
                ...(img_preview !== undefined && { img_preview }),
                ...(numero_celular !== undefined && { numero_celular: numero_celular || null })
            }
        });
        
        res.json(disciplinaActualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la disciplina' });
    }
};

const deleteDisciplina = async (req, res) => {
    try {
        const { id } = req.params;
        
        const disciplina = await prisma.disciplinas.findUnique({
            where: { id_disciplina: parseInt(id) }
        });
        
        if (!disciplina || !disciplina.activo) {
            return res.status(404).json({ error: 'Disciplina no encontrada' });
        }
        
        // Borrado lógico
        const disciplinaEliminada = await prisma.disciplinas.update({
            where: { id_disciplina: parseInt(id) },
            data: { activo: false }
        });
        
        res.json({ message: 'Disciplina eliminada correctamente', disciplina: disciplinaEliminada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la disciplina' });
    }
};

export {
    getDisciplinas,
    getDisciplinaById,
    createDisciplina,
    updateDisciplina,
    deleteDisciplina
};