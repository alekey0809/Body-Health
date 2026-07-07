import pg from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar el .env desde la raíz del proyecto
config({ path: path.resolve(__dirname, '../../../.env') }); 

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Solo aplicar SSL si tenemos DATABASE_URL (Render lo necesita)
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});