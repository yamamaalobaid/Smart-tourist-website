import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartCrack, ChevronRight, Star, MapPin } from 'lucide-react';

interface Favorite {
  id: string;
  placeId: string;
  category?: string;
  createdAt: string;
  place?: {
    _id: string;
    id: string;
    nameAr: string;
    nameEn: string;
    category: string;
    averageRating: number;
    totalReviews: number;
    featuredImage?: string;
    images?: Array<{
      imageUrl: string;
      isPrimary: boolean;
    }>;
  };
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, [selectedCategory]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const url = selectedCategory
        ? `/favorites?category=${selectedCategory}`
        : '/favorites';
      
      const response = await apiClient.get<{
        success: boolean;
        data: Favorite[];
        byCategory?: Array<{ category: string; count: number }>;
      }>(url);

      setFavorites(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (placeId: string) => {
    try {
      await apiClient.delete(`/places/${placeId}/favorites`);
      setFavorites(favorites.filter((fav) => fav.placeId !== placeId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إزالة من المفضلة');
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 font-outfit">
      <Navbar />

      <section className="page-header">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none" />
        <div className="page-header-inner">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
               <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
            </div>
            <h1 className="page-header-title text-gradient">قائمة المفضلة</h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="page-header-subtitle mt-0"
          >
            احتفظ بأماكنك المميزة وعد إليها متى شئت. هذه قائمتك الخاصة لاستكشاف دمشق.
          </motion.p>
        </div>
      </section>

      <div className="page-content md:py-16">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm"
          >
            <p className="text-red-400 font-cairo">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <Loading />
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass-panel text-center py-24 flex flex-col items-center justify-center border-dashed font-cairo max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-xl border border-glassBorder text-red-500/50">
                <HeartCrack className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">قائمتك فارغة</h3>
            <p className="text-gray-400 text-lg mb-8">لم تضف أي أماكن مميزة بعد، ابدأ باكتشاف المعالم والرحلات الآن.</p>
            <Link
              to="/places"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-gold text-secondary font-bold rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition"
            >
              <span>استكشف الأماكن</span>
              <MapPin className="w-5 h-5 mb-0.5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {favorites.map((favorite, i) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel overflow-hidden group hover:border-primary/50 transition-colors h-full flex flex-col font-outfit"
                >
                  <div className="relative h-56 bg-surface overflow-hidden">
                    {(favorite.place?.featuredImage || favorite.place?.images?.[0]?.imageUrl) ? (
                      <img
                        src={favorite.place.featuredImage || favorite.place!.images![0].imageUrl}
                        alt={favorite.place?.nameAr}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-gray-500 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-gold text-secondary text-xs font-bold rounded-full font-cairo shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                       {favorite.place?.category}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 relative">
                    <button
                        onClick={() => removeFavorite(favorite.placeId)}
                        className="absolute -top-6 right-6 p-3 bg-red-500/10 backdrop-blur-md text-red-500 border border-red-500/30 rounded-full hover:bg-red-500 hover:text-white transition-colors z-10 shadow-lg"
                        title="إزالة من المفضلة"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                    </button>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors font-cairo">
                      {favorite.place?.nameAr}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 font-light mr-1">
                      {favorite.place?.nameEn}
                    </p>

                    <div className="flex items-center gap-2 mb-6 mt-auto">
                      <div className="flex items-center gap-1.5 p-1.5 px-2 bg-white/5 rounded-lg border border-glassBorder">
                         <Star className="w-4 h-4 text-accent fill-accent" />
                         <span className="font-semibold text-white">
                           {Number(favorite.place?.averageRating || 0).toFixed(1)}
                         </span>
                      </div>
                      <span className="text-gray-500 text-sm font-light font-cairo">
                        ({favorite.place?.totalReviews || 0} تقييم)
                      </span>
                    </div>

                    <Link
                      to={`/places/${favorite.placeId}`}
                      className="flex items-center justify-between w-full px-5 py-3 bg-white/5 border border-glassBorder text-white rounded-lg hover:bg-gradient-gold hover:text-secondary font-medium transition-all group/btn font-cairo"
                    >
                      <span>عرض التفاصيل</span>
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform rotate-180" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
