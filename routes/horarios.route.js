import express from 'express';
import { getHorarios, getHorarioById, createHorario, updateHorario, deleteHorario } from '../controllers/horarios.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',  getHorarios);
router.get('/:id', getHorarioById);
router.post('/', verifyToken, createHorario);
router.put('/:id', verifyToken, updateHorario);
router.delete('/:id', verifyToken, deleteHorario);

export default router;
