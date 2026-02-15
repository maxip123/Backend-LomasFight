import express from 'express';
import { getPagos, getPagoById, createPago, updatePago, deletePago } from '../controllers/pago_disciplina.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getPagos);
router.get('/:id', getPagoById);
router.post('/', verifyToken, createPago);
router.put('/:id', verifyToken, updatePago);
router.delete('/:id', verifyToken, deletePago);

export default router;
