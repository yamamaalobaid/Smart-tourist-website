import { useState, useRef, useEffect } from 'react';
import { aiChatService, ChatMessage } from '../services/aiChat';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك بشأن دمشق والمعالم السياحية؟',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestedQuestions = aiChatService.getSuggestedQuestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await aiChatService.sendMessage(text, messages);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة لاحقاً.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-8 z-50">
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-damascus shadow-lg hover:shadow-xl transition"
        >
          <span className="text-2xl">🤖</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-96 h-screen max-h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-damascus text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">مساعد دمشق الذكي 🤖</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xl hover:bg-white/20 p-1 rounded transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-bl-none'
                      : 'bg-gray-100 text-gray-900 rounded-br-none font-medium'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg rounded-br-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 space-y-3 border-t border-slate-200 bg-slate-50/80">
              <p className="text-xs text-slate-700 font-bold">اقتراحات سريعة:</p>
              <div className="space-y-2">
                {suggestedQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-right text-sm text-slate-800 bg-white hover:bg-amber-50 hover:border-amber-300 p-3 rounded-xl transition-all border border-slate-300 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2 bg-gray-50">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب سؤالك..."
              className="flex-1 border-2 border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-md"
              disabled={loading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-colors duration-200 shadow-sm"
            >
              إرسال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
