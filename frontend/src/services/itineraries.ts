import apiClient from './api';

export interface Itinerary {
  id: number;
  userId: number;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  days?: ItineraryDay[];
}

export interface ItineraryDay {
  id: number;
  itineraryId: number;
  dayNumber: number;
  date: string;
  titleAr?: string;
  titleEn?: string;
  notes?: string;
  items?: ItineraryItem[];
}

export interface ItineraryItem {
  id: number;
  itineraryDayId: number;
  placeId: number;
  startTime?: string;
  endTime?: string;
  transportMode?: string;
  notes?: string;
  orderIndex: number;
  place?: {
    id: number;
    nameAr: string;
    nameEn: string;
    category: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface ShareResponse {
  shareUrl: string;
  shareToken: string;
  itinerary: Itinerary;
}

export const itinerariesService = {
  // Get user's itineraries
  getUserItineraries: async (params?: {
    page?: number;
    limit?: number;
    isPublic?: boolean;
  }): Promise<{ data: Itinerary[]; count: number; pagination: any }> => {
    const response = await apiClient.get('/itineraries/me', { params });
    return response.data;
  },

  // Get public itineraries
  getPublicItineraries: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Itinerary[]; count: number; pagination: any }> => {
    const response = await apiClient.get('/itineraries/public', { params });
    return response.data;
  },

  // Get single itinerary
  getItinerary: async (id: number): Promise<Itinerary> => {
    const response = await apiClient.get(`/itineraries/${id}`);
    return response.data.data;
  },

  // Create itinerary
  createItinerary: async (data: {
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    startDate: string;
    endDate: string;
    isPublic?: boolean;
    days?: any[];
  }): Promise<Itinerary> => {
    const response = await apiClient.post('/itineraries', data);
    return response.data.data;
  },

  // Update itinerary
  updateItinerary: async (id: number, data: Partial<Itinerary>): Promise<Itinerary> => {
    const response = await apiClient.put(`/itineraries/${id}`, data);
    return response.data.data;
  },

  // Delete itinerary
  deleteItinerary: async (id: number): Promise<void> => {
    await apiClient.delete(`/itineraries/${id}`);
  },

  // Like itinerary
  likeItinerary: async (id: number): Promise<{ likesCount: number }> => {
    const response = await apiClient.post(`/itineraries/${id}/like`);
    return response.data.data;
  },

  // Share itinerary
  shareItinerary: async (id: number): Promise<ShareResponse> => {
    const response = await apiClient.get(`/itineraries/${id}/share`);
    return response.data.data;
  },

  // Copy itinerary
  copyItinerary: async (id: number): Promise<Itinerary> => {
    const response = await apiClient.post(`/itineraries/${id}/copy`);
    return response.data.data;
  },

  // Add day to itinerary
  addDayToItinerary: async (id: number, data: {
    dayNumber: number;
    date?: string;
    titleAr?: string;
    titleEn?: string;
    notes?: string;
  }): Promise<ItineraryDay> => {
    const response = await apiClient.post(`/itineraries/${id}/days`, data);
    return response.data.data;
  },

  // Add item to day
  addItemToDay: async (dayId: number, data: {
    placeId: number;
    startTime?: string;
    endTime?: string;
    transportMode?: string;
    notes?: string;
    orderIndex?: number;
  }): Promise<ItineraryItem> => {
    const response = await apiClient.post(`/itineraries/days/${dayId}/items`, data);
    return response.data.data;
  },
};
