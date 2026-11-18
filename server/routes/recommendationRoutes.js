import express from 'express';
import { getRecommendations, getProductRelated } from '../controllers/recommendationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getRecommendations);
router.get('/products/:id/related', getProductRelated);

export default router;
