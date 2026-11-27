import express from 'express';
import { getHorarios, getHorarioById, createHorario, updateHorario, deleteHorario } from '../controllers/horarios.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Lectura pública (landing). Escritura solo admin.
router.get('/', getHorarios);
router.get('/:id', getHorarioById);
router.post('/', verifyToken, requireAdmin, createHorario);
router.put('/:id', verifyToken, requireAdmin, updateHorario);
router.delete('/:id', verifyToken, requireAdmin, deleteHorario);

export default router;
