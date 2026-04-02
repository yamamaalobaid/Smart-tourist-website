import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Camera, History, Layers, Sliders, ChevronLeft, ChevronRight, Share2, Info, Sparkles, Image as ImageIcon } from 'lucide-react';
import { travelAssistantService, TimeMirrorData } from '../services/travelAssistant';
import Navbar from './Navbar';

export default function TimeMirror() {
  const [places] = useState([
    { id: '1', name: 'قلعة دمشق', yearRange: '1900 - 2024' },
    { id: '2', name: 'سوق الحميدية', yearRange: '1920 - 2024' },
    { id: '3', name: 'الجامع الأموي', yearRange: '1890 - 2024' },
    { id: '4', name: 'ساحة المرجة', yearRange: '1910 - 2024' },
  ]);

  const [selectedPlace, setSelectedPlace] = useState('');
  const [year, setYear] = useState(1950);
  const [timeMirrorData, setTimeMirrorData] = useState<TimeMirrorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPlace) {
      loadTimeMirror();
    }
  }, [selectedPlace, year]);

  const loadTimeMirror = async () => {
    setLoading(true);
    try {
      const data = await travelAssistantService.getTimeMirror(selectedPlace, year);
      setTimeMirrorData(data);
    } catch (error) {
      console.error('Failed to load time mirror:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].pageX - rect.left : (e as React.MouseEvent).pageX - rect.left;
    const pos = (x / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
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
            <History size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">مرآة الزمن: رحلة عبر التاريخ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-cairo">دمشق بين الماضي والحاضر</h1>
          <p className="text-gray-400 max-w-xl mx-auto">شاهد التحولات التاريخية لأعرق عاصمة في التاريخ من خلال عدسة الزمن التفاعلية.</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-8 text-accent">
                <Sliders size={20} />
                <h3 className="text-xl font-bold">إعدادات الرؤية</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3 block">الموقع التاريخي</label>
                  <div className="space-y-2">
                    {places.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => setSelectedPlace(place.id)}
                        className={`w-full text-right p-4 rounded-xl border transition-all ${
                          selectedPlace === place.id 
                          ? 'bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                          : 'bg-white/5 border-glassBorder text-gray-400 hover:border-accent/40'
                        }`}
                      >
                        <div className="font-bold text-sm">{place.name}</div>
                        <div className="text-[10px] opacity-60 uppercase mt-1">{place.yearRange}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-6 block">الخط الزمني (عام {year})</label>
                   <div className="px-2">
                     <input 
                        type="range" 
                        min="1900" 
                        max="2020" 
                        step="10"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                      <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold">
                        <span>1900</span>
                        <span>1960</span>
                        <span>2020</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 border border-glassBorder rounded-2xl">
               <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={18} className="text-accent" />
                  <h4 className="font-bold text-sm">ذكاء اصطناعي</h4>
               </div>
               <p className="text-[10px] text-gray-500 leading-relaxed italic">
                 "تستخدم مرآة الزمن تقنيات الذكاء الاصطناعي لترميم وتلوين الصور القديمة، مما يمنحك تجربة بصرية واقعية للماضي البعيد."
               </p>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-3 space-y-6">
             <div className="glass-panel p-2 overflow-hidden bg-black/40 border-accent/20">
                {selectedPlace ? (
                  <div className="relative group">
                    {loading ? (
                      <div className="aspect-video w-full flex flex-col items-center justify-center">
                        <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
                        <p className="text-accent font-bold animate-pulse">جاري سحب الصور من الأرشيف...</p>
                      </div>
                    ) : (
                      <div 
                        ref={sliderRef}
                        className="relative aspect-video w-full rounded-2xl overflow-hidden cursor-ew-resize select-none"
                        onMouseDown={() => setIsResizing(true)}
                        onMouseUp={() => setIsResizing(false)}
                        onMouseLeave={() => setIsResizing(false)}
                        onMouseMove={handleMove}
                        onTouchMove={handleMove}
                        onTouchStart={() => setIsResizing(true)}
                        onTouchEnd={() => setIsResizing(false)}
                      >
                        {/* Current Image (Background) */}
                        <img 
                          src={timeMirrorData?.currentImage || 'https://images.unsplash.com/photo-1545922016-87c93aae2ce3?q=80&w=1200&auto=format&fit=crop'} 
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          alt="Today"
                        />
                        <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest z-10">
                          اليوم (2024)
                        </div>

                        {/* Historical Image (Foreground with Clip) */}
                        <div 
                          className="absolute inset-0"
                          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                        >
                          <img 
                            src={timeMirrorData?.historicalImage || 'https://images.unsplash.com/photo-1578330107297-b67be34f5979?q=80&w=1200&auto=format&fit=crop'} 
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none brightness-90 sepia-[0.3]"
                            alt={`Year ${year}`}
                          />
                          <div className="absolute top-6 left-6 px-4 py-2 bg-accent/80 backdrop-blur-md rounded-full text-secondary text-xs font-bold border border-accent/20 uppercase tracking-widest z-10">
                             عام {year}
                          </div>
                        </div>

                        {/* Slider Bar */}
                        <div 
                          className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20 cursor-ew-resize pointer-events-none"
                          style={{ left: `${sliderPos}%` }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-4 border-accent rounded-full flex items-center justify-center shadow-xl">
                             <div className="flex gap-1">
                                <div className="w-1 h-3 bg-accent rounded-full"></div>
                                <div className="w-1 h-3 bg-accent rounded-full"></div>
                             </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video w-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                     <div className="p-8 bg-white/5 rounded-full mb-6 text-gray-700">
                        <ImageIcon size={64} />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-500 mb-2 font-cairo">ابدأ استكشاف التاريخ</h3>
                     <p className="text-sm text-gray-600 max-w-sm text-center italic">اختر أحد المواقع التاريخية من القائمة الجانبية لتنشيط مرآة الزمن ومقارنة الحاضر بالماضي.</p>
                  </div>
                )}
             </div>

             <AnimatePresence>
               {timeMirrorData && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="glass-panel p-8"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <Layers size={24} className="text-accent" />
                          <h3 className="text-2xl font-bold">تفاصيل تاريخية</h3>
                       </div>
                       <button className="p-3 bg-white/5 border border-glassBorder rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                          <Share2 size={20} />
                       </button>
                    </div>
                    <p className="text-gray-400 leading-relaxed text-lg font-cairo mb-8">
                       {timeMirrorData.description || `في عام ${year}، كانت هذه المنطقة تشهد حراكاً تجارياً ومعمارياً مختلفاً عما نراه اليوم. الصور الملتقطة توثق تفاصيل دقيقة للزخارف المعمارية وأنماط الحياة التي كانت سائدة في قلب دمشق القديمة.`}
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                       <div className="p-4 bg-white/5 border border-glassBorder rounded-xl text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">المصور الأصلي</div>
                          <div className="font-bold text-accent">أرشيف دمشق الوطني</div>
                       </div>
                       <div className="p-4 bg-white/5 border border-glassBorder rounded-xl text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">تاريخ الأرشفة</div>
                          <div className="font-bold text-accent">مارس 2024</div>
                       </div>
                       <div className="p-4 bg-white/5 border border-glassBorder rounded-xl text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">الدقة الأصلية</div>
                          <div className="font-bold text-accent">تم التحسين بالذكاء الاصطناعي</div>
                       </div>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
