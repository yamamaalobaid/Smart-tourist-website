import mongoose from 'mongoose';
import User from './src/models/User.mongo';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/damascus_tour_guide';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ email: 'admin@damascus.com' });
    if (user) {
      console.log('User found:', {
        email: user.email,
        role: user.role,
        passwordHash: user.password
      });
      const isMatch = await bcrypt.compare('password123', user.password);
      console.log('Password match ("password123"):', isMatch);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

test();
