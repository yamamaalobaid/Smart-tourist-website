import express from 'express';
import { protect } from '../middleware/auth';
import {
  getEmergencyInfo,
  getEmergencyCallLink,
  searchShopping,
  airportPickupOrder,
  getTransportOptions,
  bookTransport,
  getNearbyHealthFacilities,
  addMedicationSchedule,
  getMedicationSchedules,
  getRequiredVaccinations,
  requestLuggageDelivery,
  trackLuggage,
  getAnalyticsReport,
  getPersonalRecommendations,
  getTimeMirror,
} from '../controllers/travelAssistantController';

const router = express.Router();

router.get('/emergency', getEmergencyInfo);
router.get('/emergency/call', getEmergencyCallLink);
router.get('/shopping', searchShopping);
router.post('/shopping/airport-pickup', protect, airportPickupOrder);
router.get('/transport/options', getTransportOptions);
router.post('/transport/book', protect, bookTransport);
router.get('/health/nearby', getNearbyHealthFacilities);
router.post('/health/medications', protect, addMedicationSchedule);
router.get('/health/medications', protect, getMedicationSchedules);
router.get('/health/vaccines', getRequiredVaccinations);
router.post('/luggage/request', protect, requestLuggageDelivery);
router.get('/luggage/:id/track', protect, trackLuggage);
router.get('/analytics/report', protect, getAnalyticsReport);
router.get('/analytics/recommendations', protect, getPersonalRecommendations);
router.get('/time-mirror/:placeId', getTimeMirror);

export default router;
