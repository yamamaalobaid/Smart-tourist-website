import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  placeId: Types.ObjectId;
  category?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  category: { type: String, enum: ['want_to_visit', 'visited', 'favorite'], default: 'favorite' },
  notes: String,
}, { timestamps: true });

FavoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
