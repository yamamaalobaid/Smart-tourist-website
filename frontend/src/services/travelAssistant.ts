import apiClient from './api';

export interface EmergencyInfo {
  police: string;
  ambulance: string;
  fire: string;
  embassy: string;
  medicalTips: string;
  languages: string[];
}

export interface ShoppingItem {
  id: number;
  name: string;
  type: string;
  available: boolean;
  shop: string;
}

export interface TransportOption {
  provider: string;
  eta: string;
  cost: string;
  type: string;
}

export interface HealthFacility {
  name: string;
  type: string;
  insuranceAccepted: boolean;
  distance: string;
}

export interface MedicationSchedule {
  id: string;
  userId: number;
  medicationName: string;
  dosage: string;
  schedule: any;
  timezone: string;
  createdAt: string;
}

export interface Vaccination {
  name: string;
  recommended: boolean;
}

export interface LuggageRequest {
  id: string;
  userId?: number;
  from: string;
  to: string;
  status: string;
  createdAt: string;
}

export interface AnalyticsReport {
  range: string;
  expenses: number;
  placesVisited: number;
  reviewsWritten: number;
}

export interface Recommendation {
  id: number;
  name: string;
  category: string;
  reason: string;
}

export interface TimeMirrorData {
  placeId: string;
  year: number;
  currentImage: string;
  historicalImage: string;
  description: string;
}

export const travelAssistantService = {
  // Emergency services
  getEmergencyInfo: async (country?: string): Promise<EmergencyInfo> => {
    const response = await apiClient.get('/utility/emergency', {
      params: { country },
    });
    return response.data.data;
  },

  getEmergencyCallLink: async (type: string, country?: string): Promise<any> => {
    const response = await apiClient.get('/utility/emergency/call', {
      params: { type, country },
    });
    return response.data.data;
  },

  // Shopping
  searchShopping: async (product?: string): Promise<ShoppingItem[]> => {
    const response = await apiClient.get('/utility/shopping', {
      params: { product },
    });
    return response.data.data;
  },

  airportPickupOrder: async (data: {
    userId: number;
    products: string[];
    pickupAirport: string;
    hotel: string;
  }): Promise<any> => {
    const response = await apiClient.post('/utility/shopping/airport-pickup', data);
    return response.data;
  },

  // Transport
  getTransportOptions: async (): Promise<TransportOption[]> => {
    const response = await apiClient.get('/utility/transport/options');
    return response.data.data;
  },

  bookTransport: async (data: {
    provider: string;
    pickupAddress: string;
    destination: string;
  }): Promise<any> => {
    const response = await apiClient.post('/utility/transport/book', data);
    return response.data;
  },

  // Health
  getNearbyHealthFacilities: async (): Promise<HealthFacility[]> => {
    const response = await apiClient.get('/utility/health/nearby');
    return response.data.data;
  },

  addMedicationSchedule: async (data: {
    userId: number;
    medicationName: string;
    dosage: string;
    schedule: any;
    timezone?: string;
  }): Promise<MedicationSchedule> => {
    const response = await apiClient.post('/utility/health/medications', data);
    return response.data.data;
  },

  getMedicationSchedules: async (userId?: number): Promise<MedicationSchedule[]> => {
    const response = await apiClient.get('/utility/health/medications', {
      params: { userId },
    });
    return response.data.data;
  },

  getRequiredVaccinations: async (destination?: string): Promise<Vaccination[]> => {
    const response = await apiClient.get('/utility/health/vaccines', {
      params: { dest: destination },
    });
    return response.data.data;
  },

  // Luggage
  requestLuggageDelivery: async (data: {
    userId: number;
    from: string;
    to: string;
  }): Promise<LuggageRequest> => {
    const response = await apiClient.post('/utility/luggage/request', data);
    return response.data.data;
  },

  trackLuggage: async (id: string): Promise<LuggageRequest> => {
    const response = await apiClient.get(`/utility/luggage/${id}/track`);
    return response.data.data;
  },

  // Analytics
  getAnalyticsReport: async (range?: string): Promise<AnalyticsReport> => {
    const response = await apiClient.get('/utility/analytics/report', {
      params: { range },
    });
    return response.data.data;
  },

  getPersonalRecommendations: async (): Promise<Recommendation[]> => {
    const response = await apiClient.get('/utility/analytics/recommendations');
    return response.data.data;
  },

  // Time Mirror
  getTimeMirror: async (placeId: string, year?: number): Promise<TimeMirrorData> => {
    const response = await apiClient.get(`/utility/time-mirror/${placeId}`, {
      params: { year },
    });
    return response.data.data;
  },
};
