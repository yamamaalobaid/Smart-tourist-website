import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  bookingNumber: string;
  userId: Types.ObjectId;
  placeId: Types.ObjectId;
  serviceType: string;
  startDate?: Date;
  endDate?: Date;
  bookingDate: Date;
  numberOfGuests: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  specialRequests?: string;
  cancellationReason?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>({
  bookingNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  serviceType: { type: String, required: true, enum: ['tour', 'hotel', 'restaurant', 'activity', 'transport'] },
  startDate: Date,
  endDate: Date,
  bookingDate: { type: Date, required: true },
  numberOfGuests: { type: Number, required: true, default: 1 },
  totalAmount: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true, default: 'SYP' },
  status: { type: String, required: true, default: 'pending', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
  paymentStatus: { type: String, required: true, default: 'pending', enum: ['pending', 'paid', 'failed', 'refunded'] },
  paymentMethod: String,
  transactionId: String,
  specialRequests: String,
  cancellationReason: String,
  confirmedAt: Date,
  cancelledAt: Date,
  completedAt: Date,
}, { timestamps: true });

BookingSchema.index({ bookingNumber: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
