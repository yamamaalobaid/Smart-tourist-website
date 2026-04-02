import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LanguageSwitcher, { useI18n } from '../services/i18n';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, MapPin } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTravelAssistant, setShowTravelAssistant] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/places', label: t('places') },
    { to: '/explore', label: `🔍 ${t('explore')}` },
  ];

  if (user) {
    navLinks.push({ to: '/favorites', label: `❤️ ${t('favorites')}` });
    navLinks.push({ to: '/bookings', label: `📅 ${t('bookings')}` });
    navLinks.push({ to: '/itineraries', label: `🗺️ ${t('itineraries')}` });
    navLinks.push({ to: '/chat', label: `💬 الدردشة` });
    if (user.role === 'admin') {
      navLinks.push({ to: '/admin', label: `🛡️ لوحة الإدارة` });
    }
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 font-outfit ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-glassBorder shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-2' : 'bg-transparent py-4'}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${scrolled ? 'bg-gradient-gold' : 'glass-panel border-glassBorder shadow-[0_0_15px_rgba(255,255,255,0.1)]'}`}>
              <MapPin className={`w-6 h-6 ${scrolled ? 'text-secondary' : 'text-accent'}`} />
            </div>
            <span className="text-2xl font-bold font-cairo text-white group-hover:text-primary transition-colors hidden sm:block">
              رحلتك معنا  
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`text-sm font-medium transition-colors font-cairo hover:text-accent ${location.pathname === link.to ? 'text-accent' : 'text-gray-300'}`}
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowTravelAssistant(!showTravelAssistant)}
                  className="text-sm font-medium text-gray-300 hover:text-accent transition-colors flex items-center gap-1 font-cairo"
                >
                  🛡️ مساعد السفر
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTravelAssistant ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showTravelAssistant && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-48 glass-panel border border-glassBorder py-2 z-50 shadow-2xl"
                    >
                      {[
                        { to: '/emergency', label: '🚨 الطوارئ' },
                        { to: '/shopping', label: '🛍️ التسوق' },
                        { to: '/transport', label: '🚗 النقل' },
                        { to: '/health', label: '🏥 الصحة' },
                        { to: '/luggage', label: '🧳 الأمتعة' },
                        { to: '/analytics', label: '📊 التحليلات' },
                        { to: '/time-mirror', label: '🕰️ مرآة الزمن' }
                      ].map((subLink) => (
                        <Link 
                          key={subLink.to}
                          to={subLink.to} 
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-accent hover:bg-glass transition-colors font-cairo"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div className="pl-4 border-l border-glassBorder ml-2 flex items-center gap-3">
              {user && <NotificationBell />}
              <LanguageSwitcher />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4 border-r border-glassBorder pr-6">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 font-medium font-cairo pr-4">أهلاً, {user.firstName}</span>
                <Link
                  to="/profile"
                  className="w-10 h-10 rounded-full bg-surface border border-glassBorder flex items-center justify-center text-gray-300 hover:text-accent hover:border-accent transition-all"
                  title="حسابي"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                  title="تسجيل خروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-accent font-medium font-cairo transition-colors">
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-gold text-secondary font-bold font-cairo rounded-full hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button  */}
          <div className="lg:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-accent p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-glassBorder overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="block px-4 py-3 text-base text-gray-300 hover:text-accent hover:bg-glass rounded-lg font-cairo"
                >
                  {link.label}
                </Link>
              ))}

              {user && (
                <div className="border-t border-glassBorder mt-4 pt-4">
                  <div className="px-4 text-xs font-semibold text-gray-500 mb-2 font-cairo">🛡️ مساعد السفر</div>
                  {[
                    { to: '/emergency', label: '🚨 الطوارئ' },
                    { to: '/shopping', label: '🛍️ التسوق' },
                    { to: '/transport', label: '🚗 النقل' },
                    { to: '/health', label: '🏥 الصحة' },
                    { to: '/luggage', label: '🧳 الأمتعة' },
                    { to: '/analytics', label: '📊 التحليلات' },
                    { to: '/time-mirror', label: '🕰️ مرآة الزمن' }
                  ].map((subLink) => (
                    <Link 
                      key={subLink.to}
                      to={subLink.to} 
                      className="block px-8 py-2 text-sm text-gray-300 hover:text-accent hover:bg-glass rounded-lg font-cairo"
                    >
                      {subLink.label}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="border-t border-glassBorder mt-4 pt-4 px-4 space-y-3">
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-accent hover:bg-glass font-cairo rounded-lg">
                    <User className="w-5 h-5"/> {t('profile')}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 font-cairo"
                  >
                    <LogOut className="w-5 h-5"/> تسجيل خروج
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="block text-center py-3 text-gray-300 hover:text-accent hover:bg-glass border border-glassBorder font-cairo rounded-lg">
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center py-3 bg-gradient-gold text-secondary font-bold font-cairo rounded-lg"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
