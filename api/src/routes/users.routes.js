import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createAdminUser,
  deleteUser,
  getUserById,
  listUsers,
  loginUser,
  registerUser,
  updateUser,
} from '../services/user.service.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.use(verifyToken);
router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createAdminUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
