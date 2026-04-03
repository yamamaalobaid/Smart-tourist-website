import axios from 'axios';

// Read base URL from Vite env, fallback to the app backend port 5001
const API_BASE_URL = (import.meta?.env?.VITE_API_URL as string) || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- axios types can be broad here
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { apiClient };
export default apiClient;
