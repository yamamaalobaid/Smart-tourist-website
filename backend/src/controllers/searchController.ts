import { Request, Response } from 'express';
import { Place, PlaceImage } from '../models';

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// بحث متقدم في الأماكن
export const advancedSearch = async (req: Request, res: Response) => {
  try {
    const {
      query,
      categories,
      minRating,
      maxRating,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius = 5,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
    } = req.query;

    const filter: any = { isActive: true };

    if (query) {
      const regex = new RegExp(String(query), 'i');
      filter.$or = [
        { nameAr: regex },
        { nameEn: regex },
        { descriptionAr: regex },
        { descriptionEn: regex },
        { addressAr: regex },
        { addressEn: regex },
      ];
    }

    if (categories) {
      filter.category = { $in: (categories as string).split(',') };
    }

    if (minRating || maxRating) {
      filter.averageRating = {};
      if (minRating) filter.averageRating.$gte = parseFloat(minRating as string);
      if (maxRating) filter.averageRating.$lte = parseFloat(maxRating as string);
    }

    if (minPrice || maxPrice) {
      filter.entryFee = {};
      if (minPrice) filter.entryFee.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.entryFee.$lte = parseFloat(maxPrice as string);
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNum - 1) * pageSize;

    let sortCondition: any = { averageRating: -1, totalReviews: -1 };
    const includeDistance = latitude !== undefined && longitude !== undefined;
    let currentLat = 0;
    let currentLon = 0;
    let queryRadius = Number(radius);

    if (includeDistance) {
      currentLat = parseFloat(latitude as string);
      currentLon = parseFloat(longitude as string);
    }

    switch (sortBy) {
      case 'distance':
        if (includeDistance) {
          sortCondition = { distance: 1 };
        }
        break;
      case 'rating':
        sortCondition = { averageRating: -1, totalReviews: -1 };
        break;
      case 'price_low':
        sortCondition = { entryFee: 1 };
        break;
      case 'price_high':
        sortCondition = { entryFee: -1 };
        break;
      case 'popular':
        sortCondition = { totalReviews: -1 };
        break;
      default:
        sortCondition = { averageRating: -1, totalReviews: -1 };
        break;
    }

    const count = await Place.countDocuments(filter);
    let places = await Place.find(filter)
      .skip(skip)
      .limit(pageSize)
      .lean();

    if (includeDistance) {
      places = places.map((place: any) => {
        if (place.latitude != null && place.longitude != null) {
          place.distance = calculateDistanceKm(currentLat, currentLon, place.latitude, place.longitude);
        } else {
          place.distance = Number.MAX_VALUE;
        }
        return place;
      });

      if (queryRadius >= 0) {
        places = places.filter((place: any) => place.distance <= queryRadius);
      }
    }

    if (sortBy === 'distance' && includeDistance) {
      places.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'relevance' && query) {
      places.sort((a: any, b: any) => {
        const aScore = ((a.nameAr?.toLowerCase().includes(String(query).toLowerCase()) ? 1 : 0) +
                         (a.nameEn?.toLowerCase().includes(String(query).toLowerCase()) ? 1 : 0));
        const bScore = ((b.nameAr?.toLowerCase().includes(String(query).toLowerCase()) ? 1 : 0) +
                         (b.nameEn?.toLowerCase().includes(String(query).toLowerCase()) ? 1 : 0));
        if (aScore !== bScore) return bScore - aScore;
        if (a.averageRating !== b.averageRating) return b.averageRating - a.averageRating;
        return b.totalReviews - a.totalReviews;
      });
    } else {
      places.sort((a: any, b: any) => {
        for (const key of Object.keys(sortCondition)) {
          const direction = sortCondition[key] === 1 ? 1 : -1;
          if ((a[key] ?? 0) < (b[key] ?? 0)) return -direction;
          if ((a[key] ?? 0) > (b[key] ?? 0)) return direction;
        }
        return 0;
      });
    }

    const placeIds = places.map((place: any) => place._id);
    const primaryImages = await PlaceImage.find({ placeId: { $in: placeIds }, isPrimary: true }).lean();
    const imageMap = new Map(primaryImages.map((img: any) => [img.placeId.toString(), img]));

    const placesWithImages = places.map((place: any) => ({
      ...place,
      images: imageMap.has(place._id.toString()) ? [imageMap.get(place._id.toString())] : [],
    }));

    res.json({
      success: true,
      count,
      pagination: {
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
      data: placesWithImages,
    });
  } catch (error: any) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث',
    });
  }
};