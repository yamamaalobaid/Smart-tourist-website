import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../services/i18n';

interface Notification {
  id: string;
  type: 'booking' | 'review' | 'promo' | 'system';
  title: string;
  body: string;
  read: boolean;
  time: Date;
}

// Simulated notifications (connected to real booking events in production)
const generateNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'booking',
    title: 'تم تأكيد حجزك',
    body: 'حجزك في المسجد الأموي تم تأكيده بنجاح!',
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'promo',
    title: 'عرض خاص 🎉',
    body: 'خصم 20% على جميع جولات الحي القديم هذا الأسبوع!',
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    type: 'review',
    title: 'شكراً لتقييمك!',
    body: 'تقييمك لمطعم أبو شاكر تم نشره وسيساعد المسافرين الآخرين.',
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    type: 'system',
    title: 'مرحباً بك في دمشق سياحة',
    body: 'اكتشف أجمل الأماكن السياحية وأضفها إلى قائمة مفضلتك.',
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

const typeColors: Record<string, string> = {
  booking: 'bg-green-500/20 text-green-400 border-green-500/30',
  review: 'bg-accent/20 text-accent border-accent/30',
  promo: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  system: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const typeIcons: Record<string, string> = {
  booking: '📅',
  review: '⭐',
  promo: '🎉',
  system: '🔔',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

export default function NotificationBell() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      setNotifications(generateNotifications());
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const remove = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative w-10 h-10 flex items-center justify-center text-gray-300 hover:text-accent transition-colors rounded-xl hover:bg-white/5"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-secondary text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(212,175,55,0.6)]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-full right-0 mt-3 w-96 z-50 glass-panel border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white font-cairo">{t('notifications')}</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-bold rounded-full border border-accent/30">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-accent hover:text-white transition-colors font-bold"
                  >
                    <CheckCheck size={14} />
                    {t('mark_read')}
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="text-5xl opacity-20">🔔</div>
                    <p className="text-gray-500 text-sm font-cairo">{t('no_notifications')}</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        onClick={() => markRead(notif.id)}
                        className={`relative flex gap-4 p-5 border-b border-white/5 cursor-pointer hover:bg-white/3 transition-colors group ${!notif.read ? 'bg-white/5' : ''}`}
                      >
                        {/* Unread dot */}
                        {!notif.read && (
                          <div className="absolute top-5 left-5 w-2 h-2 bg-accent rounded-full shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                        )}

                        {/* Icon */}
                        <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-base ${typeColors[notif.type]}`}>
                          {typeIcons[notif.type]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white mb-0.5 font-cairo">{notif.title}</p>
                          <p className="text-xs text-gray-400 leading-relaxed font-cairo">{notif.body}</p>
                          <p className="text-[10px] text-gray-600 mt-1">{timeAgo(notif.time)}</p>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); remove(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
