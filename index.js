import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Importar rutas
import clientesRoute from './routes/clientes.route.js';
import diciplinaRoute from './routes/diciplina.route.js';
import horariosRoute from './routes/horarios.route.js';
import pagosRoute from './routes/pagos.route.js';
import profesoresRoute from './routes/profesores.route.js';
import usuariosRoute from './routes/usuarios.route.js';
import pagoDisciplinaRoute from './routes/pago_disciplina.route.js';

const app = express();

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(morgan('dev'));

// Whitelist de orígenes permitidos (solo el frontend)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Bloquear si no hay origen en la whitelist configurada
    if (allowedOrigins.length === 0) {
      return callback(new Error('CORS no configurado: define FRONTEND_URL en .env'));
    }
    // Permitir peticiones sin origen (server-to-server interno de Vercel)
    if (!origin) return callback(null, true);
    // Verificar si el origen está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS bloqueado: origen no permitido (${origin})`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/clientes', clientesRoute);
app.use('/api/diciplinas', diciplinaRoute);
app.use('/api/horarios', horariosRoute);
app.use('/api/pagos', pagosRoute);
app.use('/api/profesores', profesoresRoute);
app.use('/api/usuarios', usuariosRoute);
app.use('/api/pago-disciplina', pagoDisciplinaRoute);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

// En producción (Vercel) no se llama a listen; Vercel usa el export
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

export default app;
