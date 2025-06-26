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
      if (!isAuthenticated) {
        setDebugInfo("User not authenticated, redirecting to login");
        router.push("/auth/login");
        return;
      }

      setDebugInfo(`Checking roles: "${roles}", userType: "${user?.userType}"`);

      let isCustomer = false;

      // Method 1: Check roles from store
      if (roles) {
        const userRoles = roles.toLowerCase();
        isCustomer = userRoles.includes("customer");
        setDebugInfo(`Roles check: "${userRoles}" - isCustomer: ${isCustomer}`);
      }

      // Method 2: Check userType
      if (!isCustomer && user?.userType) {
        isCustomer = user.userType.toLowerCase() === "customer";
        setDebugInfo(`User type check: "${user.userType}" - isCustomer: ${isCustomer}`);
      }

      // Method 3: Check roles[] directly for role name containing 'customer'
      if (!isCustomer && user?.roles?.length) {
        const roleNames = user.roles.map(r => r.role.name.toLowerCase());
        isCustomer = roleNames.some(role => role.includes("customer"));
        setDebugInfo(`Roles array check: "${roleNames.join(", ")}" - isCustomer: ${isCustomer}`);
      }

      if (isCustomer) {
        setDebugInfo("User is customer, redirecting to customer dashboard");
        router.push("/nlu/dashboards/customer");
        return;
      }

      setDebugInfo("User is not customer, showing default dashboard");
      setIsLoading(false);
    };

    checkUserAndRedirect();
  }, [isAuthenticated, roles, user, router]);

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

  return (
    <PageContainer title="Dashboard" description="Welcome to your dashboard">
      <DashboardCard title="Welcome">
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.firstName} {user?.lastName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          You are logged in as: {roles || "User"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          This is the default dashboard view. Customer users are automatically redirected to their
          specialized dashboard.
        </Typography>
        {debugInfo && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: "italic" }}>
            Debug: {debugInfo}
          </Typography>
        )}
      </DashboardCard>
    </PageContainer>
  );
}
