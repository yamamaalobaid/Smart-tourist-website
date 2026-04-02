import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChat extends Document {
  userId: Types.ObjectId;
  agentId?: Types.ObjectId;
  status: string;
  subject?: string;
  lastMessageAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active', enum: ['active', 'closed', 'resolved'] },
  subject: String,
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IChat>('Chat', ChatSchema);
