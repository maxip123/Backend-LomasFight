import { prisma } from '../config/prisma.js';

// Estos endpoints son públicos (landing): nunca incluir alumnos.
const PUBLIC_INCLUDE = {
    horarios: { where: { activo: true } },
    disciplinas: true
};

const MAX_PREFIJO = 30;
/** Prefijo recortado (puede quedar vacío: se muestra solo el nombre). */
const normalizarPrefijo = (valor) => String(valor ?? '').trim().slice(0, MAX_PREFIJO);

const getProfesores = async (req, res) => {
    try {
        const profesores = await prisma.profesores.findMany({
            where: { activo: true },
            include: PUBLIC_INCLUDE
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
            include: PUBLIC_INCLUDE
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
        const { nombre, apellido, id_disciplina, descripcion, imagen, prefijo } = req.body;

        if (!nombre || !apellido || !id_disciplina) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const profesor = await prisma.profesores.create({
            data: {
                nombre,
                apellido,
                id_disciplina: parseInt(id_disciplina),
                descripcion,
                imagen,
                // Si no se envía, queda el valor por defecto de la base ("Sensei")
                ...(prefijo !== undefined && { prefijo: normalizarPrefijo(prefijo) }),
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
        const { nombre, apellido, id_disciplina, descripcion, imagen, prefijo } = req.body;

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
                ...(descripcion !== undefined && { descripcion }),
                ...(imagen !== undefined && { imagen }),
                ...(prefijo !== undefined && { prefijo: normalizarPrefijo(prefijo) })
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