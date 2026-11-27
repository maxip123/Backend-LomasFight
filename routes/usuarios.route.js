import express from 'express';
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, loginUsuario } from '../controllers/usuarios.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', loginUsuario);

// Gestión de usuarios: solo administradores
router.get('/', verifyToken, requireAdmin, getUsuarios);
router.get('/:id', verifyToken, requireAdmin, getUsuarioById);
router.post('/', verifyToken, requireAdmin, createUsuario);
router.put('/:id', verifyToken, requireAdmin, updateUsuario);
router.delete('/:id', verifyToken, requireAdmin, deleteUsuario);

export default router;
