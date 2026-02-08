import { prisma } from '../config/prisma.js';
import { comparePassword, generateToken } from '../middleware/auth.middleware.js';

const loginUsuario = async (req, res) => {
    try {
        const { mail_usuario, contrasena_usuario } = req.body;
        
        if (!mail_usuario || !contrasena_usuario) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }

        // Buscar usuario por email
        const usuario = await prisma.usuarios.findUnique({
            where: { mail_usuario }
        });
        
        if (!usuario || !usuario.activo) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
        
        // Comparar contraseña
        const contrasenaValida = await comparePassword(contrasena_usuario, usuario.contrasena_usuario);
        
        if (!contrasenaValida) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
        
        // Generar token JWT
        const token = generateToken(usuario.id_usuario, usuario.mail_usuario);
        
        res.json({
            message: 'Login exitoso',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                mail_usuario: usuario.mail_usuario,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el login' });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuarios.findMany({
            where: { activo: true },
            select: {
                id_usuario: true,
                nombre_usuario: true,
                mail_usuario: true,
                rol: true,
                activo: true
            }
        });
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};

const getUsuarioById = async (req, res) => {   
    const { id } = req.params;
    try {
        const usuario = await prisma.usuarios.findUnique({
            where: { id_usuario: parseInt(id) },
            select: {
                id_usuario: true,
                nombre_usuario: true,
                mail_usuario: true,
                rol: true,
                activo: true
            }
        });
        if (!usuario || !usuario.activo) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

const createUsuario = async (req, res) => {
    try {
        const { nombre_usuario, mail_usuario, contrasena_usuario, rol } = req.body;
        
        if (!nombre_usuario || !mail_usuario || !contrasena_usuario || !rol) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await prisma.usuarios.findUnique({
            where: { mail_usuario }
        });
        
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        
        // Hashear la contraseña
        const saltRounds = 10;
        const contrasenaHasheada = await bcrypt.hash(contrasena_usuario, saltRounds);

        const usuario = await prisma.usuarios.create({
            data: {
                nombre_usuario,
                mail_usuario,
                contrasena_usuario: contrasenaHasheada,
                rol,
                activo: true
            },
            select: {
                id_usuario: true,
                nombre_usuario: true,
                mail_usuario: true,
                rol: true,
                activo: true
            }
        });
        
        res.status(201).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_usuario, mail_usuario, rol } = req.body;
        
        const usuario = await prisma.usuarios.findUnique({
            where: { id_usuario: parseInt(id) }
        });
        
        if (!usuario || !usuario.activo) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const usuarioActualizado = await prisma.usuarios.update({
            where: { id_usuario: parseInt(id) },
            data: {
                ...(nombre_usuario && { nombre_usuario }),
                ...(mail_usuario && { mail_usuario }),
                ...(rol && { rol })
            },
            select: {
                id_usuario: true,
                nombre_usuario: true,
                mail_usuario: true,
                rol: true,
                activo: true
            }
        });
        
        res.json(usuarioActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};

const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = await prisma.usuarios.findUnique({
            where: { id_usuario: parseInt(id) }
        });
        
        if (!usuario || !usuario.activo) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Borrado lógico
        const usuarioEliminado = await prisma.usuarios.update({
            where: { id_usuario: parseInt(id) },
            data: { activo: false }
        });
        
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

export {
    loginUsuario,
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};