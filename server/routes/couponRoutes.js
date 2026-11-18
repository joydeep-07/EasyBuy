import express from 'express';
import {
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  getActiveCoupons,
} from '../controllers/couponController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', getActiveCoupons);

// Admin routes
router.get('/admin', protectAdmin, adminGetCoupons);
router.post('/admin', protectAdmin, adminCreateCoupon);
router.put('/admin/:id', protectAdmin, adminUpdateCoupon);
router.delete('/admin/:id', protectAdmin, adminDeleteCoupon);

export default router;
