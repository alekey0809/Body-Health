import express from "express";
import cors from "cors";
import { PORT } from './config/config.js';
import userRoutes from './routes/user.routes.js';
import planRoutes from './routes/plan.routes.js';

const app = express();

// Middlewares
app.use(cors()); // TODO: Configurar origins para produccion
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('<h1>Body Health API</h1>');
});

// Rutas de Usuario (PostgreSQL)
app.use('/api/users', userRoutes);
// Rutas de Planes de Entrenamiento (PostgreSQL)
app.use('/api/planes', planRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

