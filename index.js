import express from "express";
import {config} from "dotenv";
import pg from "pg";


config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const app = express();
app.get('/',(req,res ) => {
res.send('Hello, World!');
});
app.get('/ping',async (req,res ) => {
    const result= await pool.query('SELECT now()');
    return res.json(result.rows[0]);
});

app.listen(3000)
console.log( 'server on port', 3000)
