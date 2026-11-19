import express from 'express';
import {
  checkPincode,
  getOrderTracking,
  adminGetZones,
  adminCreateZone,
  adminDeleteZone,
} from '../controllers/shippingController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public / Customer
router.get('/check-pincode/:pincode', checkPincode);
router.get('/track', getOrderTracking);
router.get('/track/:orderId', getOrderTracking);

// Admin delivery zone routes
router.get('/admin/zones', protectAdmin, adminGetZones);
router.post('/admin/zones', protectAdmin, adminCreateZone);
router.delete('/admin/zones/:id', protectAdmin, adminDeleteZone);

export default router;
