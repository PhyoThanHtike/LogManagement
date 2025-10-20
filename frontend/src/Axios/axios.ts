import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor - only retry on 5xx errors, NOT 4xx
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // Don't retry on client errors (4xx) - throw immediately
    if (response?.status >= 400 && response?.status < 500) {
      return Promise.reject(error);
    }

    // Retry logic only for 5xx errors and network errors
    if (!config) return Promise.reject(error);

    config.retryCount = config.retryCount || 0;
    const maxRetries = 3;

    if (
      (!response || response.status >= 500) &&
      config.retryCount < maxRetries
    ) {
      config.retryCount++;
      const delay = Math.pow(2, config.retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;