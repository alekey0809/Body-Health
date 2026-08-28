import { BackupModel } from '../models/backup.model.js';

const getTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export const exportBackup = async (req, res) => {
  try {
    const backupData = await BackupModel.getSystemBackupData();
    const timestamp = getTimestamp();
    const filename = `backup_sistema_${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Error al generar respaldo:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al generar el respaldo del sistema',
      error: error.message
    });
  }
};

export const importBackup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'No se ha seleccionado ningún archivo de respaldo.'
      });
    }

    const mode = req.body.mode || 'merge'; // 'merge' o 'overwrite'
    if (!['merge', 'overwrite'].includes(mode)) {
      return res.status(400).json({
        ok: false,
        message: 'Modo de restauración no válido. Opciones permitidas: merge, overwrite.'
      });
    }

    let backupData;
    try {
      const fileContent = req.file.buffer.toString('utf-8');
      backupData = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({
        ok: false,
        message: 'El archivo adjunto está corrupto o no contiene una estructura JSON válida.',
        error: parseError.message
      });
    }

    const result = await BackupModel.restoreSystemBackupData(backupData, mode);

    return res.status(200).json({
      ok: true,
      message: `Restauración completada con éxito en modo '${mode === 'overwrite' ? 'Sobrescribir' : 'Reintegrar'}'.`,
      details: {
        tablesRestored: result.restoredTables,
        rowsProcessed: result.totalRows,
        mode
      }
    });
  } catch (error) {
    console.error('Error al restaurar respaldo:', error);
    return res.status(500).json({
      ok: false,
      message: error.message || 'Error interno durante el proceso de restauración del sistema.',
      error: error.message
    });
  }
};

