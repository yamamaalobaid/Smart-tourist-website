import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  placeId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  commentAr?: string;
  commentEn?: string;
  images?: string[];
  helpfulCount: number;
  isVerifiedVisit: boolean;
  visitDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>({
  placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  commentAr: String,
  commentEn: String,
  images: { type: [String], default: [] },
  helpfulCount: { type: Number, default: 0 },
  isVerifiedVisit: { type: Boolean, default: false },
  visitDate: Date,
}, { timestamps: true });

ReviewSchema.index({ userId: 1, placeId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
