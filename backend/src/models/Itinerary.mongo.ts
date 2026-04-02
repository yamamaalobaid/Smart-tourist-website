import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IItinerary extends Document {
  userId: Types.ObjectId;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  startDate: Date;
  endDate: Date;
  isPublic: boolean;
  likesCount: number;
  viewsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ItinerarySchema = new Schema<IItinerary>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  titleAr: String,
  titleEn: String,
  descriptionAr: String,
  descriptionEn: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isPublic: { type: Boolean, default: false },
  likesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
