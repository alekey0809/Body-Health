import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, "../../uploads/rutinas");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const day = req.params.day;
    cb(null, `dia_${day}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos PDF"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/upload/:day", upload.single("pdf"), (req, res) => {
  const day = parseInt(req.params.day);
  if (isNaN(day) || day < 1 || day > 7) {
    return res.status(400).json({ ok: false, error: "Día inválido (1-7)" });
  }
  if (!req.file) {
    return res.status(400).json({ ok: false, error: "No se subió ningún archivo" });
  }
  res.json({ ok: true, message: `PDF del día ${day} subido correctamente`, file: req.file.filename });
});

router.get("/:day", (req, res) => {
  const day = parseInt(req.params.day);
  if (isNaN(day) || day < 1 || day > 7) {
    return res.status(400).json({ ok: false, error: "Día inválido (1-7)" });
  }
  const filePath = path.join(uploadsDir, `dia_${day}.pdf`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, error: "PDF no encontrado para este día" });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="rutina_dia_${day}.pdf"`);
  res.sendFile(filePath);
});

router.get("/status/all", (req, res) => {
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const filePath = path.join(uploadsDir, `dia_${i}.pdf`);
    days.push({ day: i, exists: fs.existsSync(filePath) });
  }
  res.json({ ok: true, days });
});

router.delete("/:day", (req, res) => {
  const day = parseInt(req.params.day);
  if (isNaN(day) || day < 1 || day > 7) {
    return res.status(400).json({ ok: false, error: "Día inválido (1-7)" });
  }
  const filePath = path.join(uploadsDir, `dia_${day}.pdf`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ ok: true, message: `PDF del día ${day} eliminado` });
  } else {
    res.status(404).json({ ok: false, error: "PDF no encontrado" });
  }
});

export default router;