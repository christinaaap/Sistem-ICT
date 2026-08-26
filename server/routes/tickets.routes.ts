import { Router } from 'express';
import {
  getTickets,
  createTicket,
  updateTicketStatus,
  deleteTicket,
  clearTickets,
} from '../controllers/tickets.controller';

const router = Router();

router.get('/', getTickets);
router.post('/', createTicket);
router.patch('/:id/status', updateTicketStatus);
router.delete('/:id', deleteTicket);
router.delete('/reset/all', clearTickets);

export default router;
