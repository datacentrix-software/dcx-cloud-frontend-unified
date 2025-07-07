import axios from 'axios';

// Single unified backend URL
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.backend.test.daas.datacentrix.cloud';

// Create single axios instance for all API calls
const axiosServices = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for auth tokens
axiosServices.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosServices.interceptors.response.use(
  (response) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log errors appropriately
    if (process.env.NODE_ENV === 'development') {
      console.error(`✗ API Error [${error.response?.status || 'Network'}]:`, {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      });
    } else {
      // Production: Only log essential error info
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || 'Request failed'
      });
    }
    
    return Promise.reject(error);
  }
);

// Export single axios instance (remove axiosCloudServices)
export default axiosServices;

// For backward compatibility during transition
export { axiosServices as axiosCloudServices };