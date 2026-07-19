import { Router } from 'express';
import { register, login, updateProfile } from '../controllers/user.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/:id', updateProfile);

export default router;