import express from 'express';
import { adminLogin, adminLogout, getAdminProfile, getAdminDashboard } from '../controllers/adminAuthController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/me', protectAdmin, getAdminProfile);
router.get('/dashboard', protectAdmin, getAdminDashboard);

export default router;
