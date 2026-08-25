import { Router } from 'express';
import {
  getTodayStatus,
  getUserAttendances,
  registerAttendance,
  checkMembershipStatus
} from '../controllers/asistencia.controller.js';

const router = Router();

router.get('/today/:userId', getTodayStatus);
router.get('/user/:userId', getUserAttendances);
router.get('/membership/:userId', checkMembershipStatus);
router.post('/register', registerAttendance);

export default router;
