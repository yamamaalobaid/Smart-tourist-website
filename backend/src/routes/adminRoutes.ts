import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  getAllReviews,
  deleteReview,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/adminController';

const router = express.Router();

// All routes here require being logged in and having the 'admin' role
router.use(protect);
router.use(authorize('admin'));

// User routes
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Place routes
router.get('/places', getAllPlaces);
router.post('/places', createPlace);
router.put('/places/:id', updatePlace);
router.delete('/places/:id', deletePlace);

// Review routes
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Booking routes
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

export default router;
