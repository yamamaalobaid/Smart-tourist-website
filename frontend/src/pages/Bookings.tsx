import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import bookingService, { BookingRecord } from '../services/bookings';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CalendarClock, Users, Trash2 } from 'lucide-react';

export default function Bookings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.list();
      const paymentStatus = searchParams.get('payment');
      setBookings(data);
      if (paymentStatus === 'success') {
        setError('');
      } else if (paymentStatus === 'cancelled') {
        setError('تم إلغاء عملية الدفع قبل اكتمالها');
      } else {
        setError('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;

    try {
      const cancelled = await bookingService.cancel(bookingId);
      setBookings(bookings.map(b => b.id === bookingId ? cancelled : b));
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل إلغاء الحجز');
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'قيد الانتظار' },
      confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'مؤكد' },
      completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'مكتمل' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'ملغي' },
    };
    const style = statusMap[status] || statusMap['pending'];
    return <span className={`px-4 py-1.5 rounded-full border border-glassBorder text-sm font-bold tracking-wide ${style.bg} ${style.text}`}>{style.label}</span>;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background font-outfit">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-12 md:pb-16 font-cairo">
        <div className="flex items-center gap-4 mb-10">
           <div className="p-3 bg-surface border border-glassBorder rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.15)]">
             <Calendar className="w-8 h-8 text-accent" />
           </div>
           <div>
             <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">حجوزاتي</h1>
             <p className="mt-2 text-sm md:text-base font-light text-gray-400">تابع حالة حجوزاتك ونظّم مواعيد زياراتك بسهولة.</p>
           </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 backdrop-blur-md">
            <AlertCircle className="text-red-500 w-6 h-6 shrink-0" />
            <p className="text-red-400 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Filter Buttons */}
        <motion.div 
           initial={{ opacity: 0, y: -10 }} 
           animate={{ opacity: 1, y: 0 }}
           className="mb-10 flex flex-wrap gap-3"
        >
          {(['all', 'pending', 'confirmed', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-full font-bold transition-all border ${
                filter === status
                  ? 'bg-gradient-gold text-secondary shadow-[0_0_15px_rgba(212,175,55,0.3)] border-transparent'
                  : 'bg-white/5 border-glassBorder text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              {status === 'all' ? 'الكل' : status === 'pending' ? 'قيد الانتظار' : status === 'confirmed' ? 'مؤكد' : 'مكتمل'}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 font-light tracking-widest">جاري تحميل الحجوزات...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-panel rounded-2xl p-16 text-center border border-glassBorder"
          >
            <Calendar className="w-20 h-20 text-gray-600 mx-auto mb-6 opacity-50" />
            <p className="text-3xl text-gray-400 mb-6 font-bold">لا توجد حجوزات</p>
            <p className="text-gray-500 font-light mb-8 max-w-md mx-auto">لم تقم بإجراء أي حجوزات بعد. استكشف أجمل المعالم في دمشق واصنع ذكريات لا تُنسى.</p>
            <button
              onClick={() => navigate('/places')}
              className="px-8 py-4 bg-gradient-gold text-secondary font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
            >
              استكشف الأماكن
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking, i) => (
              <motion.div 
                 key={booking.id} 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="glass-panel p-8 rounded-2xl border border-glassBorder relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-glassBorder pb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-3">{booking.placeName}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="md:text-right bg-white/5 p-4 rounded-xl border border-glassBorder">
                    <p className="text-sm text-gray-400 font-light mb-1">السعر الإجمالي</p>
                    <p className="text-2xl font-bold text-accent font-outfit">{booking.totalPrice.toLocaleString('ar-SA')} <span className="text-base text-gray-400 font-cairo">ل.س</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-glassBorder">
                    <CalendarClock className="w-8 h-8 text-primary" />
                    <div>
                       <p className="text-xs text-gray-500 mb-1 font-light tracking-wide">تاريخ البداية</p>
                       <p className="text-lg font-bold text-gray-200">
                         {new Date(booking.startDate).toLocaleDateString('ar-SA')}
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-glassBorder">
                    <CalendarClock className="w-8 h-8 text-primary" />
                    <div>
                       <p className="text-xs text-gray-500 mb-1 font-light tracking-wide">تاريخ النهاية</p>
                       <p className="text-lg font-bold text-gray-200">
                         {new Date(booking.endDate).toLocaleDateString('ar-SA')}
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-glassBorder">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                       <p className="text-xs text-gray-500 mb-1 font-light tracking-wide">عدد الأشخاص</p>
                       <p className="text-lg font-bold text-gray-200">{booking.guests} ضيف</p>
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-8 p-5 bg-white/5 rounded-xl border border-glassBorder">
                    <p className="text-sm text-gray-400 mb-2 font-light">ملاحظات الحجز:</p>
                    <p className="text-gray-300 font-light">{booking.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-glassBorder">
                  <p className="font-light tracking-wide">تاريخ تقديم الطلب: <span className="font-outfit">{new Date(booking.createdAt).toLocaleDateString('ar-SA')}</span></p>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>إلغاء الحجز</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
