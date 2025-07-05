/**
 * Authentication Interceptor with Automatic Token Refresh
 * Handles JWT token expiration and refresh automatically
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosServices from '@/utils/axios';
import { decoder } from '@/utils';
import useAuthStore from '@/store/useAuthStore';
import { redirectToLogin } from '@/utils/authRedirect';

// Configuration
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const MAX_RETRY_ATTEMPTS = 3;

interface RefreshTokenResponse {
  token: string;
  refresh_token?: string;
  user?: any;
}

interface TokenPayload {
  exp: number;
  iat: number;
  userId: string;
  email: string;
  role: string;
}

/**
 * Check if token is expired or expiring soon
 */
export const isTokenExpiring = (token: string): boolean => {
  try {
    const decoded = decoder(token) as TokenPayload;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now();
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const timeUntilExpiry = expiryTime - currentTime;
    
    return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true; // Assume expired if we can't decode
  }
};

/**
 * Check if token is completely expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decoder(token) as TokenPayload;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now();
    const expiryTime = decoded.exp * 1000;
    
    return currentTime >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Refresh JWT token using refresh token
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const { token, refresh_token } = useAuthStore.getState();
    
    if (!refresh_token) {
      console.warn('No refresh token available');
      return null;
    }

    console.log('🔄 Refreshing JWT token...');
    
    const response = await axios.post<RefreshTokenResponse>(
      `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/auth/refresh`,
      { refresh_token },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Include current token for verification
        }
      }
    );

    const { token: newToken, refresh_token: newRefreshToken, user } = response.data;
    
    if (!newToken) {
      throw new Error('No new token received from refresh endpoint');
    }

    // Update auth store with new tokens
    const authStore = useAuthStore.getState();
    authStore.setToken(newToken, newRefreshToken || refresh_token);
    
    if (user) {
      authStore.setUser(user);
    }

    console.log('✅ JWT token refreshed successfully');
    return newToken;

  } catch (error: any) {
    console.error('❌ Token refresh failed:', error.message);
    
    // If refresh fails, the token is likely invalid - logout user
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🚪 Refresh token invalid, logging out user');
      redirectToLogin({ reason: 'Refresh token invalid' });
    }
    
    return null;
  }
};

/**
 * Setup axios interceptors for automatic token management
 */
export const setupAuthInterceptors = () => {
  // Setup interceptors on both the main axios instance and our custom axiosServices
  const setupInterceptor = (axiosInstance: typeof axios) => {
    // Request interceptor - add token and refresh if needed
    axiosInstance.interceptors.request.use(
    async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        return config;
      }

      // Check if token needs refresh before making request
      if (isTokenExpiring(token)) {
        console.log('🔄 Token expiring soon, attempting refresh before request');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Use the new token for this request
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          // Refresh failed, redirect to login
          console.log('🚪 Token refresh failed, redirecting to login');
          redirectToLogin({ reason: 'Token refresh failed during request' });
          return config;
        }
      } else {
        // Token is still valid, use it
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

    // Response interceptor - handle 401 errors with automatic retry
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retryCount?: number };
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && originalRequest) {
          const retryCount = originalRequest._retryCount || 0;
          
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            originalRequest._retryCount = retryCount + 1;
            
            console.log(`🔄 401 error, attempting token refresh (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
            
            const newToken = await refreshToken();
            
            if (newToken) {
              // Retry the original request with new token
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              console.log('🔁 Retrying original request with new token');
              return axiosInstance(originalRequest);
            }
          }
          
          // Max retries exceeded or refresh failed
          console.log('🚪 Max retries exceeded or refresh failed, redirecting to login');
          redirectToLogin({ reason: 'Max retries exceeded or refresh failed' });
        }

        // For development, log API errors  
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', error.response?.data || error.message);
        }

        return Promise.reject(error);
      }
    );
  };

  // Setup interceptors on both axios instances
  setupInterceptor(axios);
  setupInterceptor(axiosServices);

  console.log('✅ Authentication interceptors setup complete');
};

/**
 * Manual token validation and refresh
 * Call this on app startup or when needed
 */
export const validateAndRefreshToken = async (): Promise<boolean> => {
  const { token, isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated || !token) {
    return false;
  }

  if (isTokenExpired(token)) {
    console.log('🔄 Token expired, attempting refresh');
    const newToken = await refreshToken();
    return !!newToken;
  }

  if (isTokenExpiring(token)) {
    console.log('🔄 Token expiring soon, refreshing proactively');
    const newToken = await refreshToken();
    return !!newToken;
  }

  console.log('✅ Token is valid');
  return true;
};

/**
 * Setup periodic token refresh check
 */
export const setupPeriodicTokenCheck = (): () => void => {
  const checkInterval = setInterval(async () => {
    const { isAuthenticated } = useAuthStore.getState();
    
    if (isAuthenticated) {
      await validateAndRefreshToken();
    }
  }, 2 * 60 * 1000); // Check every 2 minutes

  // Return cleanup function
  return () => clearInterval(checkInterval);
};

export default {
  setupAuthInterceptors,
  validateAndRefreshToken,
  setupPeriodicTokenCheck,
  isTokenExpiring,
  isTokenExpired,
  refreshToken
};