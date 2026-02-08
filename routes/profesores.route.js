import express from 'express';
import { getProfesores, getProfesorById, createProfesor, updateProfesor, deleteProfesor } from '../controllers/profesores.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',  getProfesores);
router.get('/:id',  getProfesorById);
router.post('/', verifyToken, createProfesor);
router.put('/:id', verifyToken, updateProfesor);
router.delete('/:id', verifyToken, deleteProfesor);

export default router;
