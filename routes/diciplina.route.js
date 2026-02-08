import express from 'express';
import { getDisciplinas, getDisciplinaById, createDisciplina, updateDisciplina, deleteDisciplina } from '../controllers/diciplina.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getDisciplinas);
router.get('/:id',getDisciplinaById);
router.post('/', verifyToken, createDisciplina);
router.put('/:id', verifyToken, updateDisciplina);
router.delete('/:id', verifyToken, deleteDisciplina);

export default router;
