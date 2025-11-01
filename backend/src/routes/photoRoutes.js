import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';
import {
  uploadPhotos,
  deletePhoto,
  setPrimaryPhoto,
} from '../controllers/photoController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.post('/upload', uploadMultiple, uploadPhotos);
router.delete('/delete/:photoIndex', deletePhoto);
router.put('/primary/:photoIndex', setPrimaryPhoto);

export default router;

