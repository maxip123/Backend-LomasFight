import express from 'express';
import { getProfesores, getProfesorById, createProfesor, updateProfesor, deleteProfesor } from '../controllers/profesores.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Lectura pública (landing). Escritura solo admin.
router.get('/', getProfesores);
router.get('/:id', getProfesorById);
router.post('/', verifyToken, requireAdmin, createProfesor);
router.put('/:id', verifyToken, requireAdmin, updateProfesor);
router.delete('/:id', verifyToken, requireAdmin, deleteProfesor);

export default router;
