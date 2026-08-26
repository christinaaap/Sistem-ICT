import { Router } from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  bulkImportAssets,
  clearAssets,
} from '../controllers/assets.controller';

const router = Router();

router.get('/', getAssets);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);
router.post('/bulk', bulkImportAssets);
router.delete('/reset/all', clearAssets);

export default router;
