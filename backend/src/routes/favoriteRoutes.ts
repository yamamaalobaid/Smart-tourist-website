import express from 'express';
import { getFavorites } from '../controllers/favoriteController';
import { protect } from '../middleware/auth';

const router = express.Router();

// GET /api/favorites
router.get('/', protect, getFavorites);

export default router;
