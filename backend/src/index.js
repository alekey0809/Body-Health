import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PORT } from './config/config.js';
import userRoutes from './routes/user.routes.js';
import planRoutes from './routes/plan.routes.js';
import entrenadorRoutes from './routes/entrenador.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import asistenciaRoutes from './routes/asistencia.routes.js';
import noticiaRoutes from './routes/noticia.routes.js';
import rutinaRoutes from './routes/rutina.routes.js';
import historialSueldoRoutes from './routes/historialSueldo.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors()); // TODO: Configurar origins para produccion
app.use(express.json());

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 

app.get('/', (req, res) => {
    res.send('<h1>Body Health API</h1>');
});

// Rutas de Usuario (PostgreSQL)
app.use('/api/users', userRoutes);
// Rutas de Planes de Entrenamiento (PostgreSQL)
app.use('/api/planes', planRoutes);
// Rutas de Entrenadores (PostgreSQL)
app.use('/api/entrenadores', entrenadorRoutes);
// Rutas de Pagos
app.use('/api/pagos', pagoRoutes);
// Rutas de Historial de Sueldos
app.use('/api/historial-sueldos', historialSueldoRoutes);
// Rutas de Asistencias (PostgreSQL)
app.use('/api/asistencia', asistenciaRoutes);
// Rutas de Noticias / Publicaciones (PostgreSQL)
app.use('/api/noticias', noticiaRoutes);
// Rutas de Rutinas PDF
app.use('/api/rutinas', rutinaRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


