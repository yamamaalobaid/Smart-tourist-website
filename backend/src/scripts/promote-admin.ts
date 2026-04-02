import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.mongo';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/damascus_tour_guide';

const promoteUser = async (email: string) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log(`✅ User ${email} promoted to admin successfully!`);
      console.log('User details:', result);
    } else {
      console.log(`❌ User with email ${email} not found.`);
    }

  } catch (error) {
    console.error('❌ Error promoting user:', error);
  } finally {
    await mongoose.connection.close();
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx ts-node promote-admin.ts <email>');
  process.exit(1);
}

promoteUser(email);
