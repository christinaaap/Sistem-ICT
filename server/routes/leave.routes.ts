import { Router } from 'express';
import {
  getLeaves,
  createLeave,
  signApproval,
  clearLeaves,
} from '../controllers/leave.controller';

const router = Router();

router.get('/', getLeaves);
router.post('/', createLeave);
router.post('/:id/sign', signApproval);
router.delete('/reset/all', clearLeaves);

export default router;
