import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Globe, Image as ImageIcon, Save, CheckCircle, 
  AlertCircle, LayoutDashboard, Trophy, MapPin, Calendar, Star, 
  BarChart3, Sparkles, TrendingUp, Award, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'analytics'>('analytics');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    language: 'ar',
    avatarUrl: '',
  });

  // Mock Analytics Data (Point 17)
  const analytics = {
    placesVisited: 14,
    totalBookings: 8,
    reviewsGiven: 22,
    travelerRank: 'مستكشف ذهبي',
    rankProgress: 75,
    topCategory: 'تاريخي',
    loyaltyPoints: 1250,
    annualReport: {
      mostVisited: 'الجامع الأموي',
      favSeason: 'الربيع',
      totalSpent: '450,000'
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      language: user.language || 'ar',
      avatarUrl: user.avatarUrl || '',
    });
  }, [user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await authService.updateProfile(formData);
      setAuth(localStorage.getItem('token')!, result.user);
      setSuccess('تم تحديث الملف الشخصي بنجاح!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background font-cairo text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-20 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="max-w-6xl mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="relative group"
               >
                  <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-glassBorder shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                     {formData.avatarUrl ? (
                       <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full bg-surface/50 flex items-center justify-center text-accent">
                          <User size={64} />
                       </div>
                     )}
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-gradient-gold p-3 rounded-2xl text-secondary shadow-lg">
                     <Award size={24} />
                  </div>
               </motion.div>
               
               <div className="text-center md:text-right">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-bold mb-3"
                  >
                    أهلاً بك، {formData.firstName}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-lg font-light tracking-wide"
                  >
                    رتبتك الحالية: <span className="text-accent font-bold">{analytics.travelerRank}</span>
                  </motion.p>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-glassBorder mb-12">
               {[
                 { id: 'analytics', label: 'التقرير السنوي والتحليلات', icon: BarChart3 },
                 { id: 'profile', label: 'إعدادات الحساب', icon: User }
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-accent' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                   <tab.icon size={18} />
                   {tab.label}
                   {activeTab === tab.id && (
                     <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent shadow-[0_0_10px_#d4af37]" />
                   )}
                 </button>
               ))}
            </div>

            <AnimatePresence mode="wait">
               {activeTab === 'analytics' ? (
                 <motion.div 
                   key="analytics"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="space-y-10"
                 >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       {[
                         { label: 'أماكن زرتها', val: analytics.placesVisited, icon: MapPin, color: 'text-blue-400' },
                         { label: 'إجمالي الحجوزات', val: analytics.totalBookings, icon: Calendar, color: 'text-green-400' },
                         { label: 'تقييمات كتبتّها', val: analytics.reviewsGiven, icon: Star, color: 'text-yellow-400' },
                         { label: 'نقاط الولاء', val: analytics.loyaltyPoints, icon: Zap, color: 'text-accent' }
                       ].map((stat, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="glass-panel p-6 border-white/5 group hover:border-accent/30 transition-all"
                         >
                            <stat.icon className={`mb-4 ${stat.color}`} size={24} />
                            <div className="text-3xl font-bold mb-1 font-outfit">{stat.val}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
                         </motion.div>
                       ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                       {/* Traveler Rank Card */}
                       <div className="lg:col-span-1 glass-panel p-8 border-accent/20 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                             <Trophy className="text-accent" size={20} />
                             تقدم الرتبة
                          </h3>
                          <div className="flex flex-col items-center mb-8">
                             <div className="relative w-32 h-32 mb-4">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                   <path className="text-gray-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                   <path className="text-accent" strokeDasharray={`${analytics.rankProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-outfit">
                                   {analytics.rankProgress}%
                                </div>
                             </div>
                             <p className="text-sm text-gray-400 text-center">أنت على بعد 250 نقطة من رتبة <span className="text-accent font-bold">مستكشف أسطوري</span></p>
                          </div>
                          <div className="space-y-3">
                             <div className="flex justify-between text-xs">
                                <span className="text-gray-500">الرتبة الحالية</span>
                                <span className="font-bold">ذهبي</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                <span className="text-gray-500">إجمالي النقاط</span>
                                <span className="font-bold font-outfit">{analytics.loyaltyPoints}</span>
                             </div>
                          </div>
                       </div>

                       {/* Annual Report & Insights */}
                       <div className="lg:col-span-2 glass-panel p-8">
                          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                             <TrendingUp className="text-accent" size={20} />
                             رؤى عام 2024
                          </h3>
                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-6">
                                <div className="p-5 bg-white/5 border border-glassBorder rounded-2xl">
                                   <div className="text-xs text-gray-500 font-bold mb-1 uppercase">المكان المفضل</div>
                                   <div className="text-xl font-bold text-white">{analytics.annualReport.mostVisited}</div>
                                </div>
                                <div className="p-5 bg-white/5 border border-glassBorder rounded-2xl">
                                   <div className="text-xs text-gray-500 font-bold mb-1 uppercase">الفصل المفضل للسفر</div>
                                   <div className="text-xl font-bold text-white">{analytics.annualReport.favSeason}</div>
                                </div>
                                <div className="p-5 bg-white/5 border border-glassBorder rounded-2xl">
                                   <div className="text-xs text-gray-500 font-bold mb-1 uppercase">إجمالي الإنفاق السياحي</div>
                                   <div className="text-xl font-bold text-accent font-outfit">{analytics.annualReport.totalSpent} ل.س</div>
                                </div>
                             </div>

                             <div className="glass-panel p-6 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
                                <div className="flex items-center gap-3 mb-4">
                                   <Sparkles size={20} className="text-accent" />
                                   <h4 className="font-bold">توصيات مخصصة لك</h4>
                                </div>
                                <p className="text-sm text-gray-400 mb-6 leading-relaxed">بناءً على اهتمامك بالأماكن <span className="text-white font-bold">{analytics.topCategory}</span>، ننصحك بزيارة الأماكن التالية في رحلتك القادمة:</p>
                                <div className="space-y-4">
                                   {['خيمة النوفرة', 'بيت نظام'].map((place, i) => (
                                     <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-glassBorder">
                                        <span className="font-bold text-sm">{place}</span>
                                        <button className="text-[10px] bg-accent/20 text-accent px-3 py-1 rounded-full hover:bg-accent hover:text-secondary font-bold transition-all">استكشف</button>
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="profile"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="glass-panel p-8 md:p-12"
                 >
                    <form onSubmit={handleSubmit} className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">الاسم الأول</label>
                             <div className="relative">
                                <User className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input
                                  type="text"
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glassBorder rounded-2xl focus:border-accent outline-none"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">الاسم الأخير</label>
                             <div className="relative">
                                <User className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input
                                  type="text"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glassBorder rounded-2xl focus:border-accent outline-none"
                                />
                             </div>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">البريد الإلكتروني</label>
                             <div className="relative">
                                <Mail className="absolute left-4 top-4 text-gray-700" size={20} />
                                <input
                                  type="email"
                                  value={user.email}
                                  disabled
                                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-glassBorder rounded-2xl text-gray-600 font-outfit cursor-not-allowed"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">رقم الهاتف</label>
                             <div className="relative">
                                <Phone className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glassBorder rounded-2xl focus:border-accent outline-none"
                                />
                             </div>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">رابط الصورة الشخصية</label>
                             <div className="relative">
                                <ImageIcon className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input
                                  type="url"
                                  name="avatarUrl"
                                  value={formData.avatarUrl}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glassBorder rounded-2xl focus:border-accent outline-none"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">اللغة المفضلة</label>
                             <div className="relative">
                                <Globe className="absolute left-4 top-4 text-gray-500 z-10" size={20} />
                                <select
                                  name="language"
                                  value={formData.language}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glassBorder rounded-2xl focus:border-accent outline-none appearance-none [&>option]:bg-surface"
                                >
                                  <option value="ar">العربية (Arabic)</option>
                                  <option value="en">English (الإنجليزية)</option>
                                </select>
                             </div>
                          </div>
                       </div>

                       {user.role === 'admin' && (
                         <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="p-4 bg-accent/20 rounded-xl">
                                  <LayoutDashboard className="text-accent" size={24} />
                               </div>
                               <div>
                                  <h4 className="text-lg font-bold">لوحة الإدارة</h4>
                                  <p className="text-xs text-gray-500">لديك صلاحيات كاملة لإدارة النظام</p>
                               </div>
                            </div>
                            <Link to="/admin" className="px-6 py-3 bg-accent text-secondary font-bold rounded-xl hover:shadow-lg transition-all">دخول اللوحة</Link>
                         </div>
                       )}

                       <div className="pt-8 border-t border-glassBorder flex flex-col md:flex-row gap-4 items-center">
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-5 bg-gradient-gold text-secondary font-bold rounded-2xl hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3"
                          >
                             {loading ? <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
                             <span>حفظ التغييرات</span>
                          </button>
                          
                          {success && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-sm font-bold">
                               <CheckCircle size={18} />
                               تم الحفظ بنجاح
                            </motion.div>
                          )}
                          {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm font-bold">
                               <AlertCircle size={18} />
                               {error}
                            </motion.div>
                          )}
                       </div>
                    </form>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
