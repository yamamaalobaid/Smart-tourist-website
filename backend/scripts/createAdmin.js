const mongoose = require('mongoose');
require('dotenv').config();

const testSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/damascus_tour_guide');
    console.log('✅ Connected to MongoDB');

    const User = require('../src/models/User.mongo').default;

    let adminUser = await User.findOne({ email: 'admin@damascus.com' });
    
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.password = 'admin123';
      await adminUser.save();
      console.log('✅ Admin user updated: admin@damascus.com / admin123');
    } else {
      adminUser = new (User)({
        firstName: 'المدير',
        lastName: 'العام',
        email: 'admin@damascus.com',
        password: 'admin123',
        phone: '+963999999000',
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
      console.log('✅ Admin user created: admin@damascus.com / admin123');
    }

    await mongoose.connection.close();
    console.log('✅ Connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testSeed();
