import express from 'express';
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } from '../controllers/clientes.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getClientes);
router.get('/:id', verifyToken, getClienteById);
router.post('/', verifyToken, createCliente);
router.put('/:id', verifyToken, updateCliente);
router.delete('/:id', verifyToken, deleteCliente);

export default router;
