import { prisma } from '../config/prisma.js';

const getProfesores = async (req, res) => {
    try {
        const profesores = await prisma.profesores.findMany({
            where: { activo: true },
            include: {
                clientes: true,
                horarios: true,
                disciplinas: true
            }
        });
        res.json(profesores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los profesores' });
    }
};

const getProfesorById = async (req, res) => {   
    const { id } = req.params;
    try {
        const profesor = await prisma.profesores.findUnique({
            where: { id_profesor: parseInt(id) },
            include: {
                clientes: true,
                horarios: true,
                disciplinas: true
            }
        });
        if (!profesor || !profesor.activo) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        res.json(profesor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el profesor' });
    }
};

const createProfesor = async (req, res) => {
    try {
        const { nombre, apellido, id_disciplina, descripcion } = req.body;
        
        if (!nombre || !apellido || !id_disciplina) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const profesor = await prisma.profesores.create({
            data: {
                nombre,
                apellido,
                id_disciplina: parseInt(id_disciplina),
                descripcion,
                activo: true
            },
            include: {
                disciplinas: true
            }
        });
        
        res.status(201).json(profesor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el profesor' });
    }
};

const updateProfesor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, id_disciplina, descripcion } = req.body;
        
        const profesor = await prisma.profesores.findUnique({
            where: { id_profesor: parseInt(id) }
        });
        
        if (!profesor || !profesor.activo) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        
        const profesorActualizado = await prisma.profesores.update({
            where: { id_profesor: parseInt(id) },
            data: {
                ...(nombre && { nombre }),
                ...(apellido && { apellido }),
                ...(id_disciplina && { id_disciplina: parseInt(id_disciplina) }),
                ...(descripcion !== undefined && { descripcion })
            },
            include: {
                disciplinas: true
            }
        });
        
        res.json(profesorActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el profesor' });
    }
};

const deleteProfesor = async (req, res) => {
    try {
        const { id } = req.params;
        
        const profesor = await prisma.profesores.findUnique({
            where: { id_profesor: parseInt(id) }
        });
        
        if (!profesor || !profesor.activo) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        
        // Borrado lógico
        const profesorEliminado = await prisma.profesores.update({
            where: { id_profesor: parseInt(id) },
            data: { activo: false }
        });
        
        res.json({ message: 'Profesor eliminado correctamente', profesor: profesorEliminado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el profesor' });
    }
};

export {
    getProfesores,
    getProfesorById,
    createProfesor,
    updateProfesor,
    deleteProfesor
};