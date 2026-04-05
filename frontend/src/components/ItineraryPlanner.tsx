import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Calendar, Clock, MapPin, Share2, Plus, Trash2, Save, Copy, Send, Layout, ListTodo, Sparkles, Filter, Info } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Navbar from './Navbar';

interface ItineraryItem {
  id: string;
  name: string;
  time: string;
  type: 'visit' | 'meal' | 'rest';
  location: string;
}

export default function ItineraryPlanner() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ItineraryItem[]>([
    { id: '1', name: 'الجامع الأموي الكبير', time: '09:00 AM', type: 'visit', location: 'دمشق القديمة' },
    { id: '2', name: 'سوق الحميدية', time: '11:00 AM', type: 'visit', location: 'دمشق القديمة' },
    { id: '3', name: 'قصر العظم', time: '01:30 PM', type: 'visit', location: 'دمشق القديمة' },
  ]);

  const [activeDay, setActiveDay] = useState(1);
  const [isSaved, setIsSaved] = useState(false);

  const addItem = () => {
    const newItem: ItineraryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'موقع جديد',
      time: '04:00 PM',
      type: 'visit',
      location: 'دمشق'
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const saveItinerary = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background font-cairo text-white">
      <Navbar />

      <div className="page-section pt-28 md:pt-32 pb-14 md:pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent mb-4">
            <Calendar size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">مخطط الرحلات الذكي</span>
          </div>
          <h1 className="page-header-title mb-4 font-cairo">صمم رحلتك المثالية</h1>
          <p className="page-header-subtitle mt-0 mx-auto">نظم جدولك اليومي، رتب المواقع المفضلة، وشارك خطتك مع رفاق سفرك بكل سهولة.</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar: Days & Templates */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-8 text-accent">
                <Layout size={20} />
                <h3 className="text-xl font-bold font-cairo">أيام الرحلة</h3>
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      activeDay === day 
                      ? 'bg-gradient-gold text-secondary border-accent font-bold shadow-lg shadow-accent/20' 
                      : 'bg-white/5 border-glassBorder text-gray-400 hover:border-accent/40'
                    }`}
                  >
                    <span>اليوم {day}</span>
                    <ChevronRight size={16} />
                  </button>
                ))}
                <button className="w-full p-4 border border-glassBorder border-dashed rounded-xl text-gray-500 hover:text-white hover:border-accent transition-all flex items-center justify-center gap-2 text-sm">
                  <Plus size={16} />
                  إضافة يوم جديد
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-glassBorder">
                 <div className="flex items-center gap-2 mb-6 text-accent">
                    <Sparkles size={18} />
                    <h4 className="font-bold text-sm">نماذج جاهزة</h4>
                 </div>
                 <div className="space-y-3">
                    <button className="w-full text-right p-3 bg-white/5 border border-glassBorder rounded-lg text-[10px] uppercase font-bold text-gray-500 hover:text-accent hover:border-accent transition-colors">دمشق في 24 ساعة</button>
                    <button className="w-full text-right p-3 bg-white/5 border border-glassBorder rounded-lg text-[10px] uppercase font-bold text-gray-500 hover:text-accent hover:border-accent transition-colors">جولة الأسواق القديمة</button>
                 </div>
              </div>
            </div>
          </div>

          {/* Main Planning Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8">
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-accent text-secondary rounded-xl font-bold">
                        {activeDay}
                     </div>
                     <h2 className="text-2xl font-bold font-cairo">جدول اليوم {activeDay}</h2>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={saveItinerary}
                        className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                           isSaved ? 'bg-green-500 text-white' : 'bg-white/5 border border-glassBorder hover:bg-white/10'
                        }`}
                     >
                        {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                        <span>{isSaved ? 'تم الحفظ' : 'حفظ الخطة'}</span>
                     </button>
                  </div>
               </div>

               <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-4">
                  {items.map((item) => (
                    <Reorder.Item 
                      key={item.id} 
                      value={item}
                      className="group cursor-move"
                    >
                      <motion.div className="p-6 bg-white/5 border border-glassBorder rounded-2xl group-hover:border-accent/40 transition-colors flex items-center gap-6">
                         <div className="flex flex-col items-center gap-1 shrink-0">
                            <Clock size={16} className="text-accent" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{item.time}</span>
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
                               <MapPin size={12} className="text-gray-600" />
                               {item.location}
                            </div>
                         </div>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-white/5 rounded-lg hover:text-blue-400 transition-colors"><Copy size={16} /></button>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-2 bg-white/5 rounded-lg hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>
                         <div className="flex flex-col gap-1 px-4 cursor-grab active:cursor-grabbing">
                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                         </div>
                      </motion.div>
                    </Reorder.Item>
                  ))}
               </Reorder.Group>

               <button 
                  onClick={addItem}
                  className="w-full mt-8 py-6 border-2 border-dashed border-glassBorder rounded-2xl text-gray-500 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all flex flex-col items-center gap-2"
               >
                  <Plus size={32} />
                  <span className="font-bold">إضافة محطة جديدة للرحلة</span>
               </button>
            </div>
          </div>

          {/* Sharing & Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
             <div className="glass-panel p-8 border-accent/30">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-accent text-secondary rounded-xl">
                    <Share2 size={24} />
                  </div>
                  <h2 className="text-2xl font-bold font-cairo">مشاركة الخطة</h2>
                </div>
                
                <p className="text-sm text-gray-400 mb-8 italic leading-relaxed">
                  "اجعل رحلتك جماعية، شارك مسار يومك مع الأصدقاء أو العائلة، أو اطبع الجدول ليكون معك دائماً."
                </p>

                <div className="space-y-4">
                   <button className="w-full py-4 bg-gradient-gold text-secondary font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2">
                      <Send size={18} />
                      إرسال عبر واتساب
                   </button>
                   <button className="w-full py-4 bg-white/5 border border-glassBorder text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Copy size={18} />
                      نسخ رابط المشاركة
                   </button>
                   <button className="w-full py-4 bg-white/5 border border-glassBorder text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Layout size={18} />
                      تصدير كملف PDF
                   </button>
                </div>
             </div>

             <div className="p-6 bg-white/5 border border-glassBorder rounded-2xl flex gap-4">
                <Info size={24} className="text-accent shrink-0" />
                <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                   تنظيم الرحلة يقلل من وقت التنقل ويزيد من وقت الاستمتاع. استخدم "عرض الخريطة" لرؤية المسار الجغرافي لجدولك اليومي.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Internal icons needed
function ChevronRight({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}

function CheckCircle2({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
}
