/**
 * Authentication Provider Component
 * Sets up automatic token refresh and authentication interceptors
 */

'use client';
import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { setupAuthInterceptors, validateAndRefreshToken, setupPeriodicTokenCheck } from '@/utils/authInterceptor';
import { redirectToLogin, shouldRedirectToLogin } from '@/utils/authRedirect';
import useAuthStore from '@/store/useAuthStore';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated, syncWithCookies } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on an auth page (where we shouldn't redirect)
  const isAuthPage = pathname?.startsWith('/auth/');

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initializeAuth = async () => {
      console.log('🔐 Initializing authentication system...');
      
      // Sync with cookies on app start
      syncWithCookies();
      
      // Setup axios interceptors for automatic token management
      setupAuthInterceptors();
      
      // Check if we should redirect to login immediately
      if (!isAuthPage && shouldRedirectToLogin()) {
        console.log('🚪 No valid authentication, redirecting to login');
        redirectToLogin({ reason: 'No valid authentication found' });
        return;
      }
      
      // Validate current token if user is authenticated
      if (isAuthenticated) {
        console.log('👤 User authenticated, validating token...');
        const isValid = await validateAndRefreshToken();
        
        if (!isValid) {
          console.log('❌ Token validation failed, redirecting to login');
          if (!isAuthPage) {
            redirectToLogin({ reason: 'Token validation failed' });
            return;
          }
        } else {
          console.log('✅ Token validation successful');
        }
        
        // Setup periodic token refresh check
        cleanup = setupPeriodicTokenCheck();
        console.log('⏰ Periodic token refresh check enabled');
      }
      
      console.log('✅ Authentication system initialized');
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (cleanup) {
        cleanup();
        console.log('🧹 Authentication cleanup completed');
      }
    };
  }, [isAuthenticated, syncWithCookies, isAuthPage]);

  // Re-setup periodic check when authentication status changes
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    if (isAuthenticated) {
      cleanup = setupPeriodicTokenCheck();
      console.log('⏰ Periodic token refresh check re-enabled');
    }
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isAuthenticated]);

  // Handle authentication state changes
  useEffect(() => {
    if (!isAuthPage && !isAuthenticated) {
      console.log('🚪 User not authenticated, redirecting to login');
      redirectToLogin({ reason: 'User not authenticated' });
    }
  }, [isAuthenticated, isAuthPage]);

  return <>{children}</>;
};

export default AuthProvider;