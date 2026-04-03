import { Request, Response } from 'express';
import { Place, Review, Favorite, PlaceImage, User, Booking } from '../models';

// الحصول على جميع الأماكن مع التصفية والبحث
export const getPlaces = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      search,
      minRating,
      latitude,
      longitude,
      radius = '10',
      sortBy = 'rating',
      sortOrder = 'DESC',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isActive: { $ne: false } };

    if (category) {
      const categories = (category as string).split(',').map((x) => x.trim());
      filter.category = { $in: categories };
    }

    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating as string) };
    }

    if (search) {
      const q = new RegExp(search as string, 'i');
      filter.$or = [
        { nameAr: q },
        { nameEn: q },
        { descriptionAr: q },
        { descriptionEn: q },
        { addressAr: q },
        { addressEn: q },
      ];
    }

    let sort: any = {};
    switch (sortBy) {
      case 'popular':
        sort = { totalReviews: sortOrder === 'DESC' ? -1 : 1 };
        break;
      case 'name':
        sort = { nameAr: sortOrder === 'DESC' ? -1 : 1 };
        break;
      case 'newest':
        sort = { createdAt: sortOrder === 'DESC' ? -1 : 1 };
        break;
      default:
        sort = { averageRating: sortOrder === 'DESC' ? -1 : 1, totalReviews: -1 };
    }

    const totalCount = await Place.countDocuments(filter);

    const places = await Place.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const placeIds = places.map((place: any) => place._id);
    const images = await PlaceImage.find({ placeId: { $in: placeIds }, isPrimary: true }).lean();
    const imageMap = images.reduce((acc: any, img: any) => {
      acc[img.placeId.toString()] = img;
      return acc;
    }, {});

    const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const placesWithDistance = places.map((place: any) => {
      const output: any = {
        ...place,
        image: imageMap[place._id.toString()] || null,
        featuredImage: place.featuredImage || imageMap[place._id.toString()]?.imageUrl || null,
        images: imageMap[place._id.toString()] ? [imageMap[place._id.toString()]] : [],
      };

      if (latitude && longitude && place.latitude != null && place.longitude != null) {
        const userLat = parseFloat(latitude as string);
        const userLng = parseFloat(longitude as string);
        const dist = calcDistance(userLat, userLng, place.latitude, place.longitude);
        output.distance = parseFloat(dist.toFixed(2));
      }

      return output;
    });

    const filteredPlaces = placesWithDistance.filter((place: any) => {
      if (place.distance === undefined || place.distance === null) return true;
      return parseFloat(radius as string) >= 0 ? place.distance <= parseFloat(radius as string) : true;
    });

    res.json({
      success: true,
      count: totalCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1,
      },
      data: filteredPlaces,
    });
  } catch (error: any) {
    console.error('Get places error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الأماكن' });
  }
};

export const getPlaceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const place = await Place.findById(id).lean();
    if (!place) {
      return res.status(404).json({ success: false, message: 'المكان غير موجود' });
    }

    const images = await PlaceImage.find({ placeId: id }).lean();
    const reviews = await Review.find({ placeId: id }).sort({ createdAt: -1 }).limit(10).lean();
    const reviewStatsAgg = await Review.aggregate([
      { $match: { placeId: new (require('mongoose')).Types.ObjectId(id) } },
      {
        $group: {
          _id: '$placeId',
          total: { $sum: 1 },
          average: { $avg: '$rating' },
          fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);
    const reviewStats = reviewStatsAgg[0] || { total: 0, average: 0, fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 };

    const similarPlaces = await Place.find({
      _id: { $ne: id },
      category: place.category,
      isActive: true,
    }).sort({ averageRating: -1 }).limit(4).lean();

    // isFavorite, userReview
    let isFavorite = false;
    let userReview = null;
    if (userId) {
      const fav = await Favorite.findOne({ placeId: id, userId });
      isFavorite = !!fav;
      userReview = await Review.findOne({ placeId: id, userId }).lean();
    }

    res.json({
      success: true,
      data: {
        ...place,
        images,
        reviews,
        isFavorite,
        userReview,
        reviewStats,
        similarPlaces,
      },
    });
  } catch (error: any) {
    console.error('Get place by id error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب تفاصيل المكان' });
  }
};

export const createPlace = async (req: any, res: Response) => {
  try {
    const {
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      category,
      addressAr,
      addressEn,
      latitude,
      longitude,
      openingHours,
      entryFee,
      contactPhone,
      contactEmail,
      website,
      images,
    } = req.body;

    if (!nameAr || !nameEn || !category) {
      return res.status(400).json({ success: false, message: 'الاسم العربي والإنكليزي والفئة مطلوبة' });
    }

    const place = await Place.create({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      category,
      addressAr,
      addressEn,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      openingHours,
      entryFee: entryFee ? parseFloat(entryFee) : 0,
      contactPhone,
      contactEmail,
      website,
      featuredImage: Array.isArray(images) && images.length > 0 ? images[0].url : undefined,
      averageRating: 0,
      totalReviews: 0,
      isActive: true,
    });

    if (images && Array.isArray(images)) {
      const placeImages = images.map((image: any, index: number) => ({
        placeId: place._id,
        imageUrl: image.url,
        captionAr: image.captionAr,
        captionEn: image.captionEn,
        isPrimary: index === 0,
        displayOrder: index,
        uploadedBy: req.user.id,
      }));
      await PlaceImage.insertMany(placeImages);
    }

    res.status(201).json({ success: true, message: 'تم إنشاء المكان بنجاح', data: place });
  } catch (error: any) {
    console.error('Create place error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إنشاء المكان' });
  }
};

export const updatePlace = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const place = await Place.findById(id);
    if (!place) return res.status(404).json({ success: false, message: 'المكان غير موجود' });

    Object.assign(place, updateData);
    await place.save();

    res.json({ success: true, message: 'تم تحديث المكان بنجاح', data: place });
  } catch (err: any) {
    console.error('Update place error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث المكان' });
  }
};

export const deletePlace = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place) return res.status(404).json({ success: false, message: 'المكان غير موجود' });

    place.isActive = false;
    await place.save();

    res.json({ success: true, message: 'تم حذف المكان بنجاح' });
  } catch (err: any) {
    console.error('Delete place error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف المكان' });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ placeId: id })
      .populate('userId', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

export const addReview = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, commentAr, commentEn, visitDate, images } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'التقييم مطلوب' });
    }

    const place = await Place.findById(id);
    if (!place) return res.status(404).json({ success: false, message: 'المكان غير موجود' });

    const existingReview = await Review.findOne({ placeId: id, userId });
    if (existingReview) return res.status(400).json({ success: false, message: 'لديك مراجعة سابقة لهذا المكان' });

    const review = await Review.create({
      placeId: id,
      userId,
      rating: parseFloat(rating),
      commentAr,
      commentEn,
      images: images || [],
      visitDate: visitDate ? new Date(visitDate) : undefined,
      isVerifiedVisit: false,
      helpfulCount: 0,
    });

    res.status(201).json({ success: true, message: 'تم إضافة المراجعة بنجاح', data: review });
  } catch (err: any) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة المراجعة' });
  }
};

export const updateReview = async (req: any, res: Response) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const review = await Review.findOne({ _id: reviewId, placeId: id, userId });
    if (!review) return res.status(404).json({ success: false, message: 'المراجعة غير موجودة' });

    Object.assign(review, updateData);
    await review.save();

    res.json({ success: true, message: 'تم تحديث المراجعة بنجاح', data: review });
  } catch (err: any) {
    console.error('Update review error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث المراجعة' });
  }
};

export const deleteReview = async (req: any, res: Response) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: reviewId, placeId: id, userId });
    if (!review) return res.status(404).json({ success: false, message: 'المراجعة غير موجودة' });

    await review.deleteOne();
    res.json({ success: true, message: 'تم حذف المراجعة بنجاح' });
  } catch (err: any) {
    console.error('Delete review error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف المراجعة' });
  }
};

export const addToFavorites = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { category, notes } = req.body;

    const place = await Place.findById(id);
    if (!place) return res.status(404).json({ success: false, message: 'المكان غير موجود' });

    let favorite = await Favorite.findOne({ placeId: id, userId });
    if (favorite) {
      favorite.category = category || favorite.category;
      favorite.notes = notes;
      await favorite.save();
      return res.json({ success: true, message: 'تم تحديث المفضلة بنجاح', data: favorite });
    }

    favorite = await Favorite.create({ placeId: id, userId, category: category || 'favorite', notes });
    res.status(201).json({ success: true, message: 'تم إضافة المكان إلى المفضلة بنجاح', data: favorite });
  } catch (err: any) {
    console.error('Add to favorites error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة المكان إلى المفضلة' });
  }
};

export const removeFromFavorites = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({ placeId: id, userId });
    if (!favorite) return res.status(404).json({ success: false, message: 'المكان غير موجود في المفضلة' });

    await favorite.deleteOne();
    res.json({ success: true, message: 'تم إزالة المكان من المفضلة بنجاح' });
  } catch (err: any) {
    console.error('Remove from favorites error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إزالة المكان من المفضلة' });
  }
};
