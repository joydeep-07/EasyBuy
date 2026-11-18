import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryAttributes,
  addCategoryAttribute,
  updateCategoryAttribute,
  deleteCategoryAttribute,
} from '../controllers/categoryController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.get('/:id/attributes', getCategoryAttributes);

// Admin category management
router.post('/admin', protectAdmin, createCategory);
router.put('/admin/:id', protectAdmin, updateCategory);
router.delete('/admin/:id', protectAdmin, deleteCategory);

// Admin dynamic attributes management
router.post('/admin/:id/attributes', protectAdmin, addCategoryAttribute);
router.put('/admin/attributes/:id', protectAdmin, updateCategoryAttribute);
router.delete('/admin/attributes/:id', protectAdmin, deleteCategoryAttribute);

export default router;
