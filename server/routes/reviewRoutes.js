import express from 'express';
import {
  getProductReviews,
  addReview,
  deleteReview,
  adminGetReviews,
  adminToggleReviewVisibility,
  adminDeleteReview,
} from '../controllers/reviewController.js';
import { protect, protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/product/:productId', getProductReviews);

// Customer
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

// Admin moderation
router.get('/admin', protectAdmin, adminGetReviews);
router.patch('/admin/:id/visibility', protectAdmin, adminToggleReviewVisibility);
router.delete('/admin/:id', protectAdmin, adminDeleteReview);

export default router;
