import express from 'express';
import { getGastos, getGastoById, createGasto, updateGasto, deleteGasto } from '../controllers/gastos.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Solo administradores
router.use(verifyToken, requireAdmin);

router.get('/', getGastos);
router.get('/:id', getGastoById);
router.post('/', createGasto);
router.put('/:id', updateGasto);
router.delete('/:id', deleteGasto);

export default router;
