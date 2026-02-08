import express from 'express';
import { getDisciplinas, getDisciplinaById, createDisciplina, updateDisciplina, deleteDisciplina } from '../controllers/diciplina.controller.js';

const router = express.Router();

router.get('/', getDisciplinas);
router.get('/:id', getDisciplinaById);
router.post('/', createDisciplina);
router.put('/:id', updateDisciplina);
router.delete('/:id', deleteDisciplina);

export default router;
