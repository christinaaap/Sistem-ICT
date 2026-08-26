import { Router } from 'express';
import {
  getAttendances,
  createAttendance,
  clearAttendances,
} from '../controllers/attendance.controller';

const router = Router();

router.get('/', getAttendances);
router.post('/', createAttendance);
router.delete('/reset/all', clearAttendances);

export default router;
