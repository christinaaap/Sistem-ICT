import { Router } from 'express';
import { diagnoseTicket } from '../controllers/ai.controller';

const router = Router();

router.post('/diagnose', diagnoseTicket);

export default router;
