import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PlaceCard from '../components/PlaceCard';
import { placeService, Place } from '../services/places';
import Loading from '../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, MapPin, SlidersHorizontal, Map, Star, DollarSign, RefreshCw, AlertCircle, Map as MapIcon } from 'lucide-react';
import MapOverlay from '../components/MapOverlay';

type SortBy = 'rating' | 'name' | 'newest';
type PriceRange = 'all' | 'free' | 'cheap' | 'moderate' | 'expensive';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearRadiusKm, setNearRadiusKm] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [minRating, setMinRating] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const categories = [
    { id: 'all', name: 'جميع الأماكن', icon: <Map className="w-5 h-5"/> },
    { id: 'historical', name: 'مواقع تاريخية', icon: <Compass className="w-5 h-5"/> },
    { id: 'religious', name: 'مواقع دينية', icon: <Star className="w-5 h-5"/> },
    { id: 'museum', name: 'متاحف', icon: <MapPin className="w-5 h-5"/> },
    { id: 'garden', name: 'حدائق ومنتزهات', icon: <Compass className="w-5 h-5"/> },
    { id: 'market', name: 'أسواق تقليدية', icon: <DollarSign className="w-5 h-5"/> },
    { id: 'restaurant', name: 'مطاعم', icon: <Star className="w-5 h-5"/> },
  ];

  useEffect(() => {
    fetchPlaces();
  }, [category, sortBy, minRating, priceRange, userLocation, nearRadiusKm]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lastLocation');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          setUserLocation({ lat: parsed.lat, lng: parsed.lng });
        }
      }
    } catch (e) {
      console.warn('Failed to read lastLocation from localStorage', e);
    }
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (category && category !== 'all') params.category = category;
      if (minRating && minRating > 0) params.minRating = minRating;
      if (priceRange && priceRange !== 'all') params.priceRange = priceRange;
      if (sortBy) params.sortBy = sortBy;

      const data = (await placeService.searchPlaces(params)) as Place[];
      let filtered = data || [];

      if (searchTerm) {
        filtered = filtered.filter((p: Place) =>
          p.nameAr.includes(searchTerm) ||
          p.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (category !== 'all') filtered = filtered.filter((p: Place) => p.category === category);
      if (minRating > 0) filtered = filtered.filter((p: Place) => p.averageRating >= minRating);
      if (priceRange !== 'all') {
        filtered = filtered.filter((p: Place) => {
          const fee = p.entryFee || 0;
          switch (priceRange) {
            case 'free': return fee === 0;
            case 'cheap': return fee > 0 && fee <= 100;
            case 'moderate': return fee > 100 && fee <= 500;
            case 'expensive': return fee > 500;
            default: return true;
          }
        });
      }

      switch (sortBy) {
        case 'rating':
          filtered.sort((a: Place, b: Place) => b.averageRating - a.averageRating);
          break;
        case 'name':
          filtered.sort((a: Place, b: Place) => a.nameAr.localeCompare(b.nameAr));
          break;
        case 'newest':
          filtered.sort((a: Place, b: Place) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          break;
      }

      if (userLocation) {
        const withDist = filtered.map((p) => {
          const lat = (p as any).latitude;
          const lng = (p as any).longitude;
          if (typeof lat === 'number' && typeof lng === 'number') {
            const d = haversineDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
            return { ...p, distanceKm: d } as any;
          }
          return { ...p, distanceKm: null } as any;
        });
        const nearby = withDist.filter((p: any) => typeof p.distanceKm === 'number' && p.distanceKm <= nearRadiusKm);
        setPlaces(nearby as Place[]);
      } else {
        setPlaces(filtered);
      }
    } catch (err) {
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  };

  const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearMe = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم الحصول على الموقع');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        try {
          localStorage.setItem('lastLocation', JSON.stringify(loc));
        } catch (e) {
          console.warn('Failed to save lastLocation', e);
        }
      },
      (err) => {
        console.warn('Geolocation error', err);
        alert('تعذر الحصول على الموقع. تأكد من منح الإذن.');
        setLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const clearNearMe = () => {
    setUserLocation(null);
    try {
      localStorage.removeItem('lastLocation');
    } catch (e) {
      console.warn('Failed to remove lastLocation', e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm, category });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setSortBy('rating');
    setPriceRange('all');
    setMinRating(0);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 font-outfit">
      <Navbar />

      <section className="relative pt-32 pb-16 bg-surface border-b border-glassBorder overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primaryDark/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 font-cairo">
          <motion.h1 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl md:text-5xl font-bold mb-6 text-gradient"
          >
             استكشف دمشق 🌍
          </motion.h1>
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch} 
            className="flex flex-wrap gap-4 items-center bg-white/5 p-4 rounded-xl border border-glassBorder backdrop-blur-md"
          >
            <div className="flex-1 relative min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن مكان..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-glassBorder rounded-lg focus:outline-none focus:border-accent text-white placeholder-gray-500 font-cairo transition-colors"
              />
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-gold text-secondary font-bold rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition cursor-pointer"
            >
              بحث
            </button>
            <button
              type="button"
              onClick={findNearMe}
              className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition cursor-pointer flex items-center gap-2 border border-glassBorder"
            >
              <MapPin className="w-5 h-5" /> بالقرب مني
            </button>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-lg border border-glassBorder">
              <label className="text-sm font-light text-gray-300">نطاق:</label>
              <select
                value={nearRadiusKm}
                onChange={(e) => setNearRadiusKm(Number(e.target.value))}
                className="bg-transparent text-accent font-bold focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-surface text-white">1 كم</option>
                <option value={3} className="bg-surface text-white">3 كم</option>
                <option value={5} className="bg-surface text-white">5 كم</option>
                <option value={10} className="bg-surface text-white">10 كم</option>
                <option value={20} className="bg-surface text-white">20 كم</option>
              </select>
            </div>
            {userLocation && (
              <button
                type="button"
                onClick={clearNearMe}
                className="px-4 py-3 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/40 transition border border-red-500/30"
              >
                إلغاء الموقع
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="px-6 py-3 bg-accent/20 text-accent font-bold rounded-lg hover:bg-accent/30 transition cursor-pointer flex items-center gap-2 border border-accent/30"
            >
              <MapIcon className="w-5 h-5" /> عرض الخريطة
            </button>
          </motion.form>
        </div>
      </section>

      <AnimatePresence>
        {showMap && (
          <MapOverlay 
            places={places} 
            onClose={() => setShowMap(false)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-panel p-6 space-y-8 sticky top-24 font-cairo"
            >
              <div className="flex items-center gap-2 text-accent border-b border-glassBorder pb-4">
                <SlidersHorizontal className="w-6 h-6" />
                <h3 className="text-2xl font-bold text-white">الفلاتر</h3>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">الفئات</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        category === cat.id
                          ? 'bg-gradient-gold text-secondary font-bold shadow-lg shadow-accent/20'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent hover:border-glassBorder'
                      }`}
                    >
                      {cat.icon} <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">ترتيب حسب</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-4 py-3 bg-white/5 border border-glassBorder rounded-lg focus:outline-none focus:border-accent text-white"
                >
                  <option value="rating" className="bg-surface text-white">الأعلى تقييماً ⭐</option>
                  <option value="name" className="bg-surface text-white">الاسم (أ-ي)</option>
                  <option value="newest" className="bg-surface text-white">الأحدث 🆕</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">نطاق السعر</h4>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as PriceRange)}
                  className="w-full px-4 py-3 bg-white/5 border border-glassBorder rounded-lg focus:outline-none focus:border-accent text-white"
                >
                  <option value="all" className="bg-surface text-white">الكل</option>
                  <option value="free" className="bg-surface text-white">مجاني 🆓</option>
                  <option value="cheap" className="bg-surface text-white">رخيص (0-100 د.س) 💰</option>
                  <option value="moderate" className="bg-surface text-white">متوسط (100-500 د.س) 💵</option>
                  <option value="expensive" className="bg-surface text-white">غالي (+500 د.س) 💸</option>
                </select>
              </div>

              {/* Minimum Rating */}
              <div>
                <h4 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">الحد الأدنى للتقييم</h4>
                <div className="space-y-3">
                  {[0, 3, 4, 4.5].map(rating => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${minRating === rating ? 'border-accent' : 'border-gray-500 group-hover:border-accent'}`}>
                         {minRating === rating && <div className="w-2.5 h-2.5 bg-accent rounded-full" />}
                      </div>
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="hidden"
                      />
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {rating === 0 ? 'الكل' : `${rating} ⭐ وما فوق`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-surface border border-glassBorder text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-all font-semibold flex justify-center items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" /> إعادة تعيين
              </button>
            </motion.div>
          </div>

          {/* Places Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loading />
              </div>
            ) : places.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel py-20 px-4 text-center border-dashed font-cairo flex flex-col items-center justify-center"
              >
                <AlertCircle className="w-16 h-16 text-gray-500 mb-6" />
                <p className="text-2xl text-gray-300 mb-6 font-bold">لا توجد نتائج تطابق بحثك</p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-gradient-gold text-secondary font-bold rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition"
                >
                  مسح الفلاتر
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-8 p-4 glass-panel inline-block border-l-4 border-l-accent font-cairo"
                >
                  <p className="text-gray-300">تم العثور على <span className="font-bold text-accent text-xl px-2">{places.length}</span> نتيجة</p>
                </motion.div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {places.map((place, i) => (
                      <motion.div
                        key={place._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                      >
                         <PlaceCard place={place} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
