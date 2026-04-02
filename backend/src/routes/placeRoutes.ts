import express from 'express';
import {
  getPlaces,
  getPlaceById,
  getReviews,
  createPlace,
  updatePlace,
  deletePlace,
  addToFavorites,
  removeFromFavorites,
  addReview,
  updateReview,
  deleteReview,
} from '../controllers/placeController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getPlaces)
  .post(protect, authorize('admin'), createPlace);

router.route('/:id')
  .get(getPlaceById)
  .put(protect, authorize('admin'), updatePlace)
  .delete(protect, authorize('admin'), deletePlace);

// Favorites routes
router.post('/:id/favorites', protect, addToFavorites);
router.delete('/:id/favorites', protect, removeFromFavorites);

// Reviews routes
router.route('/:id/reviews')
  .get(getReviews)
  .post(protect, addReview);
router.put('/:id/reviews/:reviewId', protect, updateReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

export default router;