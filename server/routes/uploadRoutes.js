import express from 'express';
import { upload } from '../middleware/upload.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Upload multiple product images
router.post('/multiple', protectAdmin, upload.array('images', 8), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const urls = req.files.map((file) => `${protocol}://${host}/uploads/${file.filename}`);

    res.status(200).json({
      success: true,
      urls,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
