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
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
