import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, PlaneTakeoff, Info, Store, Tag, CheckCircle2, ShoppingCart, ArrowRight } from 'lucide-react';
import { travelAssistantService, ShoppingItem } from '../services/travelAssistant';
import Navbar from './Navbar';

export default function Shopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    products: [] as string[],
    pickupAirport: 'مطار دمشق الدولي',
    hotel: '',
  });

  useEffect(() => {
    loadShoppingItems();
  }, []);

  const loadShoppingItems = async () => {
    setLoading(true);
    try {
      const data = await travelAssistantService.searchShopping();
      setItems(data);
    } catch (error) {
      console.error('Failed to load shopping items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await travelAssistantService.searchShopping(searchTerm);
      setItems(data);
    } catch (error) {
      console.error('Failed to search shopping items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await travelAssistantService.airportPickupOrder({
        userId: 1, 
        products: orderData.products,
        pickupAirport: orderData.pickupAirport,
        hotel: orderData.hotel,
      });
      setShowOrderForm(false);
      setOrderData({ products: [], pickupAirport: 'مطار دمشق الدولي', hotel: '' });
      alert('تم استلام طلبك! سنقوم بتجهيز الهدايا لتكون جاهزة عند وصولك للمطار.');
    } catch (error) {
      console.error('Failed to place order:', error);
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
            <ShoppingBag size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">دليل التسوق والمقتنيات المحلية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-cairo">اقتنِ قطعة من دمشق</h1>
          <p className="text-gray-400 max-w-xl mx-auto">اكتشف أفضل المنتجات المحلية والتحف الشرقية، واطلب ما تريد لاستلامه لاحقاً من المطار بكل راحة.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content: Search & Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search Bar */}
            <div className="glass-panel p-6 flex items-center gap-4 border-accent/20">
              <div className="relative flex-1">
                <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن هدايا، عطور، أو تحف..."
                  className="w-full bg-white/5 border border-glassBorder rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:border-accent"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="px-8 py-3 bg-accent text-secondary font-bold rounded-xl hover:scale-105 transition-transform"
              >
                بحث
              </button>
            </div>

            {/* Shopping Items Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center">
                <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-500">جاري تصفح المتاجر...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-panel p-6 group hover:border-accent/40 transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/5 rounded-xl border border-glassBorder group-hover:bg-accent/10 group-hover:border-accent/20 transition-all">
                          <Tag size={24} className="text-accent" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          item.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {item.available ? 'متوفر' : 'نفذت الكمية'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                      <div className="flex flex-col gap-2 mb-6">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Store size={14} />
                          <span>{item.shop}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-xs translate-y-2">
                           <span className="px-2 py-0.5 bg-white/5 rounded italic">{item.type}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (item.available) {
                             setOrderData(prev => ({...prev, products: [...prev.products, item.name]}));
                             setShowOrderForm(true);
                          }
                        }}
                        disabled={!item.available}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                          item.available 
                          ? 'bg-white/5 border border-glassBorder hover:border-accent hover:text-accent' 
                          : 'opacity-50 cursor-not-allowed bg-white/5 border border-glassBorder'
                        }`}
                      >
                        <ShoppingCart size={16} />
                        إضافة للطلب
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Panel: Airport Pickup Order */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel p-8 border-accent/30"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-accent text-secondary rounded-xl">
                  <PlaneTakeoff size={24} />
                </div>
                <h2 className="text-2xl font-bold font-cairo">استلم من المطار</h2>
              </div>
              
              <p className="text-sm text-gray-400 mb-8 italic leading-relaxed">
                "وفر على نفسك عناء حمل الهدايا طوال الرحلة، اطلبها الآن وسنقوم بتوصيلها لك مباشرة عند بوابة الوصول أو المغادرة في المطار."
              </p>

              <form onSubmit={handleOrder} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">المنتجات المختارة</label>
                  <div className="min-h-[100px] p-4 bg-white/5 border border-glassBorder rounded-xl text-sm font-bold flex flex-wrap gap-2">
                    {orderData.products.length === 0 ? (
                      <span className="text-gray-600 italic font-normal">اختر منتجات من القائمة...</span>
                    ) : (
                      orderData.products.map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-accent/20 text-accent rounded-lg flex items-center gap-2">
                          {p}
                          <button 
                            type="button" 
                            onClick={() => setOrderData(prev => ({...prev, products: prev.products.filter((_, idx) => idx !== i)}))}
                            className="hover:text-white"
                          >×</button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1">مطار الاستلام</label>
                  <input 
                    type="text" 
                    value={orderData.pickupAirport}
                    onChange={(e) => setOrderData({...orderData, pickupAirport: e.target.value})}
                    className="w-full bg-white/5 border border-glassBorder rounded-xl px-4 py-4 focus:outline-none focus:border-accent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1">الفندق الحالي</label>
                  <input 
                    type="text" 
                    placeholder="اسم الفندق لتأكيد الهوية"
                    required
                    value={orderData.hotel}
                    onChange={(e) => setOrderData({...orderData, hotel: e.target.value})}
                    className="w-full bg-white/5 border border-glassBorder rounded-xl px-4 py-4 focus:outline-none focus:border-accent text-sm"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={orderData.products.length === 0}
                  className="w-full py-4 bg-gradient-gold text-secondary font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={20} />
                  تأكيد طلب التوصيل للمطار
                </button>
              </form>
            </motion.div>

            <div className="p-6 bg-white/5 border border-glassBorder rounded-2xl flex gap-4">
              <Info size={24} className="text-accent shrink-0" />
              <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                تنبيه: خاصية "تسوق واستلم من المطار" تتوفر حالياً في مطار دمشق الدولي فقط، ويفضل الطلب قبل موعد الرحلة بـ 24 ساعة على الأقل.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
