import express from 'express';
import {
  adminGetCustomers,
  adminGetCustomerDetails,
  adminToggleCustomerStatus,
} from '../controllers/customerController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protectAdmin); // Admin only

router.get('/', adminGetCustomers);
router.get('/:id', adminGetCustomerDetails);
router.patch('/:id/status', adminToggleCustomerStatus);

export default router;
