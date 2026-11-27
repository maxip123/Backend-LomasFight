import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

// Duración de la sesión. Al vencer, el usuario tiene que volver a iniciar sesión.
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

// Middleware para comparar contraseñas
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Generar JWT con expiración
const generateToken = (userId, email, rol) => {
  return jwt.sign(
    { userId, email, rol },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
};

// Middleware para validar token JWT.
// Además del token, verifica en la base que el usuario siga activo y toma su rol
// actual desde ahí (así un usuario dado de baja o con rol cambiado no conserva acceso).
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Tokens viejos emitidos sin expiración ya no se aceptan
  if (!decoded.exp) {
    return res.status(401).json({ error: 'Sesión expirada, volvé a iniciar sesión' });
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: decoded.userId },
      select: { id_usuario: true, mail_usuario: true, rol: true, activo: true, id_profesor: true }
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario inactivo o inexistente' });
    }

    req.user = {
      userId: usuario.id_usuario,
      email: usuario.mail_usuario,
      rol: usuario.rol,
      id_profesor: usuario.id_profesor
    };
    next();
  } catch (error) {
    next(error);
  }
};

const isAdmin = (req) => req.user?.rol === 'admin';

// Usar después de verifyToken: solo deja pasar administradores
const requireAdmin = (req, res, next) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'No tenés permisos para esta acción' });
  }
  next();
};

export {
  comparePassword,
  generateToken,
  verifyToken,
  requireAdmin,
  isAdmin
};
