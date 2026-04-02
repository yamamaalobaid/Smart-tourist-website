import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';
import { motion } from 'framer-motion';
import { MapPin, User, Mail, Phone, Lock, AlertCircle, ArrowRight, Shield, Globe } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات السر غير متطابقة');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      const { token, user } = response.data;
      setAuth(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ في التسجيل. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden font-cairo">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black z-10" />
         <img 
           src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=2070" 
           alt="Old Damascus" 
           className="w-full h-full object-cover opacity-40 scale-110 animate-slow-zoom"
         />
      </div>

      {/* Ambient Lighting */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.6 }}
         className="glass-panel p-10 w-full max-w-xl relative z-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
      >
        <div className="text-center mb-10">
          <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", delay: 0.2 }}
             className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg text-secondary"
          >
            <MapPin size={32} />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">ابدأ رحلتك</h1>
          <p className="text-gray-400 font-light text-sm">كن جزءاً من مجتمع دمشق السياحية اليوم</p>
        </div>

        {error && (
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <p className="text-red-400 text-xs font-bold leading-relaxed">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">الاسم الأول</label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="أحمد"
                  className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">الاسم الأخير</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="محمد"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">البريد الإلكتروني</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">رقم الهاتف (اختياري)</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+963 9xx xxx xxx"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">تأكيد كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit tracking-widest"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-6 bg-accent text-secondary font-black rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            ) : (
              <>
                <span>إنشاء حساب</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="my-10 flex items-center gap-4">
           <div className="h-px bg-white/10 flex-1" />
           <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center min-w-[80px]">أو المتابعة عبر</span>
           <div className="h-px bg-white/10 flex-1" />
        </div>

        <div className="flex gap-4">
           <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-sm">
              <Globe size={18} />
              Google
           </button>
           <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-sm">
              <Shield size={18} />
              GitHub
           </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-10 font-light">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-accent font-bold hover:text-white transition-all underline underline-offset-4 decoration-accent/30 hover:decoration-accent">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
