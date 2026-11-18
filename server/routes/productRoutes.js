import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getSearchSuggestions,
  createProduct,
  updateProduct,
  updateProductAvailability,
  deleteProduct,
} from '../controllers/productController.js';
import { protectAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search/suggest', getSearchSuggestions);
router.get('/:slug', optionalAuth, getProductBySlug);

// Admin routes
router.post('/admin', protectAdmin, createProduct);
router.put('/admin/:id', protectAdmin, updateProduct);
router.patch('/admin/:id/availability', protectAdmin, updateProductAvailability);
router.delete('/admin/:id', protectAdmin, deleteProduct);

export default router;
