import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Booking, Place } from '../models';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any,
}) : null;

const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const serializePaymentDetails = (booking: any, place?: any) => ({
  id: booking._id?.toString?.() || booking.id,
  bookingNumber: booking.bookingNumber,
  totalAmount: booking.totalAmount,
  currency: booking.currency,
  paymentStatus: booking.paymentStatus,
  paymentMethod: booking.paymentMethod,
  status: booking.status,
  placeName: place?.nameAr || place?.nameEn || 'مكان سياحي',
  placeImage: place?.featuredImage,
  bookingDate: booking.bookingDate,
  startDate: booking.startDate || booking.bookingDate,
  endDate: booking.endDate || booking.startDate || booking.bookingDate,
  serviceType: booking.serviceType,
  canPay: booking.status === 'pending' && booking.paymentStatus === 'pending',
  requiresPayment: booking.status === 'pending',
});

const getBookingWithPlace = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId).lean();
  if (!booking) return null;

  const place = await Place.findById(booking.placeId).lean();
  return { booking, place };
};

export const createPaymentSession = async (req: any, res: Response) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'خدمة الدفع غير متوفرة حالياً',
      });
    }

    const { bookingId, currency = 'syp' } = req.body;
    const userId = String(req.user.id);

    const result = await getBookingWithPlace(bookingId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود',
      });
    }

    const { booking, place } = result;

    if (String(booking.userId) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول لهذا الحجز',
      });
    }

    if (booking.status !== 'pending' || booking.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'الحجز غير قابل للدفع',
      });
    }

    let amount = booking.totalAmount;
    let stripeCurrency: 'usd' | 'syp' = 'syp';

    if (String(currency).toLowerCase() === 'usd') {
      amount = Math.max(0.5, Math.round(booking.totalAmount / 4500));
      stripeCurrency = 'usd';
    } else {
      amount = Math.max(1000, booking.totalAmount);
    }

    const unitAmount = stripeCurrency === 'usd'
      ? Math.round(amount * 100)
      : Math.round(amount);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: stripeCurrency,
            unit_amount: unitAmount,
            product_data: {
              name: place?.nameAr || place?.nameEn || 'حجز سياحي',
              description: `حجز ${booking.serviceType} - ${new Date(booking.bookingDate).toLocaleDateString('ar-SA')}`,
              images: place?.featuredImage ? [place.featuredImage] : [],
            },
          },
        },
      ],
      success_url: `${frontendBaseUrl}/bookings?payment=success&booking_id=${booking._id}`,
      cancel_url: `${frontendBaseUrl}/bookings?payment=cancelled&booking_id=${booking._id}`,
      metadata: {
        bookingId: String(booking._id),
        userId,
        bookingNumber: booking.bookingNumber,
      },
    });

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      paymentData: {
        amount,
        currency: stripeCurrency,
        bookingNumber: booking.bookingNumber,
        placeName: place?.nameAr || place?.nameEn,
        bookingDate: booking.bookingDate,
      },
    });
  } catch (error: any) {
    console.error('Create payment session error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء جلسة الدفع',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(500).json({ error: 'Webhook configuration error' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error: any) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentMethod: 'stripe',
          transactionId: session.payment_intent?.toString?.() || session.id,
          confirmedAt: new Date(),
        });
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'failed',
          cancellationReason: 'انتهت صلاحية جلسة الدفع',
        });
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPaymentDetails = async (req: any, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = String(req.user.id);

    const result = await getBookingWithPlace(bookingId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود',
      });
    }

    const { booking, place } = result;

    if (String(booking.userId) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول لهذا الحجز',
      });
    }

    return res.json({
      success: true,
      data: serializePaymentDetails(booking, place),
    });
  } catch (error: any) {
    console.error('Get payment details error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل الدفع',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
