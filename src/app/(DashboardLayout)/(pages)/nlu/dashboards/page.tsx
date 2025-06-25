"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import DashboardCard from "@/app/components/shared/DashboardCard";
import useAuthStore from "@/store/useAuthStore";

export default function DashboardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();
  const { user, roles, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        setDebugInfo("User not authenticated, redirecting to login");
        router.push('/auth/login');
        return;
      }

      setDebugInfo(`Checking roles: "${roles}", user_type: "${user?.user_type}"`);

      // Check user role - multiple ways to detect customer
      let isCustomer = false;

      // Method 1: Check roles from auth store
      if (roles) {
        const userRoles = roles.toLowerCase();
        isCustomer = userRoles.includes('customer');
        setDebugInfo(`Roles check: "${userRoles}" - isCustomer: ${isCustomer}`);
      }

      // Method 2: Check user_type if roles not available
      if (!isCustomer && user?.user_type) {
        isCustomer = user.user_type.toLowerCase() === 'customer';
        setDebugInfo(`User type check: "${user.user_type}" - isCustomer: ${isCustomer}`);
      }

      // Method 3: Check userRoles array from user object
      if (!isCustomer && user?.userRoles?.length) {
        const roleNames = user.userRoles.map(ur => ur.role.name.toLowerCase());
        isCustomer = roleNames.some(role => role.includes('customer'));
        setDebugInfo(`UserRoles check: "${roleNames.join(', ')}" - isCustomer: ${isCustomer}`);
      }

      // Redirect if customer
      if (isCustomer) {
        setDebugInfo("User is customer, redirecting to customer dashboard");
        router.push('/nlu/dashboards/customer');
        return;
      }

      // For non-customer users, show the default dashboard
      setDebugInfo("User is not customer, showing default dashboard");
      setIsLoading(false);
    };

    checkUserAndRedirect();
  }, [isAuthenticated, roles, user, router]);

  // Show loading while checking authentication and roles
  if (isLoading) {
    return (
      <PageContainer title="Loading..." description="Checking user permissions">
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="400px"
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
          {debugInfo && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {debugInfo}
            </Typography>
          )}
        </Box>
      </PageContainer>
    );
  }

  // Default dashboard for non-customer users
  return (
    <PageContainer title="Dashboard" description="Welcome to your dashboard">
      <DashboardCard title="Welcome">
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.firstName} {user?.lastName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          You are logged in as: {roles || 'User'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          This is the default dashboard view. Customer users are automatically redirected to their specialized dashboard.
        </Typography>
        {debugInfo && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
            Debug: {debugInfo}
          </Typography>
        )}
      </DashboardCard>
    </PageContainer>
  );
}
