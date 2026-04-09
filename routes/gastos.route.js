import express from 'express';
import { getGastos, getGastoById, createGasto, updateGasto, deleteGasto } from '../controllers/gastos.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getGastos);
router.get('/:id', verifyToken, getGastoById);
router.post('/', verifyToken, createGasto);
router.put('/:id', verifyToken, updateGasto);
router.delete('/:id', verifyToken, deleteGasto);

export default router;
