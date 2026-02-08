import { prisma } from '../config/prisma.js';

const getHorarios = async (req, res) => {
    try {
        const horarios = await prisma.horarios.findMany({
            where: { activo: true },
            include: {
                disciplinas: true,
                profesores: true
            }
        });
        res.json(horarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los horarios' });
    }
};

const getHorarioById = async (req, res) => {   
    const { id } = req.params;
    try {
        const horario = await prisma.horarios.findUnique({
            where: { id_horario: parseInt(id) },
            include: {
                disciplinas: true,
                profesores: true
            }
        });
        if (!horario || !horario.activo) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }
        res.json(horario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el horario' });
    }
};

const createHorario = async (req, res) => {
    try {
        const { dia_y_hora, id_disciplina, id_profesor } = req.body;
        
        if (!dia_y_hora || !id_disciplina || !id_profesor) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const horario = await prisma.horarios.create({
            data: {
                dia_y_hora: new Date(dia_y_hora),
                id_disciplina: parseInt(id_disciplina),
                id_profesor: parseInt(id_profesor),
                activo: true
            },
            include: {
                disciplinas: true,
                profesores: true
            }
        });
        
        res.status(201).json(horario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el horario' });
    }
};

const updateHorario = async (req, res) => {
    try {
        const { id } = req.params;
        const { dia_y_hora, id_disciplina, id_profesor } = req.body;
        
        const horario = await prisma.horarios.findUnique({
            where: { id_horario: parseInt(id) }
        });
        
        if (!horario || !horario.activo) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }
        
        const horarioActualizado = await prisma.horarios.update({
            where: { id_horario: parseInt(id) },
            data: {
                ...(dia_y_hora && { dia_y_hora: new Date(dia_y_hora) }),
                ...(id_disciplina && { id_disciplina: parseInt(id_disciplina) }),
                ...(id_profesor && { id_profesor: parseInt(id_profesor) })
            },
            include: {
                disciplinas: true,
                profesores: true
            }
        });
        
        res.json(horarioActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el horario' });
    }
};

const deleteHorario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const horario = await prisma.horarios.findUnique({
            where: { id_horario: parseInt(id) }
        });
        
        if (!horario || !horario.activo) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }
        
        // Borrado lógico
        const horarioEliminado = await prisma.horarios.update({
            where: { id_horario: parseInt(id) },
            data: { activo: false }
        });
        
        res.json({ message: 'Horario eliminado correctamente', horario: horarioEliminado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el horario' });
    }
};

export {
    getHorarios,
    getHorarioById,
    createHorario,
    updateHorario,
    deleteHorario
};