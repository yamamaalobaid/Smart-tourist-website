import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { placeService, Place } from '../services/places';
import bookingService from '../services/bookings';
import paymentService from '../services/payments';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, CreditCard, ShieldCheck, Lock, ChevronRight, AlertCircle, DollarSign } from 'lucide-react';

export default function BookingPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!placeId) return;
    const load = async () => {
      try {
        const p = await placeService.getPlaceById(placeId);
        setPlace(p);
      } catch (err) {
        console.error('Failed to load place for booking', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [placeId]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const calculateTotal = () => {
    if (!place) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const nights = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    const base = (place.entryFee || 1000) as number;
    return base * guests * (isNaN(nights) ? 1 : nights);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!startDate || !endDate) {
        setError('الرجاء اختيار تاريخ البداية وتاريخ النهاية');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!place) return;

    try {
      setSubmitting(true);
      if (!place?._id && !placeId) throw new Error('Missing Place ID');
      const booking = await bookingService.create({
        placeId: (place?._id || placeId) as string,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        guests,
        notes,
      });
      const session = await paymentService.createSession(booking.id);

      if (!session.url) {
        throw new Error('تعذر إنشاء رابط الدفع');
      }

      window.location.href = session.url;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل إنشاء الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
        
        {/* Progress Tracker */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4">
            {[
              { id: 1, label: 'التفاصيل' },
              { id: 2, label: 'الدفع الآمن' },
              { id: 3, label: 'تأكيد الحجز' }
            ].map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex flex-col items-center gap-2 ${step >= s.id ? 'text-accent' : 'text-gray-600'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s.id ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-gray-800 bg-white/5'}`}>
                    {step > s.id ? <CheckCircle2 size={20} /> : s.id}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold">{s.label}</span>
                </div>
                {idx < 2 && (
                  <div className={`w-16 h-0.5 mx-4 rounded-full transition-all ${step > s.id ? 'bg-accent shadow-[0_0_10px_#d4af37]' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-panel p-8"
                >
                  <h2 className="text-3xl font-bold mb-8">تفاصيل الحجز لـ {place?.nameAr}</h2>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                      <AlertCircle size={20} />
                      <p className="text-sm font-bold">{error}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">تاريخ الوصول</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glassBorder rounded-xl focus:border-accent outline-none transition-colors"
                          />
                          <Calendar className="absolute left-4 top-4 text-accent" size={20} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">تاريخ المغادرة</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glassBorder rounded-xl focus:border-accent outline-none transition-colors"
                          />
                          <Calendar className="absolute left-4 top-4 text-accent" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">عدد الضيوف</label>
                      <div className="relative flex items-center bg-white/5 border border-glassBorder rounded-xl p-1 w-fit">
                         <button onClick={() => setGuests(Math.max(1, guests - 1))} className="p-3 hover:bg-white/10 rounded-lg transition-colors">-</button>
                         <span className="px-8 font-bold text-lg">{guests}</span>
                         <button onClick={() => setGuests(guests + 1)} className="p-3 hover:bg-white/10 rounded-lg transition-colors">+</button>
                         <Users className="ml-4 mr-2 text-gray-500" size={18} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">ملاحظات إضافية</label>
                      <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        rows={4} 
                        className="w-full px-4 py-4 bg-white/5 border border-glassBorder rounded-xl focus:border-accent outline-none transition-colors resize-none"
                        placeholder="أي طلبات خاصة أو ملاحظات للمكان..."
                      />
                    </div>

                    <button 
                      onClick={handleNextStep}
                      className="w-full py-5 bg-gradient-gold text-secondary font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>المتابعة للدفع الآمن</span>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-panel p-8 border-accent/20"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold">بوابة الدفع المشفرة</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-bold uppercase">
                      <ShieldCheck size={12} />
                      تشفير SSL نشط
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative w-full bg-gradient-to-br from-gray-800 to-black rounded-3xl p-8 overflow-hidden shadow-2xl border border-white/10">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                       <div className="flex justify-between items-start mb-8">
                          <div className="w-12 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg"></div>
                          <Lock size={24} className="text-gray-600" />
                       </div>
                       <div className="space-y-4">
                         <div className="text-sm text-gray-400">
                           لن نقوم بجمع أو تخزين بيانات البطاقة داخل التطبيق. عند المتابعة سيتم تحويلك إلى بوابة دفع آمنة لإتمام العملية.
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                           <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                             <div className="text-gray-500 mb-2">المكان</div>
                             <div className="font-bold">{place?.nameAr}</div>
                           </div>
                           <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                             <div className="text-gray-500 mb-2">الإجمالي</div>
                             <div className="font-bold text-accent">{calculateTotal().toLocaleString('ar-SA')} ل.س</div>
                           </div>
                         </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-8 py-5 bg-white/5 border border-glassBorder rounded-2xl font-bold hover:bg-white/10 transition-all font-cairo"
                      >
                        الرجوع
                      </button>
                      <button 
                        disabled={submitting}
                        type="submit"
                        className="flex-1 py-5 bg-accent text-secondary font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <CreditCard size={20} />
                            <span>المتابعة إلى بوابة الدفع الآمنة</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-12 text-center border-green-500/30 overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <div className="w-24 h-24 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-4xl font-bold mb-4 font-cairo">تم تأكيد حجزك بنجاح!</h2>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto">لقد تم إرسال تفاصيل الحجز ووصل الدفع إلى بريدك الإلكتروني. نتمنى لك رحلة ممتعة.</p>
                  
                  <div className="bg-white/5 border border-glassBorder rounded-2xl p-6 mb-10 text-right space-y-3">
                     <div className="flex justify-between text-xs text-gray-500 uppercase font-bold tracking-widest">
                        <span>رقم المرجع</span>
                        <span className="text-white">DMS-{Math.floor(Math.random()*90000) + 10000}</span>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500 uppercase font-bold tracking-widest">
                        <span>المكان</span>
                        <span className="text-white">{place?.nameAr}</span>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500 uppercase font-bold tracking-widest">
                        <span>إجمالي المبلغ</span>
                        <span className="text-accent font-outfit font-bold">{calculateTotal().toLocaleString('ar-SA')} ل.س</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => navigate('/bookings')}
                    className="w-full py-5 bg-white/10 hover:bg-white/20 border border-glassBorder rounded-2xl font-bold transition-all"
                  >
                    عرض جميع حجوزاتي
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing Summary (Sticky) */}
          <div className="lg:col-span-1">
             <div className="glass-panel p-8 sticky top-24 border-white/5 space-y-8">
                <div>
                   <h3 className="text-xl font-bold mb-6 font-cairo">ملخص الحجز</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500">سعر الدخول الأساسي</span>
                         <span className="font-bold">{(place?.entryFee || 1000).toLocaleString('ar-SA')} ل.س</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500">عدد الضيوف</span>
                         <span className="font-bold">{guests}x</span>
                      </div>
                      {startDate && endDate && (
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-500">عدد الليالي</span>
                           <span className="font-bold">
                             {Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))}
                           </span>
                        </div>
                      )}
                      <div className="pt-4 border-t border-glassBorder flex justify-between items-center">
                         <span className="text-gray-300 font-bold">الإجمالي الكلي</span>
                         <div className="text-right">
                            <div className="text-2xl font-bold text-accent font-outfit">{calculateTotal().toLocaleString('ar-SA')}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ليرة سورية</div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-white/5 border border-glassBorder rounded-2xl">
                   <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck size={18} className="text-accent" />
                      <h4 className="font-bold text-sm">ضمان الحجز</h4>
                   </div>
                   <p className="text-[10px] text-gray-500 leading-relaxed italic">
                     "نحن نضمن لك مكاناً مخصصاً وأسعاراً ثابتة. الحجز يتم بشكل آمن ومشفر بنسبة 100%."
                   </p>
                </div>
                
                <div className="flex flex-col gap-4 text-center">
                   <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                      <CreditCard size={32} />
                      <DollarSign size={32} />
                      <Lock size={32} />
                   </div>
                   <div className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">
                      PCI DSS COMPLIANT • SSL SECURED
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function CheckCircle2({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
}
