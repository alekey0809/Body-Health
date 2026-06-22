import express from "express";
import {config} from "dotenv";
import pg from "pg";
import cors from "cors";
import {FRONTEND_URL} from "./config.js";

const app = express();

config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false }
})

app.use(cors({
    origin: 'http://localhost:5173'
}))
app.get('/users',(req,res ) => {
res.send({users:[]});
});

app.get('/ping',async (req,res ) => {
    const result= await pool.query('SELECT now()');
    return res.json(result.rows[0]);
});

app.listen(3000,() => {console.log( 'server on port', 3000);
});
