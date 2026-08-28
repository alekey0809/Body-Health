import { Router } from 'express';
import multer from 'multer';
import { exportBackup, importBackup } from '../controllers/backup.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken, verifyAdmin);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isJsonExt = file.originalname.toLowerCase().endsWith('.json');

  if (isJsonExt) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de respaldo en formato .json'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB máximo
});

// GET /api/backup/export -> Descargar archivo .json de respaldo
router.get('/export', exportBackup);

// POST /api/backup/restore -> Subir y procesar archivo .json de respaldo
router.post('/restore', upload.single('backupFile'), importBackup, (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      ok: false,
      message: err.message || 'Error al procesar el archivo subido.'
    });
  }
  next();
});

export default router;

