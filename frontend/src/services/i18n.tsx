import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';

type Language = 'ar' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    places: 'الأماكن',
    explore: 'استكشف',
    favorites: 'المفضلة',
    bookings: 'حجوزاتي',
    profile: 'حسابي',
    login: 'دخول',
    logout: 'تسجيل خروج',
    register: 'تسجيل',
    search: 'ابحث عن مكان...',
    welcome: 'أهلا وسهلا بك في دمشق سياحة',
    explore_damascus: 'استكشف دمشق',
    add_review: 'أضف تقييم',
    my_favorites: 'مفضلاتي',
    my_bookings: 'حجوزاتي',
    my_profile: 'حسابي',
    support: 'الدعم الفني',
    itineraries: 'جداولي الزمنية',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    book_now: 'احجز الآن',
    rating: 'التقييم',
    reviews: 'تقييمات',
    about_place: 'عن المكان',
    location: 'الموقع',
    contact: 'التواصل',
    share: 'المشاركة',
    notifications: 'الإشعارات',
    no_notifications: 'لا توجد إشعارات',
    mark_read: 'تعليم كمقروء',
    new_booking: 'حجز جديد',
    booking_confirmed: 'تم تأكيد حجزك',
    support_chat: 'الدعم الفني',
    send: 'إرسال',
    new_chat: 'محادثة جديدة',
    subject: 'الموضوع',
    start_chat: 'ابدأ محادثة',
    close_chat: 'إغلاق المحادثة',
    type_message: 'اكتب رسالتك...',
  },
  en: {
    home: 'Home',
    places: 'Places',
    explore: 'Explore',
    favorites: 'Favorites',
    bookings: 'My Bookings',
    profile: 'My Profile',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    search: 'Search for a place...',
    welcome: 'Welcome to Damascus Tourism',
    explore_damascus: 'Explore Damascus',
    add_review: 'Add Review',
    my_favorites: 'My Favorites',
    my_bookings: 'My Bookings',
    my_profile: 'My Profile',
    support: 'Support',
    itineraries: 'My Itineraries',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    book_now: 'Book Now',
    rating: 'Rating',
    reviews: 'Reviews',
    about_place: 'About This Place',
    location: 'Location',
    contact: 'Contact',
    share: 'Share',
    notifications: 'Notifications',
    no_notifications: 'No notifications yet',
    mark_read: 'Mark all as read',
    new_booking: 'New Booking',
    booking_confirmed: 'Your booking is confirmed',
    support_chat: 'Support Chat',
    send: 'Send',
    new_chat: 'New Chat',
    subject: 'Subject',
    start_chat: 'Start Chat',
    close_chat: 'Close Chat',
    type_message: 'Type your message...',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

// ── Premium LanguageSwitcher ──────────────────────────
export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div
      className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1 gap-1 cursor-pointer select-none"
      style={{ minWidth: 96 }}
    >
      {(['ar', 'en'] as Language[]).map(lang => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className="relative z-10 px-3 py-1 text-xs font-bold rounded-full transition-colors duration-300"
          style={{ color: language === lang ? '#1A1A1A' : 'rgba(255,255,255,0.5)' }}
        >
          {language === lang && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 bg-accent rounded-full"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          {lang === 'ar' ? 'ع' : 'EN'}
        </button>
      ))}
    </div>
  );
}
