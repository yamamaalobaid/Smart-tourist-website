import apiClient from './api';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  // Register new user
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Login with identifier: accepts email or phone
  loginWithIdentifier: async (identifier: string, password: string): Promise<AuthResponse> => {
    const payload: any = { password };
    // naive check: if contains @ treat as email
    if (identifier.includes('@')) payload.email = identifier;
    else payload.phone = identifier;

    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    language?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; user: User; message: string }> => {
    const response = await apiClient.put<{ success: boolean; user: User; message: string }>(
      '/auth/profile',
      data
    );
    return response.data;
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      '/auth/change-password',
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  // Reset password
  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/auth/reset-password/${token}`,
      { password }
    );
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string; user: User }> => {
    const response = await apiClient.post<{ success: boolean; message: string; user: User }>(
      `/auth/verify-email/${token}`
    );
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/resend-verification',
      { email }
    );
    return response.data;
  },

  // Logout (client-side cleanup)
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
