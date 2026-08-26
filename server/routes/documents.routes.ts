import { Router } from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  clearDocuments,
} from '../controllers/documents.controller';

const router = Router();

router.get('/', getDocuments);
router.post('/', uploadDocument);
router.delete('/:id', deleteDocument);
router.delete('/reset/all', clearDocuments);

export default router;
