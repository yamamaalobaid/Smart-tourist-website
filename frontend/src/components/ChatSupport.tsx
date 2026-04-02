import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ArrowLeft, Plus, Headphones } from 'lucide-react';
import { useI18n } from '../services/i18n';

interface ChatMessage {
  id: string | number;
  senderId: string | number;
  senderName: string;
  message?: string;
  content?: string;
  body?: string;
  createdAt: string;
  isAdmin: boolean;
}

interface Chat {
  id: string | number;
  userId: string | number;
  status: 'open' | 'closed';
  subject: string;
  messages: ChatMessage[];
  createdAt: string;
}

export default function ChatSupport() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) fetchUserChats();
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  useEffect(() => {
    if (activeChat && isOpen) inputRef.current?.focus();
  }, [activeChat, isOpen]);

  const fetchUserChats = async () => {
    try {
      const response = await apiClient.get('/chat');
      setChats(response.data);
    } catch {}
  };

  const handleStartChat = async () => {
    if (!subject.trim()) return;
    try {
      setLoading(true);
      const response = await apiClient.post('/chat', { subject });
      setChats(prev => [...prev, response.data]);
      setActiveChat(response.data);
      setSubject('');
      setShowNewChat(false);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      setLoading(true);
      const response = await apiClient.post(`/chat/${activeChat.id}/messages`, { message: newMessage });
      setActiveChat(prev => prev ? ({ ...prev, messages: [...(prev.messages || []), response.data] }) : prev);
      setNewMessage('');
    } catch {}
    finally { setLoading(false); }
  };

  const handleCloseChat = async () => {
    if (!activeChat) return;
    try {
      await apiClient.put(`/chat/${activeChat.id}/close`);
      setActiveChat(null);
      fetchUserChats();
    } catch {}
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(v => !v)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl z-50 transition-all ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
            : 'bg-gradient-gold text-secondary shadow-[0_0_30px_rgba(212,175,55,0.4)]'
        }`}
        style={{ boxShadow: isOpen ? '0 0 30px rgba(239,68,68,0.3)' : '0 0 30px rgba(212,175,55,0.3)' }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-32 right-8 w-96 glass-panel border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden flex flex-col font-cairo"
            style={{ maxHeight: 560 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-accent/20 to-transparent border-b border-white/5">
              <div className="p-2 bg-accent/20 rounded-xl border border-accent/30 text-accent">
                <Headphones size={22} />
              </div>
              <div className="flex-1">
                <p className="font-black text-white">{t('support_chat')}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold">نحن هنا لمساعدتك</p>
                </div>
              </div>
              {activeChat && (
                <button
                  onClick={() => setActiveChat(null)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Chat List View */}
              {!activeChat && !showNewChat && (
                <div className="space-y-3">
                  {chats.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3 opacity-20">💬</div>
                      <p className="text-gray-500 text-sm">لا توجد محادثات بعد</p>
                    </div>
                  ) : (
                    chats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className="w-full text-right p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 rounded-2xl transition-all"
                      >
                        <p className="font-bold text-white text-sm">{chat.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${chat.status === 'open' ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <p className="text-xs text-gray-500">{chat.status === 'open' ? 'مفتوح' : 'مغلق'}</p>
                        </div>
                      </button>
                    ))
                  )}
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="w-full mt-4 py-4 bg-accent/10 border border-accent/20 text-accent rounded-2xl hover:bg-accent/20 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    {t('new_chat')}
                  </button>
                </div>
              )}

              {/* New Chat Form */}
              {showNewChat && (
                <div className="space-y-4">
                  <button onClick={() => setShowNewChat(false)} className="flex items-center gap-2 text-sm text-accent hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    <span>رجوع</span>
                  </button>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{t('subject')}</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                      placeholder="مثال: مشكلة في الحجز"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleStartChat}
                    disabled={loading || !subject.trim()}
                    className="w-full py-4 bg-accent text-secondary font-black rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
                  >
                    {loading ? '...' : t('start_chat')}
                  </button>
                </div>
              )}

              {/* Messages View */}
              {activeChat && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 text-center mb-4 font-bold uppercase tracking-widest">{activeChat.subject}</p>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(activeChat.messages || []).map((msg, idx) => {
                      const text = msg.message ?? msg.content ?? msg.body ?? '';
                      const time = msg.createdAt || new Date().toISOString();
                      const senderId = (msg as any).senderId ?? (msg as any).userId ?? 0;
                      const isMe = String(senderId) === String(user.id);
                      return (
                        <div key={msg.id ?? idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-accent text-secondary font-bold rounded-br-none'
                              : 'bg-white/10 text-gray-200 rounded-bl-none'
                          }`}>
                            <p>{text}</p>
                            <p className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                              {new Date(time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            {activeChat && (
              <div className="p-4 border-t border-white/5 space-y-2">
                {activeChat.status === 'open' ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder={t('type_message')}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none transition-all text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="w-12 h-12 bg-accent text-secondary rounded-xl flex items-center justify-center hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    <button
                      onClick={handleCloseChat}
                      className="w-full py-2 text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all font-bold"
                    >
                      {t('close_chat')}
                    </button>
                  </>
                ) : (
                  <p className="text-center text-gray-500 text-sm py-2">هذه المحادثة مغلقة</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
