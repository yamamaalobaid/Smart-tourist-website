import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  messageType: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messageType: { type: String, default: 'text', enum: ['text', 'image', 'location', 'file'] },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
