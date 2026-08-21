import { Router } from 'express';
import {
  getTodayStatus,
  getUserAttendances,
  registerAttendance
} from '../controllers/asistencia.controller.js';

const router = Router();

router.get('/today/:userId', getTodayStatus);
router.get('/user/:userId', getUserAttendances);
router.post('/register', registerAttendance);

export default router;
