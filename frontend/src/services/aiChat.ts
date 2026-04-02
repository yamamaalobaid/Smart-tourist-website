import apiClient from './api';

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIChatResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Simple AI chat service using OpenAI API or fallback to mock responses
export const aiChatService = {
  // Send message to AI and get response
  sendMessage: async (message: string, conversationHistory: ChatMessage[] = []): Promise<string> => {
    try {
      // Try calling backend AI endpoint if it exists
      const response = await apiClient.post<AIChatResponse>('/chat/ai', {
        message,
        history: conversationHistory,
      });

      if (response.data?.success) {
        return response.data.message || 'عذراً، لم أتمكن من فهم سؤالك';
      }
    } catch (err) {
      console.warn('Backend AI not available, using local fallback:', err);
    }

    // Fallback: Mock AI responses for demo
    return aiChatService.getMockResponse(message);
  },

  // Mock AI responses for demonstration
  getMockResponse: (message: string): string => {
    const lowerMsg = message.toLowerCase();

    // Tourism-related responses
    if (lowerMsg.includes('مكان') || lowerMsg.includes('وجهة') || lowerMsg.includes('مسجد') || lowerMsg.includes('متحف')) {
      return 'دمشق مدينة غنية بالمعالم التاريخية والسياحية. يمكنك اكتشاف الجامع الأموي وقلعة دمشق والعديد من المواقع الأخرى من خلال تطبيقنا. هل تريد معلومات محددة عن مكان معين؟';
    }

    if (lowerMsg.includes('حجز') || lowerMsg.includes('booking')) {
      return 'يمكنك الحجز من خلال تطبيقنا بسهولة. اختر المكان المطلوب، حدد التاريخ والعدد، ثم أكمل عملية الحجز. هل تحتاج إلى مساعدة في حجز معين؟';
    }

    if (lowerMsg.includes('سعر') || lowerMsg.includes('تكلفة') || lowerMsg.includes('رسوم')) {
      return 'تختلف الأسعار حسب المكان والخدمات المقدمة. يمكنك عرض أسعار جميع الأماكن في قائمة الاستكشاف. للحصول على أسعار خاصة أو عروض مجموعات، يرجى التواصل معنا مباشرة.';
    }

    if (lowerMsg.includes('ساعات') || lowerMsg.includes('الفتح') || lowerMsg.includes('closing')) {
      return 'تختلف ساعات العمل حسب المكان. يمكنك الاطلاع على ساعات العمل لكل مكان من صفحة التفاصيل الخاصة به. عموماً، معظم المواقع مفتوحة من الصباح حتى المساء.';
    }

    if (lowerMsg.includes('مساعدة') || lowerMsg.includes('help') || lowerMsg.includes('سؤال')) {
      return 'أنا هنا لمساعدتك! يمكنني الإجابة عن أسئلة حول المواقع السياحية في دمشق والحجوزات والأسعار وغيرها. ما الذي تود معرفته؟';
    }

    if (lowerMsg.includes('شكرا') || lowerMsg.includes('thank')) {
      return 'أتمنى أن أكون قد ساعدتك! إذا كان لديك أي أسئلة أخرى، لا تتردد في السؤال. 😊';
    }

    // Default response
    return 'شكراً على سؤالك! يمكنني مساعدتك بمعلومات عن المواقع السياحية في دمشق والحجوزات والأسعار والعروض الخاصة. ما الذي تود معرفته؟';
  },

  // Get suggested questions
  getSuggestedQuestions: (): string[] => [
    'ما هي أفضل الأماكن السياحية في دمشق؟',
    'كيف يمكنني الحجز؟',
    'ما أسعار الحجوزات؟',
    'ما ساعات العمل؟',
    'هل هناك عروض خاصة؟',
  ],
};
