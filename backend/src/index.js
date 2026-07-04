import express from "express";
import cors from "cors";
import { PORT } from './config/config.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middlewares
app.use(cors()); // TODO: Configurar origins para produccion
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('<h1>Body Health API</h1>');
});

// Rutas de Usuario (PostgreSQL)
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
