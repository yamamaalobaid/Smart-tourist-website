import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Truck, MapPin, CheckCircle2, Clock, Navigation, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { travelAssistantService, LuggageRequest } from '../services/travelAssistant';
import { useAuthStore } from '../store/authStore';
import Navbar from './Navbar';

export default function Luggage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<LuggageRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ from: '', to: '' });

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    // Simulated initial load
    setRequests([]);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const result = await travelAssistantService.requestLuggageDelivery({
        userId: user.id,
        from: formData.from,
        to: formData.to,
      });
      setRequests([...requests, result]);
      setShowForm(false);
      setFormData({ from: '', to: '' });
    } catch (error) {
      console.error('Failed to request luggage delivery:', error);
    }
  };

  const handleTrack = async (id: string) => {
    try {
      const result = await travelAssistantService.trackLuggage(id);
      setRequests(requests.map(req => req.id === id ? result : req));
    } catch (error) {
      console.error('Failed to track luggage:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'pending': return { label: 'في انتظار الاستلام', color: 'gray', icon: Clock };
      case 'picked_up': return { label: 'تم الاستلام', color: 'blue', icon: Box };
      case 'in_transit': return { label: 'في الطريق', color: 'accent', icon: Truck };
      case 'on_site': return { label: 'وصل الموقع', color: 'green', icon: Navigation };
      case 'delivered': return { label: 'تم التسليم بنجاح', color: 'green', icon: CheckCircle2 };
      default: return { label: 'غير معروف', color: 'gray', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent mb-4">
            <Truck size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">خدمة توصيل الأمتعة الذكية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-cairo">سافر بخفة، نعتني بأمتعتك</h1>
          <p className="text-gray-400 max-w-xl mx-auto">نقوم بنقل حقائبك بين الفنادق والمطار بكل أمان وسهولة، مع إمكانية التتبع اللحظي لموقعها.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Active Requests List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
                    <Box size={24} className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold font-cairo">طلباتك النشطة</h2>
                </div>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-gold text-secondary font-bold rounded-xl active:scale-95 transition-transform"
                >
                  <Plus size={18} />
                  <span>طلب جديد</span>
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-glassBorder rounded-2xl bg-white/5">
                  <Truck size={48} className="mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500">لا توجد طلبات جارية حالياً</p>
                  <p className="text-xs text-gray-600 mt-2">ابدأ بطلب خدمة التوصيل لتراها هنا</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {requests.map((request) => {
                    const status = getStatusInfo(request.status);
                    return (
                      <motion.div 
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-white/5 border border-glassBorder rounded-2xl group hover:border-accent/30 transition-all"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                          <div>
                            <span className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">معرف الطلب: {request.id}</span>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-accent" />
                                <span className="font-bold">{request.from}</span>
                              </div>
                              <ArrowRight size={14} className="text-gray-600" />
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-green-500" />
                                <span className="font-bold">{request.to}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-${status.color}-500/10 border border-${status.color}-500/20`}>
                            <status.icon size={16} className={`text-${status.color === 'accent' ? 'accent' : status.color + '-500'}`} />
                            <span className={`text-sm font-bold text-${status.color === 'accent' ? 'accent' : status.color + '-500'}`}>{status.label}</span>
                          </div>
                        </div>

                        {/* Tracking Timeline Simulation */}
                        <div className="relative h-2 bg-white/5 rounded-full mb-8 overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: 
                              request.status === 'pending' ? '10%' : 
                              request.status === 'picked_up' ? '30%' : 
                              request.status === 'in_transit' ? '60%' : 
                              request.status === 'on_site' ? '85%' : '100%' 
                            }}
                            className="absolute top-0 left-0 h-full bg-accent"
                          />
                        </div>

                        <button
                          onClick={() => handleTrack(request.id)}
                          className="w-full py-3 bg-white/5 border border-glassBorder rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                        >
                          <Navigation size={16} />
                          تحديث الحالة لحظياً
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl flex gap-4">
               <div className="p-3 bg-accent text-secondary rounded-xl shrink-0">
                 <ShieldCheck size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-accent mb-1">أمان وجودة مضمونة</h4>
                 <p className="text-sm text-gray-400 leading-relaxed italic pr-2">جميع حقائبك مؤمنة ضد الفقدان أو التلف، ويتم التعامل معها من قبل فريق متخصص ومدرب بعناية لضمان وصولها بسلام.</p>
               </div>
            </div>
          </div>

          {/* New Request Form Side Panel */}
          <div className="space-y-6">
             <div className="glass-panel p-8">
                <h3 className="text-xl font-bold mb-6">طلب توصيل جديد</h3>
                <form onSubmit={handleRequest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1">نقطة الاستلام</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="اسم الفندق أو الموقع"
                        required
                        value={formData.from}
                        onChange={(e) => setFormData({...formData, from: e.target.value})}
                        className="w-full bg-white/5 border border-glassBorder rounded-xl pr-12 pl-4 py-4 focus:outline-none focus:border-accent text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1">وجهة التسليم</label>
                    <div className="relative">
                      <Navigation size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="المطار أو الفندق التالي"
                        required
                        value={formData.to}
                        onChange={(e) => setFormData({...formData, to: e.target.value})}
                        className="w-full bg-white/5 border border-glassBorder rounded-xl pr-12 pl-4 py-4 focus:outline-none focus:border-accent text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full py-4 bg-gradient-gold text-secondary font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} />
                      تأكيد طلب التوصيل
                    </button>
                    <p className="text-[10px] text-gray-500 text-center mt-4">بمجرد التأكيد، سيتصل بك مندوبنا خلال 15 دقيقة</p>
                  </div>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
