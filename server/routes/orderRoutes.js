import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminUpdatePaymentStatus,
} from '../controllers/orderController.js';
import { protect, protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protectAdmin, adminGetAllOrders);
router.patch('/admin/:id/status', protectAdmin, adminUpdateOrderStatus);
router.patch('/admin/:id/payment-status', protectAdmin, adminUpdatePaymentStatus);

export default router;
