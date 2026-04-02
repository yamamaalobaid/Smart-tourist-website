import apiClient from './api';

// Frontend may send a range (startDate/endDate) or a single bookingDate.
export type BookingCreatePayload = {
  placeId: string;
  // optional frontend fields
  startDate?: string; // ISO
  endDate?: string; // ISO
  guests?: number;
  notes?: string;

  // backend-native fields (optional)
  bookingDate?: string; // ISO
  serviceType?: string;
  numberOfGuests?: number;
  specialRequests?: string;
};

export const bookingService = {
  create: async (payload: BookingCreatePayload) => {
    // Normalize to backend expected fields
    const body: any = {
      placeId: payload.placeId,
      // default service type: 'tour'
      serviceType: payload.serviceType || 'tour',
    };

    if (payload.bookingDate) {
      body.bookingDate = payload.bookingDate;
    } else if (payload.startDate) {
      // backend expects a single bookingDate; use startDate
      body.bookingDate = payload.startDate;
    }

    body.numberOfGuests = payload.numberOfGuests ?? payload.guests ?? 1;
    body.specialRequests = payload.specialRequests ?? payload.notes ?? null;

    const resp = await apiClient.post('/bookings', body);
    return resp.data;
  },

  list: async () => {
    const resp = await apiClient.get('/bookings');
    return resp.data;
  },
};

export default bookingService;
