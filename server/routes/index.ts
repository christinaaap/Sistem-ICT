import { Router } from 'express';
import authRoutes from './auth.routes';
import assetsRoutes from './assets.routes';
import ticketsRoutes from './tickets.routes';
import attendanceRoutes from './attendance.routes';
import leaveRoutes from './leave.routes';
import documentsRoutes from './documents.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'DSLNG ICT Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/assets', assetsRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/documents', documentsRoutes);
router.use('/ai', aiRoutes);

export default router;
