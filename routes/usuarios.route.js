import express from 'express';
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, loginUsuario } from '../controllers/usuarios.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', loginUsuario);

router.get('/', verifyToken, getUsuarios);
router.get('/:id', verifyToken, getUsuarioById);
router.post('/', verifyToken, createUsuario);
router.put('/:id', verifyToken, updateUsuario);
router.delete('/:id', verifyToken, deleteUsuario);

export default router;
