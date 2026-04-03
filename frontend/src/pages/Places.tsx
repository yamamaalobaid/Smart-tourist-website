import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PlaceCard from '../components/PlaceCard';
import { placeService, Place, PLACE_CATEGORY_OPTIONS } from '../services/places';
import Loading from '../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin } from 'lucide-react';

export default function Places() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || searchParams.get('q') || '');

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const response = await placeService.getPlaces({
          category: category || undefined,
          search: search || undefined,
        });
        setPlaces(response || []);
      } catch (error) {
        console.error('Failed to fetch places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [category, search]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (search) params.search = search;
    setSearchParams(params);
  }, [category, search, setSearchParams]);

  return (
    <div className="min-h-screen bg-background text-gray-100 font-outfit">
      <Navbar />

      {/* Header */}
      <section className="relative bg-surface border-b border-glassBorder text-white pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primaryDark/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 font-cairo text-gradient"
          >
            استكشف الأماكن
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 font-light"
          >
            اختر من بين مئات الأماكن السياحية المميزة في أقدم عاصمة مأهولة
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel p-6 sticky top-24"
            >
              <div className="flex items-center gap-2 mb-8">
                <Filter className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold text-white font-cairo">التصفيات</h2>
              </div>

              {/* Search */}
              <div className="mb-8 relative">
                <label className="block text-sm font-medium text-gray-400 mb-2 font-cairo">البحث</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث عن مكان..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-glassBorder rounded-lg focus:outline-none focus:border-accent text-white placeholder-gray-500 font-cairo transition-colors"
                  />
                  <Search className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-4 font-cairo">التصنيف</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategory('')}
                    className={`block w-full text-right px-4 py-3 rounded-lg transition-all font-cairo ${
                      category === ''
                        ? 'bg-gradient-gold text-secondary font-bold shadow-lg shadow-accent/20'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    الكل
                  </button>
                  {PLACE_CATEGORY_OPTIONS.filter((option) => option.value).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCategory(option.value)}
                      className={`block w-full text-right px-4 py-3 rounded-lg transition-all font-cairo ${
                        category === option.value
                          ? 'bg-gradient-gold text-secondary font-bold shadow-lg shadow-accent/20'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Places Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loading />
              </div>
            ) : places.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel text-center py-20 flex flex-col items-center justify-center border-dashed"
              >
                <MapPin className="w-16 h-16 text-gray-600 mb-6" />
                <p className="text-gray-400 text-xl font-cairo">لم يتم العثور على أماكن تطابق بحثك</p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence>
                  {places.map((place, index) => (
                    <motion.div
                      key={place._id || place.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PlaceCard place={place} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
