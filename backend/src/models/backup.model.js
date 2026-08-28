import { pool } from '../config/db.js';

export const BackupModel = {
  getSystemBackupData: async () => {
    const targetTables = ['usuario', 'factura', 'detalle_factura', 'estado_pago', 'membresia'];

    // 1. Obtener estructura/esquema de cada tabla desde information_schema
    const schemaQuery = `
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
      ORDER BY table_name, ordinal_position;
    `;
    const schemaResult = await pool.query(schemaQuery, [targetTables]);

    // Agrupar esquema por tabla
    const schema = {};
    targetTables.forEach((tbl) => { schema[tbl] = []; });
    schemaResult.rows.forEach((col) => {
      if (schema[col.table_name]) {
        schema[col.table_name].push({
          column_name: col.column_name,
          data_type: col.data_type,
          is_nullable: col.is_nullable,
          column_default: col.column_default
        });
      }
    });

    // 2. Obtener datos actualizados de cada tabla
    const data = {};
    for (const table of targetTables) {
      try {
        const queryRes = await pool.query(`SELECT * FROM ${table}`);
        data[table] = queryRes.rows;
      } catch (err) {
        console.warn(`Advertencia al exportar datos de la tabla ${table}:`, err.message);
        data[table] = [];
      }
    }

    return {
      metadata: {
        system: "BodyHealth Gym Management System",
        version: "1.0",
        generated_at: new Date().toISOString(),
        tables_included: targetTables
      },
      schema,
      data
    };
  },

  restoreSystemBackupData: async (backupData, mode = 'merge') => {
    // 1. Validaciones previas de la estructura y coherencia del respaldo
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('El archivo cargado no contiene un formato JSON válido.');
    }

    if (!backupData.data || typeof backupData.data !== 'object') {
      throw new Error('El archivo de respaldo no contiene la clave "data" con la información del sistema.');
    }

    const expectedTables = ['estado_pago', 'usuario', 'membresia', 'factura', 'detalle_factura'];
    const deleteOrder = ['detalle_factura', 'factura', 'membresia', 'usuario', 'estado_pago'];

    const presentTables = Object.keys(backupData.data);
    const hasValidTable = expectedTables.some((tbl) => Array.isArray(backupData.data[tbl]));

    if (!hasValidTable) {
      throw new Error('El archivo de respaldo no contiene tablas compatibles con el sistema BodyHealth.');
    }

    const client = await pool.connect();
    const stats = { restoredTables: 0, totalRows: 0 };

    try {
      await client.query('BEGIN');

      // Si el modo es overwrite, limpiamos las tablas en orden inverso de dependencia (FK)
      if (mode === 'overwrite') {
        for (const tbl of deleteOrder) {
          if (presentTables.includes(tbl)) {
            await client.query(`DELETE FROM "${tbl}";`);
          }
        }
      }

      // Insertar / Reintegrar datos en orden directo de dependencia
      for (const tbl of expectedTables) {
        const rows = backupData.data[tbl];
        if (!Array.isArray(rows) || rows.length === 0) continue;

        stats.restoredTables++;

        // Obtener claves primarias de la tabla si existen
        let pkCols = [];
        try {
          const pkRes = await client.query(
            `
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = $1::regclass AND i.indisprimary;
            `,
            [tbl]
          );
          pkCols = pkRes.rows.map((r) => r.attname);
        } catch (e) {
          pkCols = [];
        }

        for (const row of rows) {
          const keys = Object.keys(row);
          if (keys.length === 0) continue;

          const colsFormatted = keys.map((k) => `"${k}"`).join(', ');
          const params = keys.map((_, idx) => `$${idx + 1}`).join(', ');
          const values = keys.map((k) => row[k]);

          let insertQuery = `INSERT INTO "${tbl}" (${colsFormatted}) VALUES (${params})`;

          if (mode === 'merge' && pkCols.length > 0) {
            const pkFormatted = pkCols.map((c) => `"${c}"`).join(', ');
            const nonPkKeys = keys.filter((k) => !pkCols.includes(k));

            if (nonPkKeys.length > 0) {
              const updateSet = nonPkKeys.map((k) => `"${k}" = EXCLUDED."${k}"`).join(', ');
              insertQuery += ` ON CONFLICT (${pkFormatted}) DO UPDATE SET ${updateSet}`;
            } else {
              insertQuery += ` ON CONFLICT (${pkFormatted}) DO NOTHING`;
            }
          } else if (mode === 'merge' && pkCols.length === 0) {
            insertQuery += ` ON CONFLICT DO NOTHING`;
          }

          await client.query(insertQuery, values);
          stats.totalRows++;
        }
      }

      // Reajustar secuencias para IDs auto-incrementales
      for (const tbl of expectedTables) {
        try {
          const seqColsRes = await client.query(
            `
            SELECT column_name, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1;
            `,
            [tbl]
          );

          for (const col of seqColsRes.rows) {
            if (col.column_default && col.column_default.includes('nextval')) {
              await client.query(
                `
                SELECT setval(pg_get_serial_sequence($1, $2), COALESCE(MAX("${col.column_name}"), 1)) FROM "${tbl}";
                `,
                [tbl, col.column_name]
              );
            }
          }
        } catch (seqErr) {
          console.warn(`Aviso al resetear secuencias en ${tbl}:`, seqErr.message);
        }
      }

      await client.query('COMMIT');
      return stats;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error durante la transacción de restauración:', error);
      throw error;
    } finally {
      client.release();
    }
  }
};
