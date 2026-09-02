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
import backupRoutes from './routes/backup.routes.js';
import valoracionFisicaRoutes from './routes/valoracionFisica.routes.js';
import informeFinancieroRoutes from './routes/informeFinanciero.routes.js';
import adminDashboardRoutes from './routes/adminDashboard.routes.js';
import eventoRoutes from './routes/evento.routes.js';
import notificacionRoutes from './routes/notificacion.routes.js';
import { pool } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors()); // TODO: Configurar origins para produccion
app.use(express.json());

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 

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
// Rutas de Respaldo / Backup
app.use('/api/backup', backupRoutes);
// Rutas de Valoración Física
app.use('/api/valoracion-fisica', valoracionFisicaRoutes);
// Rutas de Informes Financieros
app.use('/api/informes-financieros', informeFinancieroRoutes);
// Rutas de Dashboard Admin
app.use('/api/admin-dashboard', adminDashboardRoutes);
// Rutas de Eventos
app.use('/api/eventos', eventoRoutes);
// Rutas de Notificaciones
app.use('/api/notificaciones', notificacionRoutes);

// Servir archivos estáticos del frontend (React / Vite) si existen
const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

// Fallback para React Router (SPA): cualquier ruta que no sea API redirige a index.html
app.get('*', (req, res) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(200).send('<h1>Body Health API</h1>');
        }
    });
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await pool.query(`
            ALTER TABLE evento ADD COLUMN IF NOT EXISTS ev_fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW();
            ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS n_titulo VARCHAR(200) NOT NULL DEFAULT 'Notificación';
            ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS n_mensaje TEXT NOT NULL DEFAULT '';
            ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS n_leida BOOLEAN NOT NULL DEFAULT FALSE;
            ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS n_evento_id INTEGER REFERENCES evento(ev_id) ON DELETE SET NULL;
            ALTER TABLE notificacion ADD COLUMN IF NOT EXISTS n_membresia_id INTEGER REFERENCES membresia(m_id) ON DELETE SET NULL;
        `);
    } catch (err) {
        console.error('Verificación de esquema eventos/notificaciones:', err.message);
    }
});


