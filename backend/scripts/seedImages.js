const mongoose = require('mongoose');
require('dotenv').config();

const images = {
  'Old City': [
    'https://images.unsplash.com/photo-1549213821-4708d50a0a1a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-160571217036ea-324316a3a41e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582233479366-6d38bc390a08?q=80&w=1200&auto=format&fit=crop'
  ],
  'Umayyad Mosque': [
    'https://images.unsplash.com/photo-1518974780517-578498877f8a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop'
  ],
  'Souq Al-Hamidiyah': [
    'https://images.unsplash.com/photo-1577717903315-101188331191?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516905?q=80&w=1200&auto=format&fit=crop'
  ],
  'Restaurant': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop'
  ],
  'Hotel': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop'
  ],
  'Default': [
    'https://images.unsplash.com/photo-1549213821-4708d50a0a1a?q=80&w=1200&auto=format&fit=crop'
  ]
};

const getCategoryLink = (category) => {
  if (category.includes('Old City') || category.includes('تاريخي')) return images['Old City'];
  if (category.includes('Mosque') || category.includes('جامع')) return images['Umayyad Mosque'];
  if (category.includes('Souq') || category.includes('سوق')) return images['Souq Al-Hamidiyah'];
  if (category.includes('Restaurant') || category.includes('مطعم')) return images['Restaurant'];
  if (category.includes('Hotel') || category.includes('فندق')) return images['Hotel'];
  return images['Default'];
};

const seedImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/damascus_tour_guide');
    console.log('✅ Connected to MongoDB');

    const Place = require('../src/models/Place.mongo').default;
    const PlaceImage = require('../src/models/PlaceImage.mongo').default;
    const User = require('../src/models/User.mongo').default;

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        console.log('❌ No admin user found. Create one first.');
        return;
    }

    const places = await Place.find();
    console.log(`Found ${places.length} places. Updating images...`);

    for (const place of places) {
      const categoryImages = getCategoryLink(place.category);
      const featuredImage = categoryImages[0];
      
      // Update place featured image
      place.featuredImage = featuredImage;
      await place.save();

      // Create PlaceImage records
      for (const imgUrl of categoryImages) {
        const existing = await PlaceImage.findOne({ placeId: place._id, imageUrl: imgUrl });
        if (!existing) {
          await PlaceImage.create({
            placeId: place._id,
            imageUrl: imgUrl,
            captionAr: `صورة لـ ${place.nameAr}`,
            captionEn: `Image of ${place.nameEn}`,
            isPrimary: imgUrl === featuredImage,
            uploadedBy: admin._id
          });
        }
      }
      console.log(`  - Updated ${place.nameAr}`);
    }

    console.log('✅ Image seeding complete');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding images:', error);
  }
};

seedImages();
