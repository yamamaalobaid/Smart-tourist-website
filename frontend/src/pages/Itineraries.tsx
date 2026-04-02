import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { itinerariesService, Itinerary } from '../services/itineraries';
import { placeService, Place } from '../services/places';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, Trash2, Edit3, Share2, Copy, MapPin } from 'lucide-react';

interface ItineraryDay {
  dayNumber: number;
  places: Place[];
  notes: string;
  items?: any[];
}

export default function Itineraries() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titleAr: '',
    descriptionAr: '',
    startDate: '',
    endDate: '',
    isPublic: false,
  });
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchItineraries();
    fetchPlaces();
  }, [user, navigate]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await itinerariesService.getUserItineraries();
      setItineraries(response.data);
    } catch (err) {
      console.error('Failed to fetch itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaces = async () => {
    try {
      const places = await placeService.getPlaces();
      setAllPlaces(places as Place[]);
    } catch (err) {
      console.error('Failed to fetch places:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr || !formData.startDate || !formData.endDate) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const created = await itinerariesService.createItinerary(formData);
      setItineraries([...itineraries, created]);
      setFormData({
        titleAr: '',
        descriptionAr: '',
        startDate: '',
        endDate: '',
        isPublic: false,
      });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create itinerary:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الجدول الزمني؟')) return;

    try {
      await itinerariesService.deleteItinerary(id);
      setItineraries(itineraries.filter(it => it.id !== id));
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
    }
  };

  const handleShare = async (id: number) => {
    try {
      const shareData = await itinerariesService.shareItinerary(id);
      if (navigator.share) {
        await navigator.share({
          title: shareData.itinerary.titleAr || shareData.itinerary.titleEn,
          text: 'شاهد مسار رحلتي!',
          url: shareData.shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareData.shareUrl);
        alert('تم نسخ رابط المشاركة إلى الحافظة');
      }
    } catch (err) {
      console.error('Failed to share itinerary:', err);
    }
  };

  const handleCopy = async (id: number) => {
    try {
      const copied = await itinerariesService.copyItinerary(id);
      setItineraries([...itineraries, copied]);
      alert('تم نسخ الجدول الزمني بنجاح');
    } catch (err) {
      console.error('Failed to copy itinerary:', err);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background font-outfit">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 font-cairo">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-surface border border-glassBorder rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.15)]">
               <CalendarDays className="w-8 h-8 text-accent" />
             </div>
             <div>
               <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">جداولي الزمنية</h1>
               <p className="text-gray-400 font-light mt-2">نظم رحلاتك وخطط لمساراتك السياحية</p>
             </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-gold text-secondary font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
          >
            {showForm ? 'إلغاء التنظيم' : (
              <>
                <Plus className="w-5 h-5" />
                <span>جدول زمني جديد</span>
              </>
            )}
          </button>
        </div>

        {/* Create Form */}
        <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="glass-panel p-8 md:p-10 border border-glassBorder rounded-2xl mb-12 overflow-hidden"
          >
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-glassBorder pb-4">إنشاء مسار رحلة جديد</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">اسم الرحلة / العنوان</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="مثال: رحلة دمشق الشاملة"
                    className="w-full px-4 py-3 bg-white/5 border border-glassBorder rounded-xl focus:outline-none focus:border-accent text-white font-outfit"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">إجمالي الأيام المخططة</label>
                  <input
                    type="text"
                    value={calculateDays() > 0 ? `${calculateDays()} أيام` : 'يرجى تحديد التواريخ'}
                    disabled
                    className="w-full px-4 py-3 bg-black/40 border border-glassBorder rounded-xl text-primary font-bold cursor-not-allowed text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-gray-300 mb-2">وصف تنفيذي (اختياري)</label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="وصف مختصر للرحلة وأهدافها..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-glassBorder rounded-xl focus:outline-none focus:border-accent text-white font-outfit resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">تاريخ البداية المتوقع</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-glassBorder rounded-xl focus:outline-none focus:border-accent text-white font-outfit"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-300 mb-2">تاريخ النهاية المتوقع</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-glassBorder rounded-xl focus:outline-none focus:border-accent text-white font-outfit"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-6 py-4 bg-gradient-gold text-secondary font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex justify-center items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>إنشاء وحفظ الجدول</span>
              </button>
            </form>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Itineraries List */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
             <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
             <p className="text-gray-400 font-light tracking-widest">جاري تحميل الجداول الزمنية...</p>
          </div>
        ) : itineraries.length === 0 ? (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-panel rounded-2xl p-16 text-center border border-glassBorder"
          >
             <MapPin className="w-20 h-20 text-gray-600 mx-auto mb-6 opacity-50" />
             <p className="text-3xl text-gray-400 mb-6 font-bold">لا توجد مسارات مخصصة</p>
             <p className="text-gray-500 font-light mb-8 max-w-md mx-auto">لم تقم ببناء أي مسار لرحلاتك. أنشئ دولك الزمني الآن وابدأ التنظيم الاحترافي لرحلتك القادمة.</p>
             <button
               onClick={() => setShowForm(true)}
               className="px-8 py-4 bg-gradient-gold text-secondary font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
             >
               أنشئ مسارك الأول
             </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {itineraries.map((itinerary, i) => (
              <motion.div 
                key={itinerary.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel border border-glassBorder rounded-2xl overflow-hidden shadow-2xl flex flex-col group relative"
              >
                <div className="absolute top-0 left-0 w-32 h-32 bg-primaryDark/10 rounded-br-full pointer-events-none transition-transform group-hover:scale-110"></div>
                
                <div className="p-8 flex-1">
                  <div className="mb-6 border-b border-glassBorder pb-6">
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-wide text-gradient">{itinerary.titleAr || itinerary.titleEn}</h3>
                    <p className="text-gray-400 font-light leading-relaxed">{itinerary.descriptionAr || itinerary.descriptionEn || "بدون وصف إضافي"}</p>
                  </div>

                  <div className="bg-white/5 rounded-xl border border-glassBorder p-5 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="border-l border-glassBorder">
                        <p className="text-sm text-gray-500 font-light mb-2">تاريخ البدء</p>
                        <p className="font-bold text-primary font-outfit text-lg">
                          {new Date(itinerary.startDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-light mb-2">تاريخ الانتهاء</p>
                        <p className="font-bold text-primary font-outfit text-lg">
                          {new Date(itinerary.endDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {itinerary.days && itinerary.days.length > 0 ? (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="font-bold text-white">تفاصيل الأيام</h4>
                         <span className="text-xs font-bold px-3 py-1 bg-accent/20 text-accent rounded-full">{itinerary.days.length} أيام</span>
                      </div>
                      <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {itinerary.days.map((day, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-glassBorder rounded-lg transition-colors hover:bg-white/10">
                            <span className="font-bold text-gray-300">اليوم {day.dayNumber}</span>
                            <span className="text-xs font-light text-gray-400 bg-black/30 px-3 py-1 rounded-full">{day.items?.length || 0} نشاط</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-white/5 border border-glassBorder rounded-lg text-center text-gray-500 text-sm font-light">
                      لم يتم تعيين أي أنشطة بعد
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-black/40 border-t border-glassBorder flex gap-2">
                  <button
                    onClick={() => handleShare(itinerary.id)}
                    className="p-3 bg-white/5 border border-glassBorder text-gray-300 rounded-xl hover:text-white hover:bg-white/10 hover:border-gray-500 transition-all focus:outline-none"
                    title="مشاركة"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleCopy(itinerary.id)}
                    className="p-3 bg-white/5 border border-glassBorder text-gray-300 rounded-xl hover:text-white hover:bg-white/10 hover:border-gray-500 transition-all focus:outline-none"
                    title="نسخ المسار"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/itineraries/${itinerary.id}`)}
                    className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-white/10 text-white font-bold rounded-xl border border-glassBorder hover:bg-white/20 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>تحرير وإدارة</span>
                  </button>
                  <button
                    onClick={() => handleDelete(itinerary.id)}
                    className="p-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all focus:outline-none"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
