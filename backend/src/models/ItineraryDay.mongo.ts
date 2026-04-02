import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IItineraryDay extends Document {
  itineraryId: Types.ObjectId;
  dayNumber: number;
  date: Date;
  titleAr?: string;
  titleEn?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ItineraryDaySchema = new Schema<IItineraryDay>({
  itineraryId: { type: Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  dayNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  titleAr: String,
  titleEn: String,
  notes: String,
}, { timestamps: true });

export default mongoose.model<IItineraryDay>('ItineraryDay', ItineraryDaySchema);
