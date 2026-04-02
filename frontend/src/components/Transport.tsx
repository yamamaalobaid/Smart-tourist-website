import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin, Navigation, Clock, CreditCard, ChevronRight, CheckCircle2, Info, LayoutGrid, List } from 'lucide-react';
import { travelAssistantService, TransportOption } from '../services/travelAssistant';
import Navbar from './Navbar';

export default function Transport() {
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState({
    pickupAddress: '',
    destination: '',
  });

  useEffect(() => {
    loadTransportOptions();
  }, []);

  const loadTransportOptions = async () => {
    setLoading(true);
    try {
      const data = await travelAssistantService.getTransportOptions();
      setOptions(data);
    } catch (error) {
      console.error('Failed to load transport options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    try {
      const result = await travelAssistantService.bookTransport({
        provider: selectedProvider,
        pickupAddress: bookingData.pickupAddress,
        destination: bookingData.destination,
      });
      alert(`تم الحجز بنجاح عبر ${selectedProvider}! رقم الحجز: ${result.data.bookingId}`);
      setShowBookingForm(false);
      setSelectedProvider(null);
      setBookingData({ pickupAddress: '', destination: '' });
    } catch (error) {
      console.error('Failed to book transport:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent mb-4">
            <Car size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">وسائل النقل الذكية والمتكاملة</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-cairo">تحرك بحرية في دمشق</h1>
          <p className="text-gray-400 max-w-xl mx-auto">اختر وسيلة النقل المفضلة لديك، قارن الأسعار، واحجز رحلتك مباشرة لتصلك أينما كنت.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Transport Provider Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
                      <LayoutGrid size={24} className="text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold">الخيارات المتاحة</h2>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2 bg-white/10 rounded-lg text-accent"><LayoutGrid size={18} /></button>
                    <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"><List size={18} /></button>
                 </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center">
                  <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-500">جاري البحث عن كباتن متاحين...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {options.map((option, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5 }}
                      onClick={() => {
                        setSelectedProvider(option.provider);
                        setShowBookingForm(true);
                      }}
                      className={`p-6 bg-white/5 border rounded-2xl cursor-pointer transition-all ${
                        selectedProvider === option.provider ? 'border-accent bg-accent/5' : 'border-glassBorder hover:border-accent/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-white/5 border border-glassBorder rounded-2xl group-hover:bg-accent/10 transition-colors">
                          <Car size={28} className={selectedProvider === option.provider ? 'text-accent' : 'text-gray-400'} />
                        </div>
                        <div className="text-right">
                          <span className="block text-xl font-bold">{option.provider}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">{option.type}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                         <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                               <Clock size={12} />
                               <span>يصل خلال {option.eta}</span>
                            </div>
                            <div className="flex items-center gap-2 text-accent text-sm font-bold">
                               <CreditCard size={12} />
                               <span>التكلفة: {option.cost}</span>
                            </div>
                         </div>
                         <div className="p-2 bg-accent/20 rounded-lg text-accent">
                            <ChevronRight size={16} />
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl flex gap-4">
               <Info size={24} className="text-accent shrink-0" />
               <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                 ملاحظة: الأسعار المعروضة هي أسعار تقديرية وقد تختلف بناءً على حركة المرور أو الوقت من اليوم. يتم الدفع مباشرة للسائق أو عبر المحفظة الإلكترونية.
               </p>
            </div>
          </div>

          {/* Booking Summary & Form Panel */}
          <div className="space-y-6">
             <AnimatePresence mode="wait">
               {selectedProvider ? (
                 <motion.div 
                   key="form"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="glass-panel p-8 border-accent/30"
                 >
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <Navigation size={20} className="text-accent" />
                       حجز رحلة مع {selectedProvider}
                    </h3>
                    <form onSubmit={handleBook} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">موقع الاستلام الحالي</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                              type="text" 
                              required
                              value={bookingData.pickupAddress}
                              onChange={(e) => setBookingData({...bookingData, pickupAddress: e.target.value})}
                              placeholder="أين أنت الآن؟"
                              className="w-full bg-white/5 border border-glassBorder rounded-xl pr-12 pl-4 py-4 focus:border-accent text-sm"
                            />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">الوجهة المقصودة</label>
                          <div className="relative">
                            <Navigation size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                              type="text" 
                              required
                              value={bookingData.destination}
                              onChange={(e) => setBookingData({...bookingData, destination: e.target.value})}
                              placeholder="إلى أين ستذهب؟"
                              className="w-full bg-white/5 border border-glassBorder rounded-xl pr-12 pl-4 py-4 focus:border-accent text-sm"
                            />
                          </div>
                       </div>

                       <div className="pt-4 space-y-3">
                          <button type="submit" className="w-full py-4 bg-gradient-gold text-secondary font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2">
                            <CheckCircle2 size={20} />
                            تأكيد الحجز والاستدعاء
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setSelectedProvider(null)}
                            className="w-full py-4 text-gray-500 hover:text-white transition-colors text-sm font-bold"
                          >
                            تراجع عن الاختيار
                          </button>
                       </div>
                    </form>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="placeholder"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="glass-panel p-10 text-center flex flex-col items-center justify-center border-dashed"
                 >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-glassBorder">
                       <Car size={32} className="text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">ابدأ حجزك</h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">اختر وسيلة النقل التي تناسبك من القائمة الجانبية لإتمام الحجز وتحديد وجهتك.</p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
