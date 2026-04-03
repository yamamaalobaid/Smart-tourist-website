import { Request, Response } from 'express';
import { Booking, Place, User, PlaceImage } from '../models';
import emailService from '../services/emailService';

const serializeBooking = (booking: any, place?: any) => ({
  id: booking._id?.toString?.() || booking.id,
  bookingNumber: booking.bookingNumber,
  placeId: booking.placeId?.toString?.() || booking.placeId,
  placeName: place?.nameAr || place?.nameEn || 'مكان سياحي',
  startDate: booking.startDate || booking.bookingDate,
  endDate: booking.endDate || booking.startDate || booking.bookingDate,
  bookingDate: booking.bookingDate,
  guests: booking.numberOfGuests,
  numberOfGuests: booking.numberOfGuests,
  totalPrice: booking.totalAmount,
  totalAmount: booking.totalAmount,
  currency: booking.currency,
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  paymentMethod: booking.paymentMethod,
  transactionId: booking.transactionId,
  notes: booking.specialRequests || '',
  specialRequests: booking.specialRequests,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
  place: place ? {
    id: place._id,
    nameAr: place.nameAr,
    nameEn: place.nameEn,
    category: place.category,
    addressAr: place.addressAr,
    addressEn: place.addressEn,
    featuredImage: place.featuredImage,
    mainImage: null,
  } : undefined,
});

// إنشاء حجز جديد
export const createBooking = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      placeId,
      serviceType = 'tour',
      bookingDate,
      startDate,
      endDate,
      numberOfGuests,
      guests,
      specialRequests,
      notes,
    } = req.body;

    const normalizedStartDate = startDate || bookingDate;
    const normalizedEndDate = endDate || normalizedStartDate;
    const normalizedGuests = Number(numberOfGuests ?? guests ?? 1);
    const normalizedNotes = specialRequests ?? notes ?? null;

    // التحقق من الحقول المطلوبة
    if (!placeId || !serviceType || !normalizedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'المكان ونوع الخدمة وتاريخ الحجز مطلوبون',
      });
    }

    // التحقق من وجود المكان
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'المكان غير موجود',
      });
    }

    // التحقق من تاريخ الحجز
    const bookingDateObj = new Date(normalizedStartDate);
    const endDateObj = new Date(normalizedEndDate);
    if (Number.isNaN(bookingDateObj.getTime()) || Number.isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'تواريخ الحجز غير صالحة',
      });
    }

    if (endDateObj < bookingDateObj) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
      });
    }

    if (bookingDateObj < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن الحجز في تاريخ ماضي',
      });
    }

    if (!Number.isFinite(normalizedGuests) || normalizedGuests < 1) {
      return res.status(400).json({
        success: false,
        message: 'عدد الضيوف يجب أن يكون 1 على الأقل',
      });
    }

    // إنشاء رقم حجز فريد
    const bookingNumber = `DAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // حساب السعر
    const nights = Math.max(
      1,
      Math.ceil((endDateObj.getTime() - bookingDateObj.getTime()) / (1000 * 60 * 60 * 24))
    );
    const baseAmount = place.entryFee || 0;
    const totalAmount = baseAmount * normalizedGuests * nights;

    // إنشاء الحجز
    const bookingData: any = {
      bookingNumber,
      userId,
      placeId,
      serviceType,
      startDate: bookingDateObj,
      endDate: endDateObj,
      bookingDate: bookingDateObj,
      numberOfGuests: normalizedGuests,
      totalAmount,
      currency: 'SYP',
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: normalizedNotes,
    };

    const booking = await Booking.create(bookingData);

    // إرسال بريد التأكيد
    try {
      // استخدم as any للوصول إلى الدالة
      const emailSvc = emailService as any;
      if (emailSvc.sendBookingConfirmationEmail) {
        await emailSvc.sendBookingConfirmationEmail(req.user.email, {
          bookingNumber: booking.bookingNumber,
          placeName: place.nameAr,
          bookingDate: booking.bookingDate,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          serviceType: booking.serviceType,
        });
      } else {
        // استخدم البديل
        await emailService.sendNotificationEmail(
          req.user.email,
          'تم تأكيد حجزك! ✅',
          `شكراً لحجزك في ${place.nameAr}. رقم حجزك هو ${booking.bookingNumber}.`,
          `/bookings/${booking.id}`
        );
      }
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحجز بنجاح',
      data: serializeBooking(booking.toObject(), place),
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الحجز',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// الحصول على حجوزات المستخدم
export const getUserBookings = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    const count = await Booking.countDocuments(where);
    const bookings = await Booking.find(where)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limitNum)
      .lean();

    const placeIds = bookings.map((booking: any) => booking.placeId);
    const places = await Place.find({ _id: { $in: placeIds } }).lean();
    const placeMap = new Map(places.map((p: any) => [p._id.toString(), p]));

    // تنسيق البيانات المرتجعة
    const formattedBookings = bookings.map((booking: any) => {
      const place = placeMap.get(booking.placeId.toString());
      return serializeBooking(booking, place);
    });

    res.json({
      success: true,
      count,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
        hasNextPage: pageNum < Math.ceil(count / limitNum),
        hasPrevPage: pageNum > 1,
      },
      data: formattedBookings,
    });
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الحجوزات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// الحصول على حجز محدد
export const getBookingById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: id, userId }).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود',
      });
    }

    res.json({
      success: true,
      data: serializeBooking(booking),
    });
  } catch (error: any) {
    console.error('Get booking by id error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل الحجز',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// تحديث الحجز (للمستخدم)
export const updateBooking = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { numberOfGuests, specialRequests } = req.body;

    const booking = await Booking.findOne({ _id: id, userId, status: 'pending' });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود أو غير قابل للتعديل',
      });
    }

    // التحقق من وقت التعديل (قبل 48 ساعة على الأقل)
    const bookingDate = new Date(booking.startDate || booking.bookingDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 48) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل الحجز قبل أقل من 48 ساعة من الموعد',
      });
    }

    // تحديث البيانات
    const updateData: any = {};
    if (numberOfGuests !== undefined) {
      updateData.numberOfGuests = numberOfGuests;
      
      // إعادة حساب السعر إذا تغير عدد الضيوف
      if (booking.serviceType === 'hotel') {
        const place = await Place.findById(booking.placeId);
        if (place) {
          updateData.totalAmount = (place.entryFee || 10000) * numberOfGuests;
        }
      }
    }
    
    if (specialRequests !== undefined) {
      updateData.specialRequests = specialRequests || null;
    }

    booking.set(updateData);
    await booking.save();

    res.json({
      success: true,
      message: 'تم تحديث الحجز بنجاح',
      data: serializeBooking(booking.toObject()),
    });
  } catch (error: any) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الحجز',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// إلغاء الحجز
export const cancelBooking = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { cancellationReason } = req.body;

    const booking = await Booking.findOne({
      _id: id,
      userId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود أو غير قابل للإلغاء',
      });
    }

    // التحقق من وقت الإلغاء (قبل 24 ساعة على الأقل)
    const bookingDate = new Date(booking.startDate || booking.bookingDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إلغاء الحجز قبل أقل من 24 ساعة من الموعد',
      });
    }

    // إلغاء الحجز
    const updateData: any = {
      status: 'cancelled',
      cancellationReason: cancellationReason || null,
      cancelledAt: new Date(),
    };

    Object.assign(booking, updateData);
    await booking.save();

    // إرسال بريد إلغاء الحجز
    try {
      const place = await Place.findById(booking.placeId);
      await emailService.sendNotificationEmail(
        req.user.email,
        'تم إلغاء حجزك 🚫',
        `تم إلغاء حجزك رقم ${booking.bookingNumber} في ${place?.nameAr || 'المكان'}.`,
        `/bookings/${booking.id}`
      );
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'تم إلغاء الحجز بنجاح',
      data: serializeBooking(booking.toObject()),
    });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إلغاء الحجز',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// تأكيد الحجز (للمسؤولين أو عند الدفع)
export const confirmBooking = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود',
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'الحجز غير قابل للتأكيد',
      });
    }

    // تأكيد الحجز
    const updateData: any = {
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'cash',
      transactionId: transactionId || null,
      confirmedAt: new Date(),
    };

    booking.set(updateData);
    await booking.save();

    // إرسال بريد التأكيد
    try {
      const place = await Place.findById(booking.placeId);
      // استخدم as any للوصول إلى user
      const bookingWithUser = booking as any;
      if (place && bookingWithUser.user?.email) {
        await emailService.sendNotificationEmail(
          bookingWithUser.user.email,
          'تم تأكيد حجزك! ✅',
          `تم تأكيد حجزك رقم ${booking.bookingNumber} في ${place.nameAr}.`,
          `/bookings/${booking.id}`
        );
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'تم تأكيد الحجز بنجاح',
      data: serializeBooking(booking.toObject()),
    });
  } catch (error: any) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تأكيد الحجز',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// إتمام الحجز (بعد الزيارة)
export const completeBooking = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود',
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'الحجز غير قابل للإتمام',
      });
    }

    // التحقق من أن تاريخ الحجز قد مضى
    const bookingDate = new Date(booking.startDate || booking.bookingDate);
    const now = new Date();
    
    if (bookingDate > now) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إتمام الحجز قبل تاريخه',
      });
    }

    // إتمام الحجز - استخدم as any لتجاوز مشكلة TypeScript
    const updateData: any = {
      status: 'completed',
      completedAt: new Date(),
    };

    booking.set(updateData);
    await booking.save();

    res.json({
      success: true,
      message: 'تم إتمام الحجز بنجاح',
      data: serializeBooking(booking.toObject()),
    });
  } catch (error: any) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إتمام الحجز',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// الحصول على جميع الحجوزات (للمسؤولين)
export const getAllBookings = async (req: any, res: Response) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate,
      userId,
      placeId 
    } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (placeId) {
      where.placeId = placeId;
    }

    // فلترة حسب التاريخ
    if (startDate || endDate) {
      where.bookingDate = {} as any;
      if (startDate) {
        where.bookingDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        where.bookingDate.$lte = new Date(endDate as string);
      }
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    const count = await Booking.countDocuments(where);
    const bookings = await Booking.find(where)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limitNum)
      .lean();

    const userIds = bookings.map((b: any) => b.userId);
    const placeIds = bookings.map((b: any) => b.placeId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const places = await Place.find({ _id: { $in: placeIds } }).lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    const placeMap = new Map(places.map((p: any) => [p._id.toString(), p]));

    const stats = {
      total: await Booking.countDocuments(),
      pending: await Booking.countDocuments({ status: 'pending' }),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
      totalRevenue: ((await Booking.aggregate([
        { $match: { status: 'confirmed', paymentStatus: 'paid' } },
        { $group: { _id: null, sum: { $sum: '$totalAmount' } } }
      ]))?.[0]?.sum) || 0,
    };

    const formattedBookings = bookings.map((booking: any) => ({
      ...booking,
      user: userMap.get(booking.userId?.toString()),
      place: placeMap.get(booking.placeId?.toString()),
    }));

    res.json({
      success: true,
      count,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
      data: formattedBookings,
    });
  } catch (error: any) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الحجوزات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
