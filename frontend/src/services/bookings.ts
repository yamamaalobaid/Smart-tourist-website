import apiClient from './api';

export type BookingCreatePayload = {
  placeId: string;
  startDate: string;
  endDate: string;
  guests?: number;
  notes?: string;
  serviceType?: string;
};

export type BookingRecord = {
  id: string;
  bookingNumber: string;
  placeId: string;
  placeName: string;
  startDate: string;
  endDate: string;
  bookingDate: string;
  guests: number;
  numberOfGuests: number;
  totalPrice: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  notes: string;
  specialRequests?: string;
  createdAt: string;
};

export const bookingService = {
  create: async (payload: BookingCreatePayload) => {
    const body = {
      placeId: payload.placeId,
      serviceType: payload.serviceType || 'tour',
      startDate: payload.startDate,
      endDate: payload.endDate,
      guests: payload.guests ?? 1,
      notes: payload.notes ?? '',
    };

    const resp = await apiClient.post<{ data: BookingRecord }>('/bookings', body);
    return resp.data.data || (resp.data as unknown as BookingRecord);
  },

  list: async () => {
    const resp = await apiClient.get<{ data: BookingRecord[] }>('/bookings');
    return resp.data.data || [];
  },

  cancel: async (bookingId: string, cancellationReason?: string) => {
    const resp = await apiClient.put<{ data: BookingRecord }>(`/bookings/${bookingId}/cancel`, {
      cancellationReason: cancellationReason || null,
    });
    return resp.data.data || (resp.data as unknown as BookingRecord);
  },
};

export default bookingService;
