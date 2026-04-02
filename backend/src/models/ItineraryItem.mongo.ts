import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IItineraryItem extends Document {
  itineraryDayId: Types.ObjectId;
  placeId: Types.ObjectId;
  startTime?: string;
  endTime?: string;
  transportMode?: string;
  notes?: string;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ItineraryItemSchema = new Schema<IItineraryItem>({
  itineraryDayId: { type: Schema.Types.ObjectId, ref: 'ItineraryDay', required: true },
  placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  startTime: String,
  endTime: String,
  transportMode: { type: String, enum: ['walk', 'car', 'bus', 'taxi', 'metro'] },
  notes: String,
  orderIndex: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IItineraryItem>('ItineraryItem', ItineraryItemSchema);
