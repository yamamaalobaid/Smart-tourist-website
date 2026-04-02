import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, MapPin, ArrowRight, Shield, Globe } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { authService } = await import('../services/auth');
      const response = await authService.loginWithIdentifier(identifier, password);

      const { token, user } = response;
      setAuth(token, user);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ في تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden font-cairo">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
         <img 
           src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=2070" 
           alt="Old Damascus" 
           className="w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom"
         />
      </div>

      {/* Ambient Lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8, ease: "easeOut" }}
         className="glass-panel p-10 w-full max-w-md relative z-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
      >
        <div className="text-center mb-10">
          <motion.div 
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ type: "spring", delay: 0.3 }}
             className="w-20 h-20 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_20px_rgba(212,175,55,0.3)] text-secondary"
          >
            <MapPin size={36} />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">دمشق السياحية</h1>
          <p className="text-gray-400 font-light text-sm">استكشف عبق التاريخ في أقدم عاصمة مسكونة</p>
        </div>

        {error && (
          <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-red-400 text-xs font-bold">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">البريد الإلكتروني أو الهاتف</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
               <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">كلمة المرور</label>
               <Link to="#" className="text-[10px] text-accent hover:text-white transition-colors uppercase font-bold tracking-widest">نسيت كلمة المرور؟</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-accent focus:bg-white/10 outline-none transition-all font-outfit tracking-widest"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-accent text-secondary font-black rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
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

        <div className="flex gap-4 mb-10">
           <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-sm">
              <Globe size={18} />
              Google
           </button>
           <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-sm">
              <Shield size={18} />
              GitHub
           </button>
        </div>

        <p className="text-center text-sm text-gray-500 font-light">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-accent font-bold hover:text-white transition-all underline underline-offset-4 decoration-accent/30 hover:decoration-accent">
            ابدأ رحلتك الآن
          </Link>
        </p>
      </motion.div>

      {/* Bottom Security Badge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
         <Lock size={12} className="text-gray-500" />
         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">End-to-End Encrypted Session</span>
      </div>
    </div>
  );
}
