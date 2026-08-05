import { Router } from 'express';
import { register, login, updateProfile, getUsers, getUserById, updateUserAdmin, deleteUser } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/register', register);
router.post('/login', login);
router.put('/profile/:id', updateProfile);
router.put('/:id', updateUserAdmin);
router.delete('/:id', deleteUser);

export default router;