import { Request, Response } from 'express';
import { Itinerary, ItineraryDay, ItineraryItem, Place, User } from '../models';

// Minimal itinerary controller for MongoDB migration
export const createItinerary = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { titleAr, startDate, endDate } = req.body;
    if (!userId || !titleAr || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'missing required fields' });
    }

    const itinerary = await Itinerary.create({
      userId,
      titleAr,
      titleEn: req.body.titleEn || null,
      descriptionAr: req.body.descriptionAr || null,
      descriptionEn: req.body.descriptionEn || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isPublic: req.body.isPublic || false,
      likesCount: 0,
      viewsCount: 0,
    });

    res.status(201).json({ success: true, data: itinerary });
  } catch (error: any) {
    console.error('createItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getUserItineraries = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const filter: any = { userId };
    if (req.query.isPublic !== undefined) filter.isPublic = String(req.query.isPublic) === 'true';

    const count = await Itinerary.countDocuments(filter);
    const itineraries = await Itinerary.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

    res.json({ success: true, count, data: itineraries, pagination: { page, limit, totalPages: Math.ceil(count / limit) } });
  } catch (error: any) {
    console.error('getUserItineraries:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getPublicItineraries = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;

    const filter: any = { isPublic: true };
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { titleAr: regex },
        { titleEn: regex },
        { descriptionAr: regex },
        { descriptionEn: regex },
      ];
    }

    const count = await Itinerary.countDocuments(filter);
    const itineraries = await Itinerary.find(filter)
      .populate('user', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, count, data: itineraries, pagination: { page, limit, totalPages: Math.ceil(count / limit) } });
  } catch (error: any) {
    console.error('getPublicItineraries:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getItinerary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itinerary = await Itinerary.findById(id)
      .populate('user', 'firstName lastName avatarUrl')
      .lean();

    if (!itinerary) return res.status(404).json({ success: false, message: 'Itinerary not found' });

    // Get days and items
    const days = await ItineraryDay.find({ itineraryId: id })
      .populate({
        path: 'items',
        populate: { path: 'place', select: 'nameAr nameEn category featuredImage' }
      })
      .sort({ dayNumber: 1 })
      .lean();

    res.json({ success: true, data: { ...itinerary, days } });
  } catch (error: any) {
    console.error('getItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateItinerary = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    ).lean();

    if (!itinerary) return res.status(404).json({ success: false, message: 'Itinerary not found' });

    res.json({ success: true, data: itinerary });
  } catch (error: any) {
    console.error('updateItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteItinerary = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const itinerary = await Itinerary.findOneAndDelete({ _id: id, userId });
    if (!itinerary) return res.status(404).json({ success: false, message: 'Itinerary not found' });

    // Delete associated days and items
    await ItineraryDay.deleteMany({ itineraryId: id });
    await ItineraryItem.deleteMany({ itineraryId: id });

    res.json({ success: true, message: 'Itinerary deleted' });
  } catch (error: any) {
    console.error('deleteItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const copyItinerary = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const src = await Itinerary.findById(id);
    if (!src) return res.status(404).json({ success: false, message: 'Not found' });
    const copy = await Itinerary.create({ ...src, userId: req.user?.id, likesCount: 0, viewsCount: 0, _id: undefined });
    res.status(201).json({ success: true, data: copy });
  } catch (error: any) {
    console.error('copyItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const shareItinerary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itinerary = await Itinerary.findByIdAndUpdate(id, { isPublic: true }, { new: true }).lean();
    if (!itinerary) return res.status(404).json({ success: false, message: 'Itinerary not found' });
    res.json({ success: true, data: itinerary });
  } catch (error: any) {
    console.error('shareItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const likeItinerary = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const itinerary = await Itinerary.findByIdAndUpdate(id, { $inc: { likesCount: 1 } }, { new: true }).lean();
    if (!itinerary) return res.status(404).json({ success: false, message: 'Itinerary not found' });
    res.json({ success: true, data: itinerary });
  } catch (error: any) {
    console.error('likeItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const addDayToItinerary = async (req: any, res: Response) => {
  try {
    const { itineraryId } = req.params;
    const { dayNumber, date } = req.body;

    const day = await ItineraryDay.create({
      itineraryId,
      dayNumber,
      date: new Date(date),
    });

    res.status(201).json({ success: true, data: day });
  } catch (error: any) {
    console.error('addDayToItinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const addItemToDay = async (req: any, res: Response) => {
  try {
    const { dayId } = req.params;
    const { placeId, timeStart, timeEnd, notes } = req.body;

    const item = await ItineraryItem.create({
      itineraryId: req.body.itineraryId,
      dayId,
      placeId,
      timeStart,
      timeEnd,
      notes,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    console.error('addItemToDay:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};