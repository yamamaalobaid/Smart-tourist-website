import { Request, Response } from 'express';
import { Review, Place, User } from '../models';

// الحصول على مراجعات مكان
export const getPlaceReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'newest' } = req.query;

    const filter: any = { placeId: id };
    if (rating) {
      filter.rating = parseInt(rating as string);
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * pageSize;

    let sortCondition: any = { createdAt: -1 };
    switch (sortBy) {
      case 'newest':
        sortCondition = { createdAt: -1 };
        break;
      case 'oldest':
        sortCondition = { createdAt: 1 };
        break;
      case 'highest':
        sortCondition = { rating: -1, helpfulCount: -1 };
        break;
      case 'lowest':
        sortCondition = { rating: 1, helpfulCount: -1 };
        break;
      case 'helpful':
        sortCondition = { helpfulCount: -1, createdAt: -1 };
        break;
      default:
        sortCondition = { createdAt: -1 };
    }

    const count = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName avatarUrl createdAt')
      .sort(sortCondition)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // الحصول على إحصائيات التقييم
    const ratingStats = await Review.aggregate([
      { $match: { placeId: id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      count,
      pagination: {
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
      ratingStats,
      data: reviews,
    });
  } catch (error: any) {
    console.error('Get place reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المراجعات',
    });
  }
};

// الحصول على مراجعات المستخدم
export const getUserReviews = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * pageSize;

    const filter = { userId };
    const count = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('place', 'nameAr nameEn category featuredImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.json({
      success: true,
      count,
      pagination: {
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
      data: reviews,
    });
  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب مراجعات المستخدم',
    });
  }
};