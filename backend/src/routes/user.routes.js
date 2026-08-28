import { Router } from 'express';
import { register, login, updateProfile, getUsers, getUserById, updateUserAdmin, deleteUser, forgotPassword, resetPassword } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile/:id', updateProfile);
router.put('/:id', updateUserAdmin);
router.delete('/:id', deleteUser);

export default router;