import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createCase,
  deleteCase,
  getCaseById,
  listCases,
  updateCase,
} from '../services/case.service.js';

const router = Router();

router.use(verifyToken);

router.get('/', listCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

export default router;
