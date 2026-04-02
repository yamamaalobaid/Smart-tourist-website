const mongoose = require('mongoose');
require('dotenv').config();

const testSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/damascus-tour-guide');
    console.log('✅ Connected to MongoDB');

    const User = require('./src/models/User.mongo');

    // Simple test data
    const testUser = {
      _id: '507f1f77bcf86cd799439999',
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      phone: '+963999999999',
      language: 'ar',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await User.create(testUser);
    console.log('✅ Test user created');

    await mongoose.connection.close();
    console.log('✅ Connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testSeed();