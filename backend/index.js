import express from "express";
import cors from "cors";
import { PORT } from './config.js';
import { UserRepository } from './user-repository.js'; // Asegúrate de importarlo bien

const app = express();

// Middlewares
app.use(cors()); // Es buena práctica activarlo si te vas a conectar desde un frontend externo
app.use(express.json()); 

app.get('/', (req, response) => {
    response.send('<h1>hello MI BRO</h1>');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    try {
        const id = UserRepository.create({ username, password });
        res.status(201).json({ id, message: "User created successfully" });
    } catch (error) {  
        res.status(400).json({ error: error.message });
    }
});

app.post('/login', (req, res) => {
    // Aquí llamarás a UserRepository.login({ username, password })
    // Y usualmente querrás retornar un Token (JWT) o manejar sesiones para las rutas protegidas.
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// config();
// const pool = new pg.Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// app.use(cors({
       
// }));
// app.get('/users',(req,res ) => {
// res.send({users:[]});
// });

// app.get('/ping',async (req,res ) => {
//     const result= await pool.query('SELECT now()');
//     return res.json(result.rows[0]);
// });

// app.listen(BACKEND_PORT,() => {console.log( 'server on port', BACKEND_PORT);
// });
