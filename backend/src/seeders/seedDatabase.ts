import { User, Place, PlaceImage, Review, Favorite, Booking, Itinerary, ItineraryDay, ItineraryItem, Chat, Message, Notification } from '../models';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding database with test data...');

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      email: 'ahmed@damascus.com',
      password: hashedPassword,
      firstName: 'أحمد',
      lastName: 'محمود',
      phone: '+963987654321',
      language: 'ar',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      isVerified: true,
    });

    const user2 = await User.create({
      email: 'fatima@damascus.com',
      password: hashedPassword,
      firstName: 'فاطمة',
      lastName: 'علي',
      phone: '+963912345678',
      language: 'ar',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
      isVerified: true,
    });

    const user3 = await User.create({
      email: 'admin@damascus.com',
      password: hashedPassword,
      firstName: 'المدير',
      lastName: 'العام',
      phone: '+963999999999',
      language: 'ar',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      isVerified: true,
    });

    const user4 = await User.create({
      email: 'tourist@gmail.com',
      password: hashedPassword,
      firstName: 'محمد',
      lastName: 'عمر',
      phone: '+963901234567',
      language: 'en',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad',
      isVerified: true,
    });

    console.log('✅ Users created');

    // Create Places
    const places = [
      {
        nameAr: 'الجامع الأموي',
        nameEn: 'Umayyad Mosque',
        descriptionAr: 'واحد من أعظم المساجد الإسلامية في العالم، يتميز بعمارة إسلامية فريدة وتصاميم معقدة',
        descriptionEn: 'One of the greatest Islamic mosques in the world',
        category: 'religious',
        addressAr: 'الشارع المستقيم، دمشق',
        addressEn: 'Al-Straight Street, Damascus',
        latitude: 33.513,
        longitude: 36.277,
        entryFee: 0,
        contactPhone: '+963112226464',
        contactEmail: 'info@umayyad.com',
        website: 'https://www.umayyad-mosque.com',
        averageRating: 4.8,
        totalReviews: 234,
        isActive: true,
      },
      {
        nameAr: 'قلعة دمشق',
        nameEn: 'Damascus Citadel',
        descriptionAr: 'قلعة تاريخية محاطة بأسوار حجرية قديمة، تعود إلى العصور الوسطى',
        descriptionEn: 'Historic fortress surrounded by ancient stone walls',
        category: 'historical',
        addressAr: 'حي العمارة، دمشق',
        addressEn: 'Al-Amara District, Damascus',
        latitude: 33.5131,
        longitude: 36.2769,
        entryFee: 50,
        contactPhone: '+963112286166',
        contactEmail: 'citadel@damascus.gov',
        website: 'https://www.damascus-citadel.org',
        averageRating: 4.6,
        totalReviews: 189,
        isActive: true,
      },
      {
        nameAr: 'سوق الحميدية',
        nameEn: 'Al-Hamidiyah Market',
        descriptionAr: 'سوق تقليدي عريق يضم محلات حرفية وتجار ذهب وفضة',
        descriptionEn: 'Ancient traditional market featuring craft shops',
        category: 'market',
        addressAr: 'شرقي قرب الجامع الأموي، دمشق',
        addressEn: 'East near Umayyad Mosque, Damascus',
        latitude: 33.5142,
        longitude: 36.2785,
        entryFee: 0,
        contactPhone: '+963112216543',
        contactEmail: 'market@damascus.com',
        website: 'https://www.hamidiyah-market.com',
        averageRating: 4.5,
        totalReviews: 312,
        isActive: true,
      },
      {
        nameAr: 'متحف دمشق الوطني',
        nameEn: 'Damascus National Museum',
        descriptionAr: 'متحف يحتوي على أثار إسلامية وحضارات قديمة',
        descriptionEn: 'Museum containing Islamic artifacts',
        category: 'museum',
        addressAr: 'ساحة الشهداء، دمشق',
        addressEn: 'Martyrs Square, Damascus',
        latitude: 33.5105,
        longitude: 36.2761,
        entryFee: 150,
        contactPhone: '+963112214408',
        contactEmail: 'museum@damascus.gov',
        website: 'https://www.damascus-museum.sy',
        averageRating: 4.7,
        totalReviews: 156,
        isActive: true,
      },
      {
        nameAr: 'بيت نعمان',
        nameEn: 'Beit Noman',
        descriptionAr: 'بيت تراثي دمشقي يعكس العمارة التقليدية',
        descriptionEn: 'Classic Damascene heritage house',
        category: 'historical',
        addressAr: 'حي الشاغور، دمشق',
        addressEn: 'Al-Shaghur District, Damascus',
        latitude: 33.5095,
        longitude: 36.2748,
        entryFee: 75,
        contactPhone: '+963112216788',
        contactEmail: 'beit@damascus.com',
        website: 'https://www.beit-noman.com',
        averageRating: 4.4,
        totalReviews: 98,
        isActive: true,
      },
      {
        nameAr: 'حديقة التجمع',
        nameEn: 'Al-Tajammu Park',
        descriptionAr: 'حديقة واسعة بها نوافير ومساحات خضراء جميلة',
        descriptionEn: 'Spacious park with fountains',
        category: 'garden',
        addressAr: 'الزقاق الأسود، دمشق',
        addressEn: 'Al-Zuqaq Al-Aswad, Damascus',
        latitude: 33.5156,
        longitude: 36.2718,
        entryFee: 0,
        contactPhone: '+963112285434',
        contactEmail: 'park@damascus.gov',
        website: 'https://www.tajammu-park.com',
        averageRating: 4.3,
        totalReviews: 234,
        isActive: true,
      },
      {
        nameAr: 'مطعم السفيرة',
        nameEn: 'Al-Safira Restaurant',
        descriptionAr: 'مطعم فاخر متخصص في الطعام الدمشقي التقليدي',
        descriptionEn: 'Luxury restaurant specializing in traditional cuisine',
        category: 'restaurant',
        addressAr: 'شارع النيربين، دمشق',
        addressEn: 'Al-Nirbin Street, Damascus',
        latitude: 33.5122,
        longitude: 36.2699,
        entryFee: 0,
        contactPhone: '+963112218765',
        contactEmail: 'info@al-safira.com',
        website: 'https://www.al-safira-restaurant.com',
        averageRating: 4.6,
        totalReviews: 267,
        isActive: true,
      },
      {
        nameAr: 'جامع الفاروقي',
        nameEn: 'Al-Faruqi Mosque',
        descriptionAr: 'مسجد أثري جميل يتميز بقبته الزرقاء الفريدة',
        descriptionEn: 'Beautiful historic mosque',
        category: 'religious',
        addressAr: 'شارع النيل، دمشق',
        addressEn: 'Al-Nile Street, Damascus',
        latitude: 33.5168,
        longitude: 36.2815,
        entryFee: 0,
        contactPhone: '+963112289543',
        contactEmail: 'faruqi@damascus.com',
        website: 'https://www.faruqi-mosque.com',
        averageRating: 4.5,
        totalReviews: 145,
        isActive: true,
      },
    ];

    const createdPlaces = [];
    for (const place of places) {
      const createdPlace = await Place.create(place as any);
      createdPlaces.push(createdPlace);
    }

    console.log('✅ Places created');

    // Add images to places
    for (let i = 0; i < createdPlaces.length; i++) {
      const place = createdPlaces[i];
      await PlaceImage.create({
        placeId: place.id,
        imageUrl: `https://picsum.photos/600/400?random=${i + 1}`,
        captionAr: `صورة من ${place.nameAr}`,
        captionEn: `Image from ${place.nameEn}`,
        isPrimary: true,
        displayOrder: 1,
        uploadedBy: user1.id,
      } as any);
    }

    console.log('✅ Place images created');

    // Create Reviews
    const reviews = [
      {
        placeId: createdPlaces[0].id,
        userId: user1.id,
        rating: 5,
        commentAr: 'مكان رائع جداً! العمارة الإسلامية خلابة',
        commentEn: 'Amazing place! The Islamic architecture is breathtaking',
        visitDate: new Date('2026-01-05'),
      },
      {
        placeId: createdPlaces[0].id,
        userId: user2.id,
        rating: 4,
        commentAr: 'جميل جداً ولكن كان مزدحماً قليلاً',
        commentEn: 'Very beautiful but it was a bit crowded',
        visitDate: new Date('2026-01-03'),
      },
      {
        placeId: createdPlaces[1].id,
        userId: user4.id,
        rating: 5,
        commentAr: 'تجربة رائعة! تاريخ غني وإطلالة خلابة',
        commentEn: 'Wonderful experience! Rich history',
        visitDate: new Date('2025-12-28'),
      },
      {
        placeId: createdPlaces[2].id,
        userId: user1.id,
        rating: 4,
        commentAr: 'سوق تقليدي رائع!',
        commentEn: 'Amazing traditional market!',
        visitDate: new Date('2026-01-01'),
      },
    ];

    for (const review of reviews) {
      await Review.create(review as any);
    }

    console.log('✅ Reviews created');

    // Create Favorites
    const favorites = [
      { placeId: createdPlaces[0].id, userId: user1.id, category: 'religious', notes: 'مكان يجب زيارته' },
      { placeId: createdPlaces[1].id, userId: user1.id, category: 'historical', notes: 'إطلالة جميلة' },
      { placeId: createdPlaces[2].id, userId: user2.id, category: 'market', notes: 'للتسوق' },
      { placeId: createdPlaces[6].id, userId: user2.id, category: 'restaurant', notes: 'Best food' },
    ];

    for (const fav of favorites) {
      await Favorite.create(fav as any);
    }

    console.log('✅ Favorites created');

    // Create Bookings
    const bookings = [
      {
        userId: user1.id,
        placeId: createdPlaces[0].id,
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-01-20'),
        guests: 2,
        totalPrice: 0,
        status: 'confirmed',
        bookingNumber: 'DAM-001-2026',
        notes: 'زيارة سريعة للجامع الأموي',
        serviceType: 'visit',
        bookingDate: new Date('2026-01-20'),
        numberOfGuests: 2,
        totalAmount: 0,
        currency: 'SYP',
        paymentStatus: 'pending',
      },
      {
        userId: user2.id,
        placeId: createdPlaces[1].id,
        startDate: new Date('2026-01-25'),
        endDate: new Date('2026-01-25'),
        guests: 4,
        totalPrice: 200,
        status: 'confirmed',
        bookingNumber: 'DAM-002-2026',
        notes: 'عائلية - قلعة دمشق',
        serviceType: 'visit',
        bookingDate: new Date('2026-01-25'),
        numberOfGuests: 4,
        totalAmount: 200,
        currency: 'SYP',
        paymentStatus: 'paid',
      },
    ];

    for (const booking of bookings) {
      await Booking.create(booking as any);
    }

    console.log('✅ Bookings created');

    // Create Itineraries
    const itinerary1 = await Itinerary.create({
      userId: user1.id,
      titleAr: 'رحلة دمشق الشاملة',
      titleEn: 'Complete Damascus Tour',
      descriptionAr: 'رحلة شاملة تغطي أهم معالم دمشق',
      descriptionEn: 'Comprehensive tour covering key landmarks',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-03'),
    } as any);

    console.log('✅ Itineraries created');

    // Create Chat messages
    const chat1 = await Chat.create({
      userId: user1.id,
      subject: 'سؤال عن ساعات العمل',
      status: 'closed',
    } as any);

    await Message.create({
      chatId: chat1.id,
      senderId: user1.id,
      content: 'هل يفتح الجامع الأموي يوم الجمعة؟',
      messageType: 'text',
      isRead: false,
      senderType: 'user',
    } as any);

    console.log('✅ Chat messages created');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
