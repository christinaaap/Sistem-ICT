import { Router } from 'express';
import { login, register, createManagedUser, getUsers, updateUser, deleteUser } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/users', createManagedUser);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
