import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPlaceImage extends Document {
  placeId: Types.ObjectId;
  imageUrl: string;
  captionAr?: string;
  captionEn?: string;
  isPrimary: boolean;
  displayOrder: number;
  uploadedBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlaceImageSchema = new Schema<IPlaceImage>({
  placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  imageUrl: { type: String, required: true },
  captionAr: String,
  captionEn: String,
  isPrimary: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 1 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IPlaceImage>('PlaceImage', PlaceImageSchema);
