"use client";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import PageContainer from "@/app/components/container/PageContainer";
// components
// import SalesOverview from "@/app/components/dashboard/SalesOverview";
// import YearlyBreakup from "@/app/components/dashboard/YearlyBreakup";
// import RecentTransactions from "@/app/components/dashboard/RecentTransactions";
// import ProductPerformance from "@/app/components/dashboard/ProductPerformance";
// import Blog from "@/app/components/dashboard/Blog";
// import MonthlyEarnings from "@/app/components/dashboard/MonthlyEarnings";

export default function Dashboard() {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          {/* Dashboard content will go here */}
          <Grid size={12}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <h1>Welcome to Dashboard</h1>
              <p>Dashboard content coming soon...</p>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}