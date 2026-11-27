import express from 'express';
import { getPagos, getPagoById, createPago, updatePago, deletePago } from '../controllers/pago_disciplina.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Solo administradores
router.use(verifyToken, requireAdmin);

router.get('/', getPagos);
router.get('/:id', getPagoById);
router.post('/', createPago);
router.put('/:id', updatePago);
router.delete('/:id', deletePago);

export default router;
