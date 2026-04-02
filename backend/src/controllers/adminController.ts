import { Request, Response } from 'express';
import User from '../models/User.mongo';
import Place from '../models/Place.mongo';
import Booking from '../models/Booking.mongo';
import Review from '../models/Review.mongo';

// --- User Management ---

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Place Management ---

export const getAllPlaces = async (req: Request, res: Response) => {
  try {
    console.log('@@@ [admin] Fetching all places...');
    const places = await Place.find();
    console.log(`@@@ [admin] Found ${places.length} places`);
    res.json({ success: true, data: places });
  } catch (error: any) {
    console.error('@@@ [admin] Error fetching places:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlace = async (req: Request, res: Response) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json({ success: true, data: place });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const place = await Place.findByIdAndUpdate(id, req.body, { new: true });
    if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, data: place });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const place = await Place.findByIdAndDelete(id);
    if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, message: 'Place deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Review Management ---

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().populate('userId', 'firstName lastName email').populate('placeId', 'nameAr nameEn');
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Booking Management ---

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().populate('userId', 'firstName lastName email').populate('placeId', 'nameAr nameEn');
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
