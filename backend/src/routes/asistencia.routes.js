import { Router } from 'express';
import {
  getTodayStatus,
  getUserAttendances,
  registerAttendance,
  checkMembershipStatus,
  getAllAttendancesAdmin,
  updateAttendanceAdmin,
  deleteAttendanceAdmin
} from '../controllers/asistencia.controller.js';

const router = Router();

router.get('/today/:userId', getTodayStatus);
router.get('/user/:userId', getUserAttendances);
router.get('/membership/:userId', checkMembershipStatus);
router.post('/register', registerAttendance);

// Admin routes
router.get('/admin/all', getAllAttendancesAdmin);
router.put('/admin/:id', updateAttendanceAdmin);
router.delete('/admin/:id', deleteAttendanceAdmin);

export default router;
