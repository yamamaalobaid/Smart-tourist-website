import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Place, Review, Favorite, Booking, Itinerary, Chat, Message } from './src/models/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/damascus_tour_guide';

async function showDatabaseData() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('📊 بيانات قاعدة البيانات MongoDB:\n');

    // Users
    const users = await User.find().select('firstName lastName email isVerified').limit(5);
    console.log('👥 المستخدمون:', users.length);
    users.forEach(user => console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`));

    // Places
    const places = await Place.find().select('nameAr category').limit(5);
    console.log('\n🏛️ الأماكن:', places.length);
    places.forEach(place => console.log(`  - ${place.nameAr} (${place.category})`));

    // Reviews
    const reviews = await Review.find().select('rating comment').limit(3);
    console.log('\n⭐ المراجعات:', reviews.length);
    reviews.forEach(review => console.log(`  - تقييم: ${review.rating}/5`));

    // Favorites
    const favorites = await Favorite.find().select('category').limit(3);
    console.log('\n❤️ المفضلة:', favorites.length);
    favorites.forEach(fav => console.log(`  - فئة: ${fav.category}`));

    // Bookings
    const bookings = await Booking.find().select('status bookingNumber').limit(3);
    console.log('\n📅 الحجوزات:', bookings.length);
    bookings.forEach(booking => console.log(`  - رقم الحجز: ${booking.bookingNumber} (${booking.status})`));

    // Itineraries
    const itineraries = await Itinerary.find().select('titleAr isPublic').limit(3);
    console.log('\n🗺️ الرحلات:', itineraries.length);
    itineraries.forEach(it => console.log(`  - ${it.titleAr} (${it.isPublic ? 'عامة' : 'خاصة'})`));

    // Chats
    const chats = await Chat.find().select('subject status').limit(3);
    console.log('\n💬 المحادثات:', chats.length);
    chats.forEach(chat => console.log(`  - ${chat.subject} (${chat.status})`));

    // Messages
    const messages = await Message.find().select('content messageType').limit(3);
    console.log('\n📨 الرسائل:', messages.length);
    messages.forEach(msg => console.log(`  - ${msg.content.substring(0, 50)}... (${msg.messageType})`));

    console.log('\n✅ انتهى عرض البيانات');

  } catch (error) {
    console.error('❌ خطأ في عرض البيانات:', error);
  } finally {
    await mongoose.disconnect();
  }
}

showDatabaseData();