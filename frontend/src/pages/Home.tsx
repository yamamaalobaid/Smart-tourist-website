import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { placeService, Place } from '../services/places';
import Loading from '../components/Loading';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Users, Calendar, Heart, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const places = await placeService.getPlaces({ limit: 6 });
        setFeaturedPlaces((places as Place[]) || []);
      } catch (error) {
        console.error('Failed to fetch places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  useEffect(() => {
    const fetchFavs = async () => {
      if (!user) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const favs = await placeService.getFavorites();
        const ids = new Set<string>();
        (favs || []).forEach((f: any) => {
          if (f.placeId) ids.add(String(f.placeId));
          else if (f.place?._id) ids.add(String(f.place._id));
          else if (f.place?.id) ids.add(String(f.place.id));
          else if (f._id) ids.add(String(f._id));
          else if (f.id) ids.add(String(f.id));
        });
        setFavoriteIds(ids);
      } catch (err) {
        console.warn('Failed to load favorites', err);
      }
    };

    fetchFavs();
  }, [user]);

  const toggleFavorite = async (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (favoriteIds.has(placeId)) {
        await placeService.removeFavorite(placeId);
        const next = new Set(favoriteIds);
        next.delete(placeId);
        setFavoriteIds(next);
      } else {
        await placeService.addFavorite(placeId);
        const next = new Set(favoriteIds);
        next.add(placeId);
        setFavoriteIds(next);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      navigate(`/places?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background text-gray-100 overflow-hidden font-outfit">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden text-center">
        {/* Animated Background Gradients & Orbs */}
        <div className="absolute inset-x-0 top-[-10%] h-[700px] bg-gradient-to-b from-primaryDark/30 to-transparent blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -left-[20%] top-[20%] w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-float" />
        <div className="absolute -right-[20%] top-[40%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 font-cairo text-gradient py-2">
              اكتشف سحر دمشق
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl text-gray-300 font-light leading-relaxed">
              بين عبق الماضي وروعة الحاضر، دمشق تفتح أبوابها لتروي لك أجمل الحكايات. 
            </p>
            
            {/* Search Bar */}
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onSubmit={handleSearch}
              className="w-full max-w-2xl glass-panel p-2 flex items-center gap-2 rounded-full overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أماكن، معالم، مطاعم..."
                className="flex-1 bg-transparent px-6 py-4 text-white focus:outline-none placeholder-gray-400 font-cairo text-lg"
              />
              <button 
                type="submit"
                className="px-8 py-4 bg-gradient-gold text-secondary font-bold rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 group"
              >
                <span>بحث</span>
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10 border-t border-glassBorder bg-surface/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-gradient mb-16 font-cairo"
          >
            لماذا نحن خيارك الأفضل؟
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Compass className="w-8 h-8"/>, title: 'تجارب فريدة', desc: 'اكتشف دمشق من منظور مختلف واستكشف أسرارها المخفية.' },
              { icon: <Users className="w-8 h-8"/>, title: 'مجتمع نابض', desc: 'شارك لحظاتك وتجاربك مع آلاف الزوار والمسافرين الشغوفين.' },
              { icon: <Calendar className="w-8 h-8"/>, title: 'تخطيط ذكي', desc: 'نظم جولتك وحجوزاتك بكل يسر وسهولة لتجربة سياحية متكاملة.' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-panel p-8 text-center interactive-hover group"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-gold text-secondary rounded-2xl flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3 font-cairo">{item.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Places */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-16 px-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gradient font-cairo mb-3">أماكن مختارة</h2>
              <p className="text-gray-400">نخبة من الوجهات الدمشقية التي تستحق الزيارة</p>
            </motion.div>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={() => navigate('/places')}
              className="hidden md:flex items-center gap-2 text-primary hover:text-accent font-cairo group transition-colors"
            >
              <span>عرض الكل</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {featuredPlaces.map((place, i) => (
                <motion.div 
                  key={place.id} 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/places/${place._id}`)}
                  className="glass-panel overflow-hidden border border-glassBorder hover:border-primary/50 group cursor-pointer"
                >
                  <div className="relative h-60 overflow-hidden">
                    {place.featuredImage || place.images?.[0]?.imageUrl ? (
                      <img 
                        src={place.featuredImage || place.images?.[0]?.imageUrl} 
                        alt={place.nameAr} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-gray-500 opacity-50" />
                      </div>
                    )}
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    
                    {user && (
                      <button
                        onClick={(e) => toggleFavorite(place._id, e)}
                        className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors z-10"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-transform ${favoriteIds.has(place._id) ? 'fill-accent text-accent scale-110' : 'hover:scale-110'}`} 
                        />
                      </button>
                    )}
                  </div>

                  <div className="p-6 relative">
                    <div className="absolute -top-6 left-6 p-2 bg-gradient-gold text-secondary inline-flex rounded-lg shadow-lg">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 mt-2 font-cairo group-hover:text-primary transition-colors">{place.nameAr}</h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed font-light">{place.descriptionAr}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-glassBorder">
                      <span className="text-accent font-medium text-sm flex items-center gap-1">
                        اكتشف المزيد <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button 
             onClick={() => navigate('/places')}
             className="mt-8 mx-auto flex md:hidden items-center justify-center gap-2 w-full py-4 glass-panel text-primary font-cairo"
          >
             <span>عرض الكل</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glassBorder bg-surface/30 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h4 className="text-2xl font-bold text-primary mb-4 font-cairo">دليل دمشق</h4>
              <p className="text-gray-400 leading-relaxed font-light">بوابتك الذكية والحديثة لاستكشاف جمال وأصالة دمشق، بتجربة سياحية استثنائية.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-4 font-cairo">روابط سريعة</h4>
              <ul className="space-y-3 font-light text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">عن الموقع</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-4 font-cairo">تواصل معنا</h4>
              <ul className="space-y-3 font-light text-gray-400">
                <li>Email: info@damascus-guide.sy</li>
                <li>Phone: +963 11 123 4567</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-glassBorder text-gray-500 font-light text-sm">
            <p>&copy; {new Date().getFullYear()} دليل سياحي دمشق - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
