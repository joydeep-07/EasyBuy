import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  adminGetNotifications,
} from '../controllers/notificationController.js';
import { protect, protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Customer
router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markNotificationRead);
router.patch('/read-all', protect, markAllNotificationsRead);

// Admin
router.get('/admin', protectAdmin, adminGetNotifications);

export default router;
