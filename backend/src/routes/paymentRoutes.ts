import express from 'express';
import { protect } from '../middleware/auth';
import {
  createPaymentSession,
  getPaymentDetails,
} from '../controllers/paymentController';

const router = express.Router();

router.use(protect);

router.post('/create-session', createPaymentSession);
router.get('/booking/:bookingId', getPaymentDetails);

export default router;
