import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, AlertCircle, MessageSquare, Plus, X } from 'lucide-react';

interface Message {
  id?: number;
  senderId: number;
  senderName?: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

interface Chat {
  id: number;
  userId: number;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  messages: Message[];
  createdAt: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchChats();
  }, [user, navigate]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/chat');
      const data = response.data?.data || response.data || [];
      setChats(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch chats:', err);
      setError(err.response?.data?.message || 'فشل في جلب المحادثات');
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatSubject.trim()) return;

    try {
      const response = await apiClient.post('/chat', { subject: newChatSubject });
      const newChat = response.data?.data || response.data;
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      setNewChatSubject('');
      setShowNewChatForm(false);
      scrollToBottom();
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      setError(err.response?.data?.message || 'فشل في إنشاء المحادثة');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;

    setSending(true);
    try {
      const response = await apiClient.post(`/chat/${selectedChat.id}/messages`, {
        content: messageText,
      });
      const newMessage = response.data?.data || response.data;
      
      const updatedChat = {
        ...selectedChat,
        messages: [...(selectedChat.messages || []), newMessage],
      };
      
      setSelectedChat(updatedChat);
      setChats(prevChats => prevChats.map(c => c.id === selectedChat.id ? updatedChat : c));
      setMessageText('');
      scrollToBottom();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Whenever selected chat changes, scroll down
  useEffect(() => {
     if (selectedChat) {
        scrollToBottom();
     }
  }, [selectedChat]);

  const getStatusBg = (status: string) => {
     switch(status) {
        case 'open': return 'bg-green-500/20 text-green-400';
        case 'closed': return 'bg-gray-500/20 text-gray-400';
        default: return 'bg-yellow-500/20 text-yellow-400';
     }
  };

  const getStatusText = (status: string) => {
     switch(status) {
        case 'open': return 'مفتوح';
        case 'closed': return 'مغلق';
        default: return 'قيد الانتظار';
     }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background font-outfit h-screen overflow-hidden">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 pt-24 md:pt-32 pb-6 flex flex-col font-cairo">
         
         <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-surface border border-glassBorder rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.15)]">
               <MessageSquare className="w-8 h-8 text-accent" />
            </div>
            <div>
               <h1 className="text-3xl font-bold text-white tracking-wide">الدعم والدردشة</h1>
               <p className="text-sm font-light text-gray-400">تواصل مع فريق الدعم لحل مشاكلك</p>
            </div>
         </div>

         {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 backdrop-blur-md">
               <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />
               <p className="text-red-400 font-medium">{error}</p>
            </motion.div>
         )}

         <div className="flex-1 glass-panel border border-glassBorder rounded-2xl flex overflow-hidden shadow-2xl relative">
            
            {/* Sidebar - Chats List */}
            <div className={`w-full md:w-1/3 flex flex-col border-r border-glassBorder bg-black/40 absolute md:relative z-20 h-full transition-transform duration-300 ${selectedChat ? 'translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
               <div className="p-6 border-b border-glassBorder flex justify-between items-center bg-black/40 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-white">المحادثات</h2>
                  <button
                     onClick={() => setShowNewChatForm(!showNewChatForm)}
                     className="w-8 h-8 bg-gradient-gold text-secondary flex justify-center items-center rounded-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
                  >
                     {showNewChatForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
               </div>
               
               <div className="flex-1 custom-scrollbar overflow-y-auto relative">
                <AnimatePresence>
                  {showNewChatForm && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-black/80 backdrop-blur-xl border-b border-glassBorder overflow-hidden"
                     >
                        <form onSubmit={handleCreateChat} className="p-4 space-y-3">
                           <input
                              type="text"
                              placeholder="موضوع المحادثة الجديدة..."
                              value={newChatSubject}
                              onChange={(e) => setNewChatSubject(e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-glassBorder rounded-xl focus:outline-none focus:border-accent text-white font-outfit text-sm"
                           />
                           <div className="flex gap-2">
                              <button
                                 type="submit"
                                 className="flex-1 bg-gradient-gold text-secondary font-bold py-2 rounded-xl text-sm"
                              >
                                 إنشاء
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setShowNewChatForm(false)}
                                 className="flex-1 bg-white/5 border border-glassBorder text-gray-300 py-2 rounded-xl text-sm hover:bg-white/10"
                              >
                                 إلغاء
                              </button>
                           </div>
                        </form>
                     </motion.div>
                  )}
                 </AnimatePresence>

                  {loading ? (
                     <div className="flex justify-center items-center py-10">
                        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
                     </div>
                  ) : chats.length === 0 ? (
                     <div className="text-center py-10 opacity-70">
                        <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">لا توجد محادثات</p>
                     </div>
                  ) : (
                     <div className="p-2 space-y-1">
                        {chats.map(chat => (
                           <button
                              key={chat.id}
                              onClick={() => setSelectedChat(chat)}
                              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                                 selectedChat?.id === chat.id 
                                 ? 'bg-gradient-gold text-secondary shadow-[0_0_15px_rgba(212,175,55,0.2)] border-transparent' 
                                 : 'hover:bg-white/5 text-gray-300 border border-transparent hover:border-glassBorder'
                              }`}
                           >
                              <div className="text-right flex-1 truncate pl-3">
                                 <h3 className={`font-bold truncate ${selectedChat?.id === chat.id ? 'text-secondary' : 'text-white'}`}>
                                    {chat.subject}
                                 </h3>
                              </div>
                              <div className={`px-2 py-1 rounded-md text-xs font-bold shrink-0 ${
                                 selectedChat?.id === chat.id 
                                 ? 'bg-black/20 text-secondary' 
                                 : getStatusBg(chat.status)
                              }`}>
                                 {getStatusText(chat.status)}
                              </div>
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col relative w-full h-full bg-background/50">
               {selectedChat ? (
                  <>
                     {/* Chat Header */}
                     <div className="p-4 md:p-6 border-b border-glassBorder bg-black/40 backdrop-blur-md flex items-center gap-4 absolute top-0 w-full z-10 transition-transform">
                        <button 
                           onClick={() => setSelectedChat(null)}
                           className="md:hidden p-2 bg-white/5 border border-glassBorder rounded-lg text-white font-bold"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        
                        <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center border border-glassBorder text-accent shadow-[0_0_10px_rgba(212,175,55,0.15)] relative shrink-0">
                           <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="truncate flex-1">
                           <h2 className="text-xl font-bold text-white truncate">{selectedChat.subject}</h2>
                           <div className="flex items-center gap-2 mt-1">
                              <span className={`w-2 h-2 rounded-full ${selectedChat.status === 'open' ? 'bg-green-500' : selectedChat.status === 'closed' ? 'bg-gray-500' : 'bg-yellow-500'}`}></span>
                              <p className="text-xs font-light tracking-widest text-gray-400">
                                 الحالة: {getStatusText(selectedChat.status)}
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Messages List */}
                     <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar pt-28 pb-4">
                        {(selectedChat.messages || []).length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                              <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                              <p className="text-gray-400 font-light max-w-sm">المحادثة فارغة، ابدأ بكتابة رسالتك الآن.</p>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {(selectedChat.messages || []).map((msg, index) => {
                                 const isMe = msg.senderId === user.id;
                                 return (
                                    <motion.div 
                                       initial={{ opacity: 0, y: 10 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       key={msg.id || index} 
                                       className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                       <div 
                                          className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                                             isMe 
                                             ? 'bg-gradient-gold text-secondary rounded-tl-sm' 
                                             : 'bg-white/10 text-white border border-glassBorder rounded-tr-sm'
                                          }`}
                                       >
                                          {!isMe && msg.senderName && (
                                             <p className="text-xs font-bold text-accent mb-1">{msg.senderName}</p>
                                          )}
                                          <p className={`text-base leading-relaxed ${isMe ? 'font-medium' : 'font-light'}`}>{msg.content}</p>
                                          <p className={`text-xs mt-2 text-left ${isMe ? 'text-secondary/70' : 'text-gray-500 font-outfit'}`}>
                                             {new Date(msg.timestamp || Date.now()).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                       </div>
                                    </motion.div>
                                 )
                              })}
                              <div ref={messagesEndRef} />
                           </div>
                        )}
                     </div>

                     {/* Message Input */}
                     {selectedChat.status !== 'closed' && (
                        <div className="p-4 bg-black/60 border-t border-glassBorder backdrop-blur-xl">
                           <form onSubmit={handleSendMessage} className="flex gap-3 md:gap-4 items-center">
                              <input
                                 type="text"
                                 value={messageText}
                                 onChange={(e) => setMessageText(e.target.value)}
                                 placeholder="اكتب رسالتك هنا..."
                                 className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white/5 border border-glassBorder rounded-xl focus:outline-none focus:border-accent text-white font-outfit"
                                 disabled={sending}
                              />
                              <button
                                 type="submit"
                                 disabled={sending || !messageText.trim()}
                                 className="w-12 h-12 md:w-14 md:h-14 bg-gradient-gold text-secondary rounded-xl hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                              >
                                 <Send className="w-5 h-5 md:w-6 md:h-6 rotate-180 ml-1" />
                              </button>
                           </form>
                        </div>
                     )}
                     {selectedChat.status === 'closed' && (
                        <div className="p-4 bg-black/60 border-t border-glassBorder backdrop-blur-xl text-center">
                           <p className="text-red-400 font-light text-sm">هذه المحادثة مغلقة، لا يمكنك إرسال رسائل.</p>
                        </div>
                     )}
                  </>
               ) : (
                  <div className="hidden md:flex flex-1 items-center justify-center text-center p-6">
                     <div>
                        <MessageSquare className="w-20 h-20 text-gray-700 mx-auto mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold text-white mb-2">اختر محادثة</h2>
                        <p className="text-gray-400 font-light">اختر محادثة من القائمة أو أنشئ محادثة جديدة للتواصل مع الدعم الفني.</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
