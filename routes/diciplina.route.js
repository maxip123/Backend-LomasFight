import express from 'express';
import { getDisciplinas, getDisciplinaById, createDisciplina, updateDisciplina, deleteDisciplina } from '../controllers/diciplina.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Lectura pública (landing). Escritura solo admin.
router.get('/', getDisciplinas);
router.get('/:id', getDisciplinaById);
router.post('/', verifyToken, requireAdmin, createDisciplina);
router.put('/:id', verifyToken, requireAdmin, updateDisciplina);
router.delete('/:id', verifyToken, requireAdmin, deleteDisciplina);

export default router;
