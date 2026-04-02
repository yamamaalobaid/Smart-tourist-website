import { Request, Response } from 'express';
import { Favorite, Place, PlaceImage } from '../models';

// الحصول على المفضلة
export const getFavorites = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { category, page = 1, limit = 20 } = req.query;

    const filter: any = { userId };
    if (category) {
      filter.category = category;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const count = await Favorite.countDocuments(filter);
    const favorites = await Favorite.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limitNum)
      .lean();

    const placeIds = favorites.map((fav: any) => fav.placeId);
    const places = await Place.find({ _id: { $in: placeIds }, isActive: true }).lean();
    const placeMap = new Map(places.map((p: any) => [p._id.toString(), p]));

    const images = await PlaceImage.find({ placeId: { $in: placeIds }, isPrimary: true }).lean();
    const imageMap = new Map(images.map((img: any) => [img.placeId.toString(), img]));

    const formattedFavorites = favorites.map((fav: any) => {
      const place = placeMap.get(fav.placeId?.toString());
      return {
        ...fav,
        place: place ? {
          ...place,
          mainImage: imageMap.get(place._id.toString()) || null,
        } : null,
      };
    });

    const byCategoryAgg = await Favorite.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ]);

    res.json({
      success: true,
      count,
      byCategory: byCategoryAgg,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
      data: formattedFavorites,
    });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المفضلة',
    });
  }
};