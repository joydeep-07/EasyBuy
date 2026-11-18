import express from 'express';
import {
  adminGetInventory,
  adminUpdateStock,
  adminGetTransactions,
} from '../controllers/inventoryController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protectAdmin); // Admin only

router.get('/', adminGetInventory);
router.patch('/:id', adminUpdateStock);
router.get('/transactions', adminGetTransactions);

export default router;
