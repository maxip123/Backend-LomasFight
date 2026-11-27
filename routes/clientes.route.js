import express from 'express';
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } from '../controllers/clientes.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Datos personales de alumnos: siempre requieren sesión.
// Admin ve todo; un profesor solo sus propios alumnos (se controla en el controlador).
router.use(verifyToken);

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;
