import axios from 'axios';

/**
 * Creates an axios instance with predefined configuration
 * @param config - Axios configuration options
 * @returns Axios instance
 */
export const createApi = (config = {}) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
  
  const api = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds default timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...config,
  });
  
  // Add interceptors for logging
  api.interceptors.request.use(
    (config) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );
  
  api.interceptors.response.use(
    (response) => {
      console.log(`[API] Response: ${response.status}`);
      return response;
    },
    (error) => {
      console.error('[API Response Error]', error.response?.status, error.message);
      return Promise.reject(error);
    }
  );
  
  return api;
};

/**
 * Creates an API client instance with authentication
 * @param token - JWT token for authentication
 * @param config - Additional axios configuration
 * @returns Authenticated axios instance
 */
export const createAuthApi = (token, config = {}) => {
  const api = createApi(config);
  
  // Add authorization header
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return api;
}; 