/**
 * Authentication Redirect Utilities
 * Handles redirecting users when authentication fails
 */

import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

interface RedirectOptions {
  clearStorage?: boolean;
  redirectPath?: string;
  reason?: string;
}

/**
 * Redirect to login with proper cleanup
 */
export const redirectToLogin = (options: RedirectOptions = {}) => {
  const {
    clearStorage = true,
    redirectPath = '/auth/login',
    reason = 'Session expired'
  } = options;

  console.log(`🚪 Redirecting to login: ${reason}`);

  // Clear authentication state
  if (clearStorage) {
    const authStore = useAuthStore.getState();
    authStore.logout();
    
    // Clear any session storage items
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('paymentBannerDismissed');
      sessionStorage.removeItem('lastPaymentBannerUserId');
      sessionStorage.removeItem('welcomeCardDismissed');
      sessionStorage.removeItem('lastUserId');
      sessionStorage.removeItem('vmWelcomeCardDismissed');
      sessionStorage.removeItem('lastVmWelcomeCardUserId');
    }
  }

  // Redirect to login page
  if (typeof window !== 'undefined') {
    // Add a small delay to ensure state is cleared
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 100);
  }
};

/**
 * Hook to handle authentication redirects
 */
export const useAuthRedirect = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleAuthFailure = (reason: string = 'Authentication failed') => {
    console.log(`🚪 Authentication failure: ${reason}`);
    
    // Clear authentication state
    logout();
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('paymentBannerDismissed');
      sessionStorage.removeItem('lastPaymentBannerUserId');
      sessionStorage.removeItem('welcomeCardDismissed');
      sessionStorage.removeItem('lastUserId');
      sessionStorage.removeItem('vmWelcomeCardDismissed');
      sessionStorage.removeItem('lastVmWelcomeCardUserId');
    }

    // Redirect to login
    router.push('/auth/login');
  };

  return { handleAuthFailure };
};

/**
 * Check if user should be redirected based on authentication state
 */
export const shouldRedirectToLogin = (): boolean => {
  const { isAuthenticated, token } = useAuthStore.getState();
  
  // If not authenticated or no token, should redirect
  if (!isAuthenticated || !token) {
    return true;
  }

  // Additional validation could be added here
  return false;
};