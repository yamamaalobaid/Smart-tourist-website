import express from 'express';
import { protect } from '../middleware/auth';
import {
  createItinerary,
  getUserItineraries,
  getPublicItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  likeItinerary,
  addDayToItinerary,
  addItemToDay,
  shareItinerary,
  copyItinerary,
} from '../controllers/itineraryController';

const router = express.Router();

console.log('itinerary handlers:', {
  createItinerary,
  getUserItineraries,
  getPublicItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  likeItinerary,
  addDayToItinerary,
  addItemToDay,
  shareItinerary,
  copyItinerary,
});

router.post('/', protect, createItinerary);
router.get('/me', protect, getUserItineraries);
router.get('/public', getPublicItineraries);
router.get('/:id', getItinerary);
router.put('/:id', protect, updateItinerary);
router.delete('/:id', protect, deleteItinerary);
router.post('/:id/like', protect, likeItinerary);
router.post('/:id/days', protect, addDayToItinerary);
router.post('/days/:dayId/items', protect, addItemToDay);
router.get('/:id/share', shareItinerary);
router.post('/:id/copy', protect, copyItinerary);

export default router;
