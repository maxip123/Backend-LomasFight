import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

// Estos endpoints son públicos (landing): nunca incluir alumnos ni pagos.
const PUBLIC_INCLUDE = {
    horarios: { where: { activo: true } },
    profesores: { where: { activo: true } }
};

const MAX_BENEFICIOS = 6;

/**
 * Normaliza la lista de beneficios que manda el admin: [{ titulo, descripcion }].
 * Descarta ítems sin título, recorta espacios y limita la cantidad.
 * Devuelve null si queda vacía (la landing usa entonces los beneficios genéricos).
 */
const normalizarBeneficios = (beneficios) => {
    if (!Array.isArray(beneficios)) return null;
    const limpios = beneficios
        .map(b => ({
            titulo: String(b?.titulo ?? '').trim().slice(0, 80),
            descripcion: String(b?.descripcion ?? '').trim().slice(0, 300)
        }))
        .filter(b => b.titulo)
        .slice(0, MAX_BENEFICIOS);
    return limpios.length ? limpios : null;
};

const getDisciplinas = async (req, res) => {
    try {
        const disciplinas = await prisma.disciplinas.findMany({
            where: { activo: true },
            include: PUBLIC_INCLUDE
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
                include: PUBLIC_INCLUDE
            });
        } else {
            // Es un texto, buscamos por nombre. Como no tiene @unique usamos findFirst.
            // Coincidencia exacta ignorando mayúsculas y espacios de los extremos
            // (tolera nombres viejos guardados con un espacio al final, ej. "Jiu-Jitsu ").
            const buscado = id.trim().toLowerCase();
            const candidatas = await prisma.disciplinas.findMany({
                where: {
                    nombre_disciplina: { startsWith: id.trim(), mode: 'insensitive' },
                    activo: true
                },
                include: PUBLIC_INCLUDE
            });
            disciplina = candidatas.find(d => d.nombre_disciplina.trim().toLowerCase() === buscado) ?? null;
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
        const { cuota, descripcion, img_banner, img_preview, numero_celular, beneficios } = req.body;
        // Sin espacios sobrantes: un espacio al final rompía la búsqueda por nombre
        const nombre_disciplina = req.body.nombre_disciplina?.trim();

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
                beneficios: normalizarBeneficios(beneficios) ?? Prisma.DbNull,
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
        const { cuota, descripcion, img_banner, img_preview, numero_celular, beneficios } = req.body;
        const nombre_disciplina = req.body.nombre_disciplina?.trim();

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
                ...(numero_celular !== undefined && { numero_celular: numero_celular || null }),
                ...(beneficios !== undefined && { beneficios: normalizarBeneficios(beneficios) ?? Prisma.DbNull })
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