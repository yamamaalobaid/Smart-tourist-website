import apiClient from './api';

export interface Place {
  id?: string;
  _id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  category: string;
  addressAr?: string;
  addressEn?: string;
  featuredImage?: string;
  averageRating: number;
  totalReviews: number;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  entryFee?: number;
  createdAt?: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
  images?: Array<{
    id: number;
    imageUrl: string;
    isPrimary: boolean;
  }>;
}

export const placeService = {
  getPlaces: async (params?: any) => {
    const response = await apiClient.get<{ data: Place[] }>('/places', { params });
    return response.data.data || response.data;
  },

  getPlaceById: async (id: string) => {
    const response = await apiClient.get<{ data: Place }>(`/places/${id}`);
    return response.data.data || response.data;
  },

  searchPlaces: async (params?: any) => {
    // params can include: search, category, minRating, priceRange, sortBy, limit, page, etc.
    const response = await apiClient.get<{ data: Place[] }>('/places', { params });
    return response.data.data || response.data;
  },

  getPlacesByCategory: async (category: string) => {
    const response = await apiClient.get<{ data: Place[] }>('/places', {
      params: { category }
    });
    return response.data.data || response.data;
  },
  // Favorites
  getFavorites: async () => {
    const response = await apiClient.get<{ data: any[] }>('/favorites');
    return response.data.data || response.data;
  },

  addFavorite: async (placeId: string) => {
    const response = await apiClient.post(`/places/${placeId}/favorites`);
    return response.data;
  },

  removeFavorite: async (placeId: string) => {
    const response = await apiClient.delete(`/places/${placeId}/favorites`);
    return response.data;
  },
};
