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
  image?: {
    imageUrl?: string;
    isPrimary?: boolean;
  } | null;
  distanceKm?: number | null;
}

export const PLACE_CATEGORY_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'historic', label: 'تاريخي' },
  { value: 'mosque,church', label: 'ديني' },
  { value: 'park,garden', label: 'طبيعي' },
  { value: 'museum,theater,market', label: 'تعليمي وثقافي' },
  { value: 'restaurant,cafe,hotel,spa', label: 'ترفيهي وخدمات' },
];

const normalizePlace = (place: any): Place => {
  const fallbackImage = place?.image?.imageUrl || place?.mainImage?.imageUrl;
  const normalizedImages = Array.isArray(place?.images)
    ? place.images
    : fallbackImage
      ? [{ id: 0, imageUrl: fallbackImage, isPrimary: true }]
      : [];

  return {
    ...place,
    id: place?.id || place?._id,
    _id: place?._id || place?.id,
    featuredImage: place?.featuredImage || fallbackImage,
    images: normalizedImages,
  } as Place;
};

export const placeService = {
  getPlaces: async (params?: any) => {
    const response = await apiClient.get<{ data: Place[] }>('/places', { params });
    const places = response.data.data || response.data || [];
    return Array.isArray(places) ? places.map(normalizePlace) : [];
  },

  getPlaceById: async (id: string) => {
    const response = await apiClient.get<{ data: Place }>(`/places/${id}`);
    return normalizePlace(response.data.data || response.data);
  },

  searchPlaces: async (params?: any) => {
    // params can include: search, category, minRating, priceRange, sortBy, limit, page, etc.
    const response = await apiClient.get<{ data: Place[] }>('/places', { params });
    const places = response.data.data || response.data || [];
    return Array.isArray(places) ? places.map(normalizePlace) : [];
  },

  getPlacesByCategory: async (category: string) => {
    const response = await apiClient.get<{ data: Place[] }>('/places', {
      params: { category }
    });
    const places = response.data.data || response.data || [];
    return Array.isArray(places) ? places.map(normalizePlace) : [];
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
