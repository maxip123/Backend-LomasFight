import express from 'express';
import { getHorarios, getHorarioById, createHorario, updateHorario, deleteHorario } from '../controllers/horarios.controller.js';

const router = express.Router();

router.get('/', getHorarios);
router.get('/:id', getHorarioById);
router.post('/', createHorario);
router.put('/:id', updateHorario);
router.delete('/:id', deleteHorario);

export default router;
