import { Request, Response } from 'express';

interface LuggageRequest {
  id: string;
  userId?: number;
  from: string;
  to: string;
  status: string;
  createdAt: string;
}

const livingLuggageRequests: Record<string, LuggageRequest> = {};
const medicationSchedules: any[] = [];

const emergencyData: Record<string, any> = {
  default: {
    police: '112',
    ambulance: '123',
    fire: '180',
    embassy: '00961 1 XXXXXX',
    medicalTips: 'احمل دائمًا نسخة من وصفة الدواء في حالة الطوارئ.',
    languages: ['Arabic', 'English'],
  },
  "syria": {
    police: '112',
    ambulance: '113',
    fire: '115',
    embassy: '00963 11 222 333',
    medicalTips: 'استخدم مياه معقمة وابقى معك أدوية الحساسية.',
    languages: ['Arabic'],
  },
};

export const getEmergencyInfo = async (req: Request, res: Response) => {
  const country = (req.query.country as string || 'default').toLowerCase();
  const data = emergencyData[country] || emergencyData.default;

  return res.json({ success: true, data });
};

export const getEmergencyCallLink = async (req: Request, res: Response) => {
  const type = (req.query.type as string || 'ambulance').toLowerCase();
  const country = (req.query.country as string || 'default').toLowerCase();
  const data = emergencyData[country] || emergencyData.default;

  const number = data[type] || data.ambulance;
  return res.json({ success: true, data: { type, number, telLink: `tel:${number}` } });
};

export const searchShopping = async (req: Request, res: Response) => {
  const product = (req.query.product as string || '').toLowerCase();
  const items = [
    { id: 1, name: 'مطرقة خشبية', type: 'gift', available: true, shop: 'Souk Damascus' },
    { id: 2, name: 'عطر زيت الورد', type: 'perfume', available: true, shop: 'Old Bazaar' },
    { id: 3, name: 'مسبحة عقيق', type: 'jewelry', available: false, shop: 'Khan Asaad' },
  ];

  const found = product ? items.filter(i => i.name.toLowerCase().includes(product)) : items;
  return res.json({ success: true, data: found });
};

export const airportPickupOrder = async (req: Request, res: Response) => {
  const { userId, products, pickupAirport, hotel } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال المنتجات المطلوبة' });
  }

  return res.status(201).json({
    success: true,
    message: 'تم استلام طلب التسوق للمطار',
    data: { orderId: `AP-${Date.now()}`, userId, products, pickupAirport, hotel },
  });
};

export const getTransportOptions = async (req: Request, res: Response) => {
  const options = [
    { provider: 'Uber', eta: '3 min', cost: '40-50 SAR', type: 'ride-share' },
    { provider: 'Careem', eta: '4 min', cost: '35-45 SAR', type: 'ride-share' },
    { provider: 'Local Taxi', eta: '2 min', cost: '45-55 SAR', type: 'taxi' },
    { provider: 'City Bus', eta: '10 min', cost: '5 SAR', type: 'bus' },
  ];
  return res.json({ success: true, data: options });
};

export const bookTransport = async (req: Request, res: Response) => {
  const { provider, pickupAddress, destination } = req.body;
  if (!provider || !pickupAddress || !destination) {
    return res.status(400).json({ success: false, message: 'بيانات الحجز ناقصة' });
  }

  return res.status(201).json({
    success: true,
    message: 'تم حجز وسيلة النقل بنجاح',
    data: {
      bookingId: `TR-${Date.now()}`,
      provider,
      status: 'confirmed',
      pickupAddress,
      destination,
      eta: '5 min',
    },
  });
};

export const getNearbyHealthFacilities = async (req: Request, res: Response) => {
  const places = [
    { name: 'مستشفى المدينة', type: 'hospital', insuranceAccepted: true, distance: '1.2km' },
    { name: 'صيدلية العام', type: 'pharmacy', insuranceAccepted: true, distance: '0.8km' },
    { name: 'عيادة السياح', type: 'clinic', insuranceAccepted: false, distance: '2km' },
  ];
  return res.json({ success: true, data: places });
};

export const addMedicationSchedule = async (req: Request, res: Response) => {
  const { userId, medicationName, dosage, schedule } = req.body;

  if (!medicationName || !dosage || !schedule) {
    return res.status(400).json({ success: false, message: 'بيانات الدواء غير مكتملة' });
  }

  const record = {
    id: `MED-${Date.now()}`,
    userId,
    medicationName,
    dosage,
    schedule,
    timezone: req.body.timezone || 'UTC',
    createdAt: new Date().toISOString(),
  };

  medicationSchedules.push(record);

  return res.status(201).json({ success: true, message: 'تم إضافة جدول الدواء', data: record });
};

export const getMedicationSchedules = async (req: Request, res: Response) => {
  const userId = Number(req.query.userId || 0);
  const data = userId ? medicationSchedules.filter((it) => it.userId === userId) : medicationSchedules;
  return res.json({ success: true, data });
};

export const getRequiredVaccinations = async (req: Request, res: Response) => {
  const dest = (req.query.dest as string || 'unknown').toLowerCase();

  const data: Record<string, { name: string; recommended: boolean }[]> = {
    syria: [{ name: 'الحصبة', recommended: true }, { name: 'التهاب الكبد أ', recommended: true }],
    egypt: [{ name: 'شلل الأطفال', recommended: true }, { name: 'حمى التيفوئيد', recommended: true }],
    default: [{ name: 'إنفلونزا', recommended: false }],
  };

  return res.json({ success: true, data: data[dest] || data.default });
};

export const requestLuggageDelivery = async (req: Request, res: Response) => {
  const { userId, from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ success: false, message: 'يرجى تقديم معلومات موقع الاستلام والتسليم' });
  }

  const id = `LUG-${Date.now()}`;
  const record = {
    id,
    userId,
    from,
    to,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  livingLuggageRequests[id] = record;
  return res.status(201).json({ success: true, data: record, message: 'تم طلب خدمة نقل الأمتعة' });
};

export const trackLuggage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = livingLuggageRequests[id];

  if (!record) {
    return res.status(404).json({ success: false, message: 'طلب الأمتعة غير موجود' });
  }

  const progressSteps = ['pending', 'picked_up', 'in_transit', 'on_site', 'delivered'];
  const randomStatus = progressSteps[Math.min(progressSteps.length - 1, Math.floor(Math.random() * progressSteps.length))];
  record.status = randomStatus;

  return res.json({ success: true, data: record });
};

export const getAnalyticsReport = async (req: Request, res: Response) => {
  const range = (req.query.range as string || 'monthly').toLowerCase();
  const report = {
    range,
    expenses: range === 'yearly' ? 1200 : 100,
    placesVisited: range === 'yearly' ? 35 : 3,
    reviewsWritten: range === 'yearly' ? 12 : 1,
  };

  return res.json({ success: true, data: report });
};

export const getPersonalRecommendations = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: [
      { id: 1, name: 'مدينة حلب القديمة', category: 'heritage', reason: 'مطابقة لاهتماماتك السابقة' },
      { id: 2, name: 'البحر الميت', category: 'relax', reason: 'يتوافق مع نشاطك الأخير' },
    ],
  });
};

export const getTimeMirror = async (req: Request, res: Response) => {
  const placeId = req.params.placeId;
  const year = Number(req.query.year || 1970);

  return res.json({
    success: true,
    data: {
      placeId,
      year,
      currentImage: `https://example.com/places/${placeId}/current.jpg`,
      historicalImage: `https://example.com/places/${placeId}/${year}.jpg`,
      description: `عرض طبقات زمنية لموقع #${placeId} لعام ${year}`,
    },
  });
};
