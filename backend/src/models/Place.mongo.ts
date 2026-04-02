import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  category: string;
  addressAr?: string;
  addressEn?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  entryFee?: number;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  averageRating: number;
  totalReviews: number;
  featuredImage?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlaceSchema = new Schema<IPlace>({
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  descriptionAr: String,
  descriptionEn: String,
  category: { type: String, required: true },
  addressAr: String,
  addressEn: String,
  latitude: Number,
  longitude: Number,
  openingHours: String,
  entryFee: { type: Number, default: 0 },
  contactPhone: String,
  contactEmail: String,
  website: String,
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  featuredImage: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IPlace>('Place', PlaceSchema);
