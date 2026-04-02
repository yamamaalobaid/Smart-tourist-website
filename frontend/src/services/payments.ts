import apiClient from './api';

export type PaymentSession = {
  sessionId: string;
  url: string;
  paymentData: {
    amount: number;
    currency: string;
    bookingNumber: string;
    placeName?: string;
    bookingDate: string;
  };
};

export const paymentService = {
  createSession: async (bookingId: string, currency = 'syp') => {
    const response = await apiClient.post<PaymentSession>('/payments/create-session', {
      bookingId,
      currency,
    });

    return response.data;
  },
};

export default paymentService;
