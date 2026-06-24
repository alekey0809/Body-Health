import express from "express";
import {config} from "dotenv";
import pg from "pg";
import cors from "cors";
import {FRONTEND_URL,BACKEND_PORT} from "./config.js";

const app = express();

config();
const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// app.use(cors({
//     origin: FRONTEND_URL
// }));
app.get('/users',(req,res ) => {
res.send({users:[]});
});

app.get('/ping',async (req,res ) => {
    const result= await pool.query('SELECT now()');
    return res.json(result.rows[0]);
});

app.listen(BACKEND_PORT,() => {console.log( 'server on port', BACKEND_PORT);
});
