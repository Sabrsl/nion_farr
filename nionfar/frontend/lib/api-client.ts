import axios from 'axios';

/**
 * Creates an axios instance with predefined configuration
 * @param config - Axios configuration options
 * @returns Axios instance
 */
export const createApi = (config = {}) => {
  return axios.create({
    timeout: 30000, // 30 seconds default timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...config,
  });
}; 